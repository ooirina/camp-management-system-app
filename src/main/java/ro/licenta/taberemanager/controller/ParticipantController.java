package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.repository.ParticipantRepository;
import ro.licenta.taberemanager.service.ParticipantService;

@Controller
@RequestMapping("/participanti")

public class ParticipantController {
    private final ParticipantService service;
    private final ParticipantRepository repository;
    public ParticipantController(ParticipantRepository repository, ParticipantService service)
    {
        this.repository=repository;
        this.service=service;
    }
    //Lista cu toti participantii
    @GetMapping("/lista")
    public String showParticipants(Model model){
        model.addAttribute("listaParticipanti", repository.findAll());
        return "participanti";
    }

    //Cautare participant dupa id
    @GetMapping("/{id}")
    @ResponseBody
    public Participant getParticipantById(@PathVariable Long id){
        return repository.findById(id)
                .orElseThrow(()->new RuntimeException("Participantul nu a fost gasit"));
    }
//PAginare participanti
    @GetMapping("/paginat")
    @ResponseBody
    public Page<Participant> getParticipants(Pageable pageable){
        return repository.findAll(pageable);
    }
//Se adauga un participant respectand regulile de validare
    @PostMapping
    @ResponseBody
    public Participant createParticipant(@Valid @RequestBody Participant participant)
    {
        return service.salveazaParticipant(participant);
    }
    //Actualizare date participant
    @PutMapping("/{id}")
    @ResponseBody
    public Participant updateParticipant(@PathVariable Long id, @Valid @RequestBody Participant updatedParticipant){
        return repository.findById(id)
                .map(participant-> {
                    participant.setNume(updatedParticipant.getNume());
                    participant.setPrenume(updatedParticipant.getPrenume());
                    participant.setDataNasterii(updatedParticipant.getDataNasterii());
                    participant.setAlergii(updatedParticipant.getAlergii());
                    participant.setProblemeMedicale(updatedParticipant.getProblemeMedicale());
                    participant.setContactUrgenta(updatedParticipant.getContactUrgenta());
                    participant.setIdUser(updatedParticipant.getIdUser());
                    participant.setIdParinte(updatedParticipant.getIdParinte());
                    // participant.setNumeGrup(updatedParticipant.getNumeGrup());
                    return repository.save(participant);
                })
                .orElseThrow(()->new RuntimeException("Particiant nu a fost gasit"));

    }
    @DeleteMapping("/{id}")
    @ResponseBody
    public void deleteParticipant (@PathVariable Long id){
        repository.deleteById(id);
    }
}
