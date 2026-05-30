package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.dto.PrezentaDTO;
import ro.licenta.taberemanager.model.ParticipantPrezenta;
import ro.licenta.taberemanager.repository.ActivitateRepository;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.ParticipantPrezentaRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import ro.licenta.taberemanager.repository.UserRepository;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.model.Activitate;
import java.util.Optional;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/prezenta")
public class ParticipantPrezentaController {

    private final ParticipantPrezentaRepository repository;
    private final InscriereRepository inscriereRepository;
    private final ActivitateRepository activitateRepository;
    private final UserRepository userRepository;
    public ParticipantPrezentaController(ParticipantPrezentaRepository repository, InscriereRepository inscriereRepository,ActivitateRepository activitateRepository, UserRepository userRepository){
        this.repository=repository;
        this.inscriereRepository=inscriereRepository;
        this.activitateRepository=activitateRepository;
        this.userRepository=userRepository;
    }

    /// prinde email-ul coordonatorului logat și îi returnează doar activitățile lui
    @GetMapping("/activitati-coordonator")
    public List<Activitate> getActivitatiPentruCoordonator(@RequestParam String email){

        // 1. Găsim user-ul sau aruncăm direct eroare (cum ai făcut la bifeaza)
      User coordonator = userRepository.findByEmail(email)
              .orElseThrow(()-> new RuntimeException("Eroare: Coordonatorul nu a fost găsit!"));
        // 2. Returnăm direct lista (dacă e user normal, va da o listă goală [])
       return  activitateRepository.findByCoordonatorId(coordonator.getId());

    }


    ///  functie pentru coordonator
    @GetMapping("/activitate/{idTabara}/{idActivitate}")
     public List<PrezentaDTO> getAttendanceList(@PathVariable Long idTabara,@PathVariable Long idActivitate){
        return repository.getListaPrezentaActivitate(idTabara,idActivitate);
    }//trimitere id catre repository

    /// functie pentru bifa checkbox
    @PatchMapping("/bifeaza/{id}")
    public ParticipantPrezenta attendanceCheckbox(@PathVariable Long id, @RequestBody Map<String, String> body){
        ParticipantPrezenta p=repository.findById(id)
                .orElseThrow(()-> new RuntimeException("Prezenta nu a fost gasita"));
        p.setPrezenta(body.get("status"));//trimite da sau nu

        return repository.save(p);

    }

    @PostMapping("/salveaza")
    public PrezentaDTO salveazaPrezenta(@RequestBody PrezentaDTO dto) {

        // Validare explicita
        if (dto.getIdInscriere() == null || dto.getIdActivitate() == null) {
            throw new RuntimeException("idInscriere sau idActivitate este null! DTO primit: " + dto);
        }

        ParticipantPrezenta salvat = repository
                .findByInscriereIdAndActivitateId(dto.getIdInscriere(), dto.getIdActivitate())
                .map(existent -> {
                    existent.setPrezenta(dto.getPrezenta());
                    existent.setObservatii(dto.getObservatii() != null ? dto.getObservatii() : "");
                    return repository.save(existent);
                })
                .orElseGet(() -> {
                    ParticipantPrezenta nou = new ParticipantPrezenta();
                    nou.setInscriere(inscriereRepository.findById(dto.getIdInscriere())
                            .orElseThrow(() -> new RuntimeException("Inscriere negasita: " + dto.getIdInscriere())));
                    nou.setActivitate(activitateRepository.findById(dto.getIdActivitate())
                            .orElseThrow(() -> new RuntimeException("Activitate negasita: " + dto.getIdActivitate())));
                    nou.setPrezenta(dto.getPrezenta());
                    nou.setObservatii(dto.getObservatii() != null ? dto.getObservatii() : "");
                    return repository.save(nou);
                });

        // IMPORTANT: Returnam DTO, nu entitatea JPA!
        // Construim manual ca sa nu facem inca un query
        PrezentaDTO rezultat = new PrezentaDTO();
        rezultat.setIdPrezenta(salvat.getId());
        rezultat.setIdInscriere(dto.getIdInscriere());
        rezultat.setIdActivitate(dto.getIdActivitate());
        rezultat.setPrezenta(salvat.getPrezenta());
        rezultat.setObservatii(salvat.getObservatii());
        rezultat.setNume(dto.getNume());
        rezultat.setPrenume(dto.getPrenume());
        rezultat.setNumeTabara(dto.getNumeTabara());
        rezultat.setNumeActivitate(dto.getNumeActivitate());
        return rezultat;
    }

    /// CRUD
/// afisare/citire
    @GetMapping("/lista/{idTabara}/{idActivitate}")
    public List<PrezentaDTO> getLista(@PathVariable Long idTabara, @PathVariable Long idActivitate) {
        return repository.getListaPrezentaActivitate(idTabara, idActivitate);
    }
    //Cautare participant dupa id
    @GetMapping("/{id}")
    @ResponseBody
    public ParticipantPrezenta getAttendanceById(@PathVariable Long id){
        return repository.findById(id)
                .orElseThrow(()->new RuntimeException("Prezenta nu a fost gasita"));
    }

    //PAginare prezenta
    @GetMapping("/paginat")
    @ResponseBody
    public Page<ParticipantPrezenta> getAttendance(Pageable pageable){
        return repository.findAll(pageable);
    }
/// creare
    @PostMapping("/creare")
    @ResponseBody
    public ParticipantPrezenta createAttendance(@Valid @RequestBody  ParticipantPrezenta prezenta)
    {
        return repository.save(prezenta);
    }
//stergere
    @DeleteMapping("/stergere/{id}")
    @ResponseBody
    public void deleteAttendance(@PathVariable Long id)
    {
        repository.deleteById(id);
    }

/// actualizare
    @PutMapping("/actualizare/{id}")
    @ResponseBody
    public ParticipantPrezenta updateAttendance(@PathVariable Long id,@Valid @RequestBody ParticipantPrezenta updatedAttendance){
        return repository.findById(id)
                .map(attendance-> {
                    attendance.setPrezenta(updatedAttendance.getPrezenta());
                    attendance.setObservatii(updatedAttendance.getObservatii());
                    attendance.setActivitate(updatedAttendance.getActivitate());
                    attendance.setInscriere(updatedAttendance.getInscriere());
                    return repository.save(attendance);
                })
                .orElseThrow(()->new RuntimeException("Prezenta nu a fost gasita ca sa fie modificata"));
    }

}

