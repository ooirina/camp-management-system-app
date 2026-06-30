package ro.licenta.taberemanager.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Tabara;
import ro.licenta.taberemanager.repository.ActivitateRepository;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.TabaraRepository;
import ro.licenta.taberemanager.repository.TraseuRepository;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/tabere")
public class TabaraController {

    private final TabaraRepository repository;
    private final InscriereRepository inscriereRepository;
    private final ActivitateRepository activitateRepository;
    private final TraseuRepository traseuRepository;

    public TabaraController(TabaraRepository repository,
                            InscriereRepository inscriereRepository,
                            ActivitateRepository activitateRepository,
                            TraseuRepository traseuRepository) {
        this.repository = repository;
        this.inscriereRepository = inscriereRepository;
        this.activitateRepository = activitateRepository;
        this.traseuRepository = traseuRepository;
    }

    // creare tabara
    @PostMapping("/creare")
    public Tabara createCamp(@Valid @RequestBody Tabara tabara) {
        return repository.save(tabara);
    }

    // Lista cu toate taberele
    @GetMapping("/lista")
    public List<Tabara> showCamps() {
        return repository.findAll();
    }

    // Cautare tabara dupa id
    @GetMapping("/{id}")
    @ResponseBody
    public Tabara getCampById(@PathVariable("id") Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tabara nu a fost gasita"));
    }

    @GetMapping("/coordonator/{idCoordonator}")
    @ResponseBody
    public List<Tabara> getTabereCoordonator(@PathVariable Long idCoordonator) {
        return repository.findTabereByCoordonator(idCoordonator);
    }

    // Doar taberele unde userul e Coordonator Principal (nu orice coordonator de activitate)
    @GetMapping("/coordonator-principal/{idCoordonator}")
    @ResponseBody
    public List<Tabara> getTabereCoordonatorPrincipal(@PathVariable Long idCoordonator) {
        return repository.findByIdCoordonatorPrincipal(idCoordonator);
    }

    // PAginare taberelor
    @GetMapping("/paginat")
    @ResponseBody
    public Page<Tabara> getCamps(Pageable pageable) {
        return repository.findAll(pageable);
    }

    // Actualizare date tabara UPDATE
    @PutMapping("/actualizare/{id}")
    @ResponseBody
    public Tabara updateCamp(@PathVariable Long id, @Valid @RequestBody Tabara updatedCamp) {
        return repository.findById(id)
                .map(camp -> {
                    camp.setNume(updatedCamp.getNume());
                    camp.setCapacitate(updatedCamp.getCapacitate());
                    camp.setDataInceput(updatedCamp.getDataInceput());
                    camp.setDataSfarsit(updatedCamp.getDataSfarsit());
                    camp.setLocatie(updatedCamp.getLocatie());
                    camp.setPret(updatedCamp.getPret());
                    camp.setTipPublic(updatedCamp.getTipPublic());
                    camp.setVarstaMin(updatedCamp.getVarstaMin());
                    camp.setVarstaMax(updatedCamp.getVarstaMax());
                    camp.setLatitudine(updatedCamp.getLatitudine());
                    camp.setLongitudine(updatedCamp.getLongitudine());
                    return repository.save(camp);
                })
                .orElseThrow(() -> new RuntimeException("Tabara nu a fost gasita"));
    }

    // DELETE cu verificare integritate referențială
    @DeleteMapping("/stergere/{id}")
    @ResponseBody
    public ResponseEntity<String> deleteCamp(@PathVariable Long id) {
        Tabara tabara = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tabara nu a fost gasita"));

        // Verificare înscrieri nu se poate sterge daca are participanti inscrisi
        long nrInscrieri = inscriereRepository.countByTabaraId(id);
        if (nrInscrieri > 0) {
            return ResponseEntity.badRequest()
                    .body("Nu poți șterge tabăra! Are " + nrInscrieri + " înscrieri legate de ea.");
        }


        // Dacă are activități, nu se poate șterge
        long nrActivitati = activitateRepository.findByTabaraIdOrderByDataAsc(id).size();
        if (nrActivitati > 0) {
            return ResponseEntity.badRequest()
                    .body("Nu poți șterge tabăra! Are " + nrActivitati + " activități legate de ea.");
        }

        // Verificare coordonator principal asignat
        if (tabara.getIdCoordonatorPrincipal() != null) {
            return ResponseEntity.badRequest()
                    .body("Nu poți șterge tabăra! Are un coordonator principal asignat.");
        }

        // Stergere trasee legate
        traseuRepository.findAll().stream()
                .filter(t -> t.getTabara() != null && id.equals(t.getTabara().getId()))
                .forEach(t -> traseuRepository.deleteById(t.getId()));

        repository.deleteById(id);
        return ResponseEntity.ok("Tabăra a fost ștearsă cu succes.");
    }
}