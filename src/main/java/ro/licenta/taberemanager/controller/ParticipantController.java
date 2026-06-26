package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.ParticipantRepository;
import ro.licenta.taberemanager.service.ParticipantService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/participanti")

public class ParticipantController {

    // Totul prin ParticipantService
    private final ParticipantService service;
    private final InscriereRepository inscriereRepository;

    public ParticipantController(ParticipantService service,InscriereRepository inscriereRepository) {
        this.service = service;
        this.inscriereRepository = inscriereRepository;
    }

    // Lista cu toti participantii
    @GetMapping("/lista")
    public List<Participant> showParticipants() {
        return service.findAll();
    }

    // Lista participanților unei singure tabere — folosit de coordonator (vede doar tabăra lui activă)
    @GetMapping("/lista/tabara/{idTabara}")
    public List<Participant> showParticipantsByTabara(@PathVariable Long idTabara) {
        return service.findByTabaraId(idTabara);
    }

    // panoul medical pentru coordonator general toate taberele lui
    @GetMapping("/medical/{idCoordonator}")
    @ResponseBody
    public List<Participant> getPanouMedical(@PathVariable Long idCoordonator) {
        return service.findParticipantiMedicalByCoordonator(idCoordonator);
    }

    // panou medical pentru coordonator pt o anumita tabara
    @GetMapping("/medical/{idCoordonator}/tabara/{idTabara}")
    @ResponseBody
    public List<Participant> getPanouMedicalFiltrat(@PathVariable Long idCoordonator,
                                                    @PathVariable Long idTabara) {
        return service.findParticipantiMedicalByCoordonatorAndTabara(idCoordonator, idTabara);
    }

    // metoda care face agregare(o grupare si numarare)
    @GetMapping("/raport-bucatarie/{idTabara}")
    public Map<String, Long> getRaportBucatarie(@PathVariable Long idTabara) {
        return service.getRaportBucatarie(idTabara);
    }

    // Cautare participant dupa id
    @GetMapping("/{id}")
    @ResponseBody
    public Participant getParticipantById(@PathVariable Long id) {
        return service.findById(id);
    }

    // PAginare participanti
    @GetMapping("/paginat")
    @ResponseBody
    public Page<Participant> getParticipants(Pageable pageable) {
        return service.findAllPaged(pageable);
    }

    // Se adauga un participant respectand regulile de validare
    @PostMapping
    @ResponseBody
    public Participant createParticipant(@Valid @RequestBody Participant participant) {
        return service.salveazaParticipant(participant);
    }

    // Aducere lista de membrii ai familiei( copii) pentru un anumit user(parinte)
    @GetMapping("/familie/{idUser}")
    public List<Participant> getParticipantiByUserId(@PathVariable Long idUser) {
        return service.findByIdUser(idUser);
    }

    // Actualizare date participant
    @PutMapping("/{id}")
    @ResponseBody
    public Participant updateParticipant(@PathVariable Long id,
                                         @Valid @RequestBody Participant updatedParticipant) {
        return service.updateParticipant(id, updatedParticipant);
    }

    // DELETE — cu verificare integritate referentiala
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<String> deleteParticipant(@PathVariable Long id) {

        // Verificare daca participantul are inscrieri active
        // Nu se poate sterge daca e inscris, a platit sau e in waitlist
        boolean areInscrieri = inscriereRepository.findAll().stream()
                .anyMatch(i -> i.getParticipant() != null &&
                        id.equals(i.getParticipant().getId()) &&
                        !"ANULAT".equals(i.getStatut()));

        if (areInscrieri) {
            return ResponseEntity.badRequest()
                    .body("Nu poți șterge participantul! Are înscrieri active (PENDING, CONFIRMAT sau WAITLIST).");
        }

        service.deleteParticipant(id);
        return ResponseEntity.ok("Participantul a fost șters cu succes.");
    }
}