package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.dto.InscriereDTO;
import ro.licenta.taberemanager.dto.InscriereDetaliiDTO;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.model.Tabara;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.InscriereRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import ro.licenta.taberemanager.repository.ParticipantRepository;
import ro.licenta.taberemanager.repository.TabaraRepository;
import ro.licenta.taberemanager.repository.UserRepository;
import ro.licenta.taberemanager.service.WaitlistEmailService;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/inscrieri")
public class InscriereController {

    private final InscriereRepository repository;
    private final ParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final TabaraRepository tabaraRepository;
    private final WaitlistEmailService waitlistEmailService;

    public InscriereController(InscriereRepository repository,ParticipantRepository participantRepository,UserRepository userRepository,TabaraRepository tabaraRepository, WaitlistEmailService waitlistEmailService){
        this.repository=repository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.tabaraRepository=tabaraRepository;
        this.waitlistEmailService=waitlistEmailService;

    }


    @GetMapping("/lista")
    @ResponseBody
    public List<Inscriere> getAllRegistrations(){
        return repository.findAll();
    }
  //Cautare Activitate dupa id
  @GetMapping("/{id}")
  @ResponseBody
  public Inscriere getRegistrationById(@PathVariable Long id){
      return repository.findById(id)
              .orElseThrow(()->new RuntimeException("Inregistrarea nu a fost gasita"));
  }
    //PAginare Activitatei
    @GetMapping("/paginat")
    @ResponseBody
    public Page<Inscriere> getRegistrations(Pageable pageable){
        return repository.findAll(pageable);
    }

    //creare
    @PostMapping("/creare")
    @ResponseBody
    public Inscriere createRegistration(@Valid @RequestBody  Inscriere inscriere)
    {
        return repository.save(inscriere);
    }

    @DeleteMapping("/stergere/{id}")
    @ResponseBody
    public void deleteRegistration(@PathVariable Long id)
    {
        repository.deleteById(id);
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

     //respingere inscriere daca un coordonator a gasit probleme la o inscriere
    @PutMapping("/respinge/{id}")
    public Inscriere respingeInscriere(@PathVariable Long id) {
        return repository.findById(id)
                .map(inscriere -> {
                    inscriere.setStatut("ANULAT");
                    return repository.save(inscriere);
                })
                .orElseThrow(() -> new RuntimeException("Înscriere negăsită"));
    }
   //actualizare inscriere
    @PutMapping("/actualizare/{id}")
    public Inscriere updateRegistration(@PathVariable Long id, @Valid @RequestBody Inscriere updatedRegistration){
        return repository.findById(id)
                .map(registration->{

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
                .orElseThrow(()-> new RuntimeException("Utilizatorul nu a fost gasit"));
    }

    @PostMapping("/save-completa")
    public Inscriere saveInscriereCompleta(@RequestBody InscriereDTO dto ) {
        Tabara tabaraVerificare = tabaraRepository.findById(dto.getIdTabara())
                .orElseThrow(()-> new RuntimeException("Tabara nu exista"));

        long inscrieriCurente = repository.countByTabaraId(tabaraVerificare.getId());
       String statusInscriere="PENDING";//status default

        if (tabaraVerificare.getCapacitate().longValue() - inscrieriCurente <= 0) {
          //daca s-au atins locurile maxime, nu se da eroare, ci il pune pe participant la waitlist
            statusInscriere="WAITLIST";
            System.out.println("Tabăra este plină. Participantul va fi pus pe WAITLIST.");
        }


        System.out.println("Email primit  trimis de react:[" + dto.getEmailUtilizator()+"]");
        //cautare user in bd dupa email de google pt a il lega de participant
        User user= userRepository.findByEmail(dto.getEmailUtilizator()).orElseThrow();

        System.out.println("DEBUG: Java a găsit în DB Userul: " + user.getEmail() + " cu ID: " + user.getId());

        Participant p;

        // Verificăm dacă React ne-a trimis un ID de participant existent (din dropdown)
        if (dto.getIdParticipant() != null) {
            System.out.println("S-a selectat un participant existent cu ID: " + dto.getIdParticipant());
            // Îl extragem din baza de date
            p = participantRepository.findById(dto.getIdParticipant())
                    .orElseThrow(() -> new RuntimeException("Participantul selectat nu există în DB!"));
        } else {
            System.out.println("Se creează un participant complet NOU.");
            // Doar dacă nu avem ID, creăm unul nou
            p = new Participant();
        }

        // Actualizăm sau setăm datele (în caz că părintele a schimbat un număr de telefon în formular)
        // 1. salveaza mai întâi participantul-toate datele
        p.setNume(dto.getNumeParticipant());
        p.setPrenume(dto.getPrenumeParticipant());
        p.setDataNasterii(dto.getDataNasterii());
        p.setGen(dto.getGen());
        p.setTelefon(dto.getTelefon());
        p.setAlergii(dto.getAlergii());
        p.setProblemeMedicale(dto.getProblemeMedicale());
        p.setContactUrgenta(dto.getContactUrgenta());
        p.setIdUser(user.getId());

        //salvare :daca e nou , i se da un id nou, dar daca  exista, doar face UPDATE la late
        Participant participantSalvat = participantRepository.save(p);

        System.out.println("✅ Participant salvat cu ID: " + participantSalvat.getId());
        System.out.println("DEBUG TABARA: React a trimis ID-ul: " + dto.getIdTabara());
        // 2. Creăm înscrierea automată(legare participant de tabara)
        Inscriere i=new Inscriere();
        i.setDataInscriere(LocalDate.now());
        i.setStatut(statusInscriere);
        i.setSuma(BigDecimal.valueOf(dto.getSuma()));
        i.setDataPlata(LocalDate.now());
        i.setStatusPlata("NEPLATIT");
        Tabara tabara =tabaraRepository.findById(dto.getIdTabara())//i.setTabara(dto.getIdTabara());
                .orElseThrow(()-> new RuntimeException("Tabara nu exista"));
        i.setTabara(tabara);//se da obiectul intreg , nu foar id ul
        i.setParticipant(participantSalvat);//id generat automat mai sus
        //i.setIdPlatitor(user.getId());
        i.setIdPlatitor(207L); // FORȚĂM manual ID-ul 207 (cu L la final pentru Long)
        System.out.println("TEST DISPERAT: Trimit ID-ul fix 207 căruia MySQL îi dă bifa verde.");

     // return repository.save(i);
        // SALVAREA CU FORȚARE:
        Inscriere salvata = repository.saveAndFlush(i); // Folosește saveAndFlush în loc de save
        System.out.println("DEBUG FINAL - Platitor: " + i.getIdPlatitor());
        System.out.println("DEBUG FINAL - Participant: " + i.getParticipant());
        System.out.println("DEBUG FINAL - Suma: " + i.getSuma());
        System.out.println("🚀 SUCCES TOTAL! Înscriere salvată.");
        return salvata;
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
    public List<InscriereDetaliiDTO> getIstoricUserRegistrations(@PathVariable Long idPlatitor)
    {
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
    public ResponseEntity <String> uploadDocument(@PathVariable Long id, @RequestParam("file") MultipartFile file){

         try{
             Inscriere inscriere =repository.findById(id)
                     .orElseThrow(()-> new RuntimeException("Inscrierea nu exista"));
           //se defineste unde se salveaza fisierele(care e folserul uploads din proeict
             String uploadDir =System.getProperty("user.dir")+ "/uploads/";
             File directory = new File(uploadDir);
             if(!directory.exists()){
                 directory.mkdir();//se creeaza folderul daca nu exista

             }

             /// curatare numele  fisierului si il salvam
           String fileName= "Med_" +id + "_"+file.getOriginalFilename().replace(" ","_");
           Path filePath =Paths.get(uploadDir+ fileName);
           Files.write(filePath, file.getBytes());

           //Salvare doar numele in baza de date
             inscriere.setDocumentMedical(fileName);
             repository.save(inscriere);

             return ResponseEntity.ok("Fisier salvat cu succes!");
         }
         catch(Exception e)
         {
             e.printStackTrace();
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Eroare la salvarea fisierului.");
         }

    }

}
