package ro.licenta.taberemanager.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.dto.InscriereDTO;
import ro.licenta.taberemanager.dto.InscriereDetaliiDTO;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Tabara;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.TabaraRepository;
import ro.licenta.taberemanager.service.BugetService;
import ro.licenta.taberemanager.service.InscriereService;
import ro.licenta.taberemanager.service.UserServiceInterface;
import ro.licenta.taberemanager.service.WaitlistEmailService;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/inscrieri")
public class InscriereController {

    private final InscriereRepository repository;
    private final TabaraRepository tabaraRepository;
    private final WaitlistEmailService waitlistEmailService;
    private final InscriereService inscriereService;
    private final BugetService bugetService;
    private final UserServiceInterface userService;
    // ParticipantRepository și UserRepository eliminate — folosim serviciile lor

    public InscriereController(InscriereRepository repository,
                               TabaraRepository tabaraRepository,
                               WaitlistEmailService waitlistEmailService,
                               InscriereService inscriereService,
                               BugetService bugetService,
                               UserServiceInterface userService) {
        this.repository = repository;
        this.tabaraRepository = tabaraRepository;
        this.waitlistEmailService = waitlistEmailService;
        this.inscriereService = inscriereService;
        this.bugetService = bugetService;
        this.userService = userService;
    }

    @GetMapping("/lista")
    @ResponseBody
    public List<Inscriere> getAllRegistrations() {
        return repository.findAll();
    }

    //Cautare Activitate dupa id
    @GetMapping("/{id}")
    @ResponseBody
    public Inscriere getRegistrationById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inregistrarea nu a fost gasita"));
    }

    //PAginare Activitatei
    @GetMapping("/paginat")
    @ResponseBody
    public Page<Inscriere> getRegistrations(Pageable pageable) {
        return repository.findAll(pageable);
    }

    //creare
    @PostMapping("/creare")
    @ResponseBody
    public Inscriere createRegistration(@Valid @RequestBody Inscriere inscriere) {
        return repository.save(inscriere);
    }
/*
    // Soft-delete: setează ANULAT + înregistrează rambursare
    @DeleteMapping("/stergere/{id}")
    @ResponseBody
    public void deleteRegistration(@PathVariable Long id) {
        repository.findById(id).ifPresent(inscriere -> {
            inscriere.setStatut("ANULAT");
            Inscriere salvata = repository.save(inscriere);
            // Înregistrează rambursarea și trimite email de confirmare anulare
            userService.findAllUsers().stream()
                    .filter(u -> u.getId().equals(salvata.getIdPlatitor()))
                    .findFirst()
                    .ifPresent(user -> bugetService.inregistreazaAnulare(salvata.getId(), user.getEmail()));
        });
    }
    */


    // Găsește taberele coordonatorului, returnează înscrierile din ele
    @GetMapping("/coordonator/{idCoordonator}")
    public List<Inscriere> getInscrieriCoordonator(@PathVariable Long idCoordonator) {
        // Găsește taberele coordonatorului, returnează înscrierile din ele
        List<Tabara> tabere = tabaraRepository.findByIdCoordonatorPrincipal(idCoordonator);
        return tabere.stream()
                .flatMap(t -> repository.findByTabaraId(t.getId()).stream())
                .collect(Collectors.toList());
    }

    //confimare manuala a înscrierii de către coordonator
    @PutMapping("/confirma/{id}")
    public Inscriere confirmaInscriere(@PathVariable Long id) {
        return repository.findById(id)
                .map(inscriere -> {
                    //nu se cofiram daca nu e platita
                    if ("NEPLATIT".equals(inscriere.getStatusPlata())) {
                        throw new RuntimeException("Eroare: Nu poți confirma o înscriere neplătită!");
                    }
                    inscriere.setStatut("CONFIRMAT");
                    return repository.save(inscriere);
                })
                .orElseThrow(() -> new RuntimeException("Înscrierea cu ID-ul " + id + " nu a fost găsită"));
    }

    //respingere inscriere daca un coordonator a gasit probleme la o inscriere (date incorecte, duplicat etc.)
    //se aplica DOAR pe inscrieri deja platite — daca era platita, se inregistreaza automat o rambursare
    @PutMapping("/respinge/{id}")
    public Inscriere respingeInscriere(@PathVariable Long id) {
        return repository.findById(id)
                .map(inscriere -> {
                    inscriere.setStatut("ANULAT");
                    Inscriere salvata = repository.save(inscriere);
                    // Înregistrează rambursare (daca era platita) + trimite email prin BugetService
                    String emailPlatitor = userService.findUserById(salvata.getIdPlatitor()).getEmail();
                    bugetService.inregistreazaAnulare(salvata.getId(), emailPlatitor);
                    return salvata;
                })
                .orElseThrow(() -> new RuntimeException("Înscriere negăsită"));
    }

    //actualizare inscriere
    @PutMapping("/actualizare/{id}")
    public Inscriere updateRegistration(@PathVariable Long id, @Valid @RequestBody Inscriere updatedRegistration) {
        return repository.findById(id)
                .map(registration -> {
                    // Se verifica si se memoreaza dacă se face trecerea din Waitlist în Pending
                    boolean approvedFromWaitlist = "WAITLIST".equals(registration.getStatut()) &&
                            "PENDING".equals(updatedRegistration.getStatut());

                    //verificare daca vrea sa abrobe un Waitlist
                    if ("WAITLIST".equals(registration.getStatut()) &&
                            ("PENDING".equals(updatedRegistration.getStatut()) || "CONFIRMAT".equals(updatedRegistration.getStatut()))) {

                        // Căutare manuala câți sunt PENDING sau CONFIRMAT în acea tabără
                        long locuriOcupate = repository.findAll().stream()
                                .filter(i -> i.getTabara() != null && i.getTabara().getId().equals(registration.getTabara().getId()))
                                .filter(i -> "PENDING".equals(i.getStatut()) || "CONFIRMAT".equals(i.getStatut()))
                                .count();

                        long capacitateMaxima = registration.getTabara().getCapacitate().longValue();

                        if (locuriOcupate >= capacitateMaxima) {
                            throw new RuntimeException("Nu poți aproba! Tabăra este plină. Trebuie să anulezi un alt participant mai întâi.");
                        }
                    }

                    registration.setDataInscriere(updatedRegistration.getDataInscriere());
                    registration.setDataPlata(updatedRegistration.getDataPlata());
                    registration.setStatut(updatedRegistration.getStatut());
                    registration.setSuma(updatedRegistration.getSuma());
                    registration.setIdPlatitor(updatedRegistration.getIdPlatitor());
                    registration.setStatusPlata(updatedRegistration.getStatusPlata());
                    registration.setParticipant(updatedRegistration.getParticipant());
                    registration.setTabara(updatedRegistration.getTabara());

                    //salvare obiectul în baza de date și se pastreaza într-o variabilă
                    Inscriere savedRegistration = repository.save(registration);

                    // apelare serviciul de email doar dacă a fost aprobat
                    if (approvedFromWaitlist) {
                        waitlistEmailService.sendWaitlistApprovalEmail(savedRegistration.getId());
                    }

                    // returnare obiectul salvat
                    return savedRegistration;
                })
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
    }

    //salvarea dubla dupa completare formular inscriere-> in tabela partcipant si tabela inscriere
    @PostMapping("/save-completa")
    public Inscriere saveInscriereCompleta(@Valid @RequestBody InscriereDTO dto) {
        return inscriereService.creeazaInscriereCompleta(dto);
    }

    @GetMapping("/locuri-disponibile/{tabaraId}")
    public ResponseEntity<Long> getLocuriDisponibile(@PathVariable Long tabaraId) {
        Tabara tabara = tabaraRepository.findById(tabaraId)
                .orElseThrow(() -> new RuntimeException("Tabara nu exista"));
        long inscrieri = repository.countByTabaraId(tabaraId);
        long disponibile = tabara.getCapacitate().longValue() - inscrieri;
        return ResponseEntity.ok(disponibile > 0 ? disponibile : 0);
    }

    @GetMapping("/istoric/{idPlatitor}")
    public List<InscriereDetaliiDTO> getIstoricUserRegistrations(@PathVariable Long idPlatitor) {
        return repository.findDetailedInscrieri(idPlatitor);
    }

    @GetMapping(value = "/factura/{id}", produces = "application/pdf")
    public void genereazaFacturaPDF(@PathVariable Long id, HttpServletResponse response) throws IOException {
        Inscriere inscriere = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscrierea nu exista"));

        // Setăm browserul să știe că primește un PDF
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"factura_inscriere_" + id + ".pdf\"");

        // Deschidem o "foaie" albă
        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        // Desenăm textul pe foaie
        document.add(new Paragraph("FACTURA PROFORMA - SISTEM TABERE"));
        document.add(new Paragraph("--------------------------------------------------"));
        document.add(new Paragraph("Numar Inscriere: #" + inscriere.getId()));
        document.add(new Paragraph("Tabara: " + inscriere.getTabara().getNume()));
        document.add(new Paragraph("Participant: " + inscriere.getParticipant().getNume() + " " + inscriere.getParticipant().getPrenume()));
        document.add(new Paragraph("Suma de plata: " + inscriere.getSuma() + " RON"));
        document.add(new Paragraph("Status Plata: " + inscriere.getStatusPlata()));
        document.add(new Paragraph("Data Inscriere: " + inscriere.getDataInscriere()));
        document.add(new Paragraph("--------------------------------------------------"));
        document.add(new Paragraph("Va multumim pentru inscriere!"));
        document.close();
    }

    @PostMapping("/upload-document/{id}")
    public ResponseEntity<String> uploadDocument(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            Inscriere inscriere = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Inscrierea nu exista"));

            // Validare — fisa medicala trebuie incarcata exclusiv ca PDF
            String contentType = file.getContentType();
            String numeOriginal = file.getOriginalFilename();
            boolean esteExtensiePdf = numeOriginal != null && numeOriginal.toLowerCase().endsWith(".pdf");
            boolean esteContentTypePdf = "application/pdf".equals(contentType);

            if (!esteExtensiePdf || !esteContentTypePdf) {
                return ResponseEntity.badRequest()
                        .body("Fișa medicală trebuie încărcată exclusiv în format PDF.");
            }

            //se defineste unde se salveaza fisierele(care e folserul uploads din proeict
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdir(); //se creeaza folderul daca nu exista
            }
            /// curatare numele fisierului si il salvam
            String fileName = "Med_" + id + "_" + numeOriginal.replace(" ", "_");
            Path filePath = Paths.get(uploadDir + fileName);
            Files.write(filePath, file.getBytes());

            //Salvare doar numele in baza de date
            inscriere.setDocumentMedical(fileName);
            repository.save(inscriere);
            return ResponseEntity.ok("Fisier salvat cu succes!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Eroare la salvarea fisierului.");
        }
    }

    // se setează ANULAT + verificare perioadă tabără + (rambursare-inca nu)
    @DeleteMapping("/stergere/{id}")
    @ResponseBody
    public ResponseEntity<String> deleteRegistration(@PathVariable Long id) {
        try {
            inscriereService.sterge(id);
            return ResponseEntity.ok("Înscrierea a fost anulată cu succes.");
        } catch (RuntimeException e) {
            // Mesajul de eroare ajunge direct în frontend
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /// toate inscriereile admin
    @GetMapping("/toate")
    public List<Inscriere> getToare() {
        return repository.findAll();
    }

    // Descărcare protejată a fișei medicale — doar plătitorul înscrierii, coordonatorul sau adminul
    // Identitatea e extrasă din tokenul JWT (Authentication), nu din ce trimite clientul
    @GetMapping("/{id}/fisa-medicala")
    public ResponseEntity<?> descarcaFisaMedicala(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        Inscriere inscriere = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscrierea nu există"));

        String emailAutentificat = authentication.getName();
        ro.licenta.taberemanager.model.User userCurent = userService.findUserByEmail(emailAutentificat);
        if (userCurent == null) {
            return ResponseEntity.status(403).body("Utilizator invalid.");
        }

        boolean esteProprietar = userCurent.getId().equals(inscriere.getIdPlatitor());
        boolean esteStaff = userCurent.getIdRol() != null &&
                (userCurent.getIdRol().intValue() == 1 || userCurent.getIdRol().intValue() == 2);

        if (!esteProprietar && !esteStaff) {
            return ResponseEntity.status(403).body("Nu ai dreptul să accesezi acest document.");
        }

        if (inscriere.getDocumentMedical() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + inscriere.getDocumentMedical());
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=\"" + inscriere.getDocumentMedical() + "\"")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Eroare la citirea fișierului.");
        }
    }


}