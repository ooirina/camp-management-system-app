package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.dto.InscriereDTO;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.InscriereRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import ro.licenta.taberemanager.repository.ParticipantRepository;
import ro.licenta.taberemanager.repository.UserRepository;

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

    public InscriereController(InscriereRepository repository,ParticipantRepository participantRepository,UserRepository userRepository){
        this.repository=repository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
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

    //actualizare inscriere
    @PutMapping("/actualizare/{id}")
    public Inscriere updateRegistration(@PathVariable Long id, @Valid @RequestBody Inscriere updatedRegistration){
        return repository.findById(id)
                .map(registration->{
                    registration.setDataInscriere(updatedRegistration.getDataInscriere());
                    registration.setDataPlata(updatedRegistration.getDataPlata());
                    registration.setStatut(updatedRegistration.getStatut());
                    registration.setSuma(updatedRegistration.getSuma());
                    registration.setIdPlatitor(updatedRegistration.getIdPlatitor());
                    registration.setStatusPlata(updatedRegistration.getStatusPlata());
                    registration.setIdParticipant(updatedRegistration.getIdParticipant());
                    registration.setIdTabara(updatedRegistration.getIdTabara());
                    return repository.save(registration);
                })
                .orElseThrow(()-> new RuntimeException("Utilizatorul nu a fost gasit"));
    }

    @PostMapping("/save-completa")
    public Inscriere saveInscriereCompleta(@RequestBody InscriereDTO dto ) {
        System.out.println("Email primit  trimis de react:[" + dto.getEmailUtilizator()+"]");
        //cautare user in bd dupa email de google pt a il lega de participant
        User user= userRepository.findByEmail(dto.getEmailUtilizator()).orElseThrow();

        System.out.println("DEBUG: Java a găsit în DB Userul: " + user.getEmail() + " cu ID: " + user.getId());
        // 1. salveaza mai întâi participantul-toate datele
        Participant p = new Participant();
        p.setNume(dto.getNumeParticipant());
        p.setPrenume(dto.getPrenumeParticipant());
        p.setDataNasterii(dto.getDataNasterii());
        p.setTelefon(dto.getTelefon());
        p.setAlergii(dto.getAlergii());
        p.setProblemeMedicale(dto.getProblemeMedicale());
        p.setContactUrgenta(dto.getContactUrgenta());


        p.setIdUser(user.getId());
        Participant participantSalvat = participantRepository.save(p);

        System.out.println("✅ Participant salvat cu ID: " + participantSalvat.getId());
        System.out.println("DEBUG TABARA: React a trimis ID-ul: " + dto.getIdTabara());
        // 2. Creăm înscrierea automată(legare participant de tabara)
        Inscriere i=new Inscriere();
        i.setDataInscriere(LocalDate.now());
        i.setStatut("PENDING");
        i.setSuma(BigDecimal.valueOf(dto.getSuma()));
        i.setDataPlata(LocalDate.now());
        i.setStatusPlata("NEPLATIT");
        i.setIdTabara(dto.getIdTabara());
        i.setIdParticipant(participantSalvat.getId());//id generat automat mai sus
        //i.setIdPlatitor(user.getId());
        i.setIdPlatitor(207L); // FORȚĂM manual ID-ul 207 (cu L la final pentru Long)
        System.out.println("TEST DISPERAT: Trimit ID-ul fix 207 căruia MySQL îi dă bifa verde.");

     // return repository.save(i);
        // SALVAREA CU FORȚARE:
        Inscriere salvata = repository.saveAndFlush(i); // Folosește saveAndFlush în loc de save
        System.out.println("DEBUG FINAL - Platitor: " + i.getIdPlatitor());
        System.out.println("DEBUG FINAL - Participant: " + i.getIdParticipant());
        System.out.println("DEBUG FINAL - Suma: " + i.getSuma());
        System.out.println("🚀 SUCCES TOTAL! Înscriere salvată.");
        return salvata;
    }
    
}
