package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Activitate;
import ro.licenta.taberemanager.repository.ActivitateRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import ro.licenta.taberemanager.repository.ParticipantPrezentaRepository;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/activitati")
public class ActivitateController {

    private final ActivitateRepository repository;
    private final ParticipantPrezentaRepository prezentaRepository;

    public ActivitateController(ActivitateRepository repository, ParticipantPrezentaRepository prezentaRepository) {
        this.repository = repository;
        this.prezentaRepository = prezentaRepository;

    }

    //Lista cu toti Activitateii
    @GetMapping("/lista")
    public List<Activitate> showActivites() {
        return repository.findAll();
    }

    @PostMapping("/creare")
    @ResponseBody
    public Activitate createActivity(@Valid @RequestBody Activitate activitate) {
        return repository.save(activitate);
    }


    //Cautare Activitate dupa id
    @GetMapping("/{id}")
    @ResponseBody
    public Activitate getActivityById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activitatea nu a fost gasita"));
    }

    //PAginare Activitatei
    @GetMapping("/paginat")
    @ResponseBody
    public Page<Activitate> getActivites(Pageable pageable) {
        return repository.findAll(pageable);
    }

    //Actualizare date Activitate
    @PutMapping("/actualizare/{id}")
    @ResponseBody
    public Activitate updateActivitate(@PathVariable Long id, @Valid @RequestBody Activitate updatedActivitate) {
        return repository.findById(id)
                .map(activitate -> {
                    activitate.setNume(updatedActivitate.getNume());
                    activitate.setDescriere(updatedActivitate.getDescriere());
                    activitate.setData(updatedActivitate.getData());
                    activitate.setLocatie(updatedActivitate.getLocatie());
                    activitate.setCapacitateMax(updatedActivitate.getCapacitateMax());
                    activitate.setTabara(updatedActivitate.getTabara());
                    activitate.setOraInceput(updatedActivitate.getOraInceput());
                    activitate.setOraSfarsit(updatedActivitate.getOraSfarsit());
                    activitate.setCoordonator(updatedActivitate.getCoordonator());

                    return repository.save(activitate);
                })
                .orElseThrow(() -> new RuntimeException("Activitatea nu a fost gasita"));

    }

    // delete cu verificare prezente inregistrate
    @DeleteMapping("/stergere/{id}")
    @ResponseBody
    public ResponseEntity<String> deleteActivitate(@PathVariable Long id) {

        // Verificare dacă are prezențe înregistrate
        boolean arePrezente = prezentaRepository.findAll().stream()
                .anyMatch(p -> p.getActivitate() != null &&
                        id.equals(p.getActivitate().getId()));

        if (arePrezente) {
            return ResponseEntity.badRequest()
                    .body("Nu poți șterge activitatea! Are prezențe înregistrate.");
        }

        repository.deleteById(id);
        return ResponseEntity.ok("Activitatea a fost ștearsă cu succes.");
    }

    // metoda pentru itinerariu tabara
    @GetMapping("/tabara/{idTabara}")
    public List<Activitate> getItinerary(@PathVariable Long idTabara) {
        return repository.findByTabaraIdOrderByDataAsc(idTabara);
    }


    @GetMapping("/coordonator/{idCoordonator}")
    public List<Activitate> getActivitatiCoordonator(@PathVariable Long idCoordonator) {
        return repository.findByCoordonatorId(idCoordonator);
    }
}