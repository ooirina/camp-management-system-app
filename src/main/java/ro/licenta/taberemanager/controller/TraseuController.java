package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Traseu;
import ro.licenta.taberemanager.repository.TraseuRepository;
import ro.licenta.taberemanager.repository.InscriereRepository;
import org.springframework.ui.Model;
import org.springframework.data.domain.Pageable;
import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/trasee")

public class TraseuController {
    private final TraseuRepository repository;
    private final InscriereRepository inscriereRepository;

    public TraseuController(TraseuRepository repository, InscriereRepository inscriereRepository){
        this.repository=repository;
        this.inscriereRepository=inscriereRepository;
    }

    @GetMapping("/lista")
    @ResponseBody
    public List<Traseu> getAllTrails(){
        return repository.findAll();
    }

    @GetMapping("/lista/tabara/{idTabara}")
    @ResponseBody
    public List<Traseu> getTrailsByTabara(@PathVariable Long idTabara){
        return repository.findByTabaraId(idTabara);
    }

    @PostMapping("/creare")
    @ResponseBody
    public Traseu createTrail(@Valid @RequestBody  Traseu traseu)
    {
        return repository.save(traseu);
    }

    @PutMapping("/actualizare/{id}")
    @ResponseBody
    public Traseu updateTrail(@PathVariable Long id, @Valid @RequestBody Traseu updatedTrail){
        return repository.findById(id)
                .map(trail->{
                    trail.setDescriere(updatedTrail.getDescriere());
                    trail.setNume(updatedTrail.getNume());
                    trail.setDificultate(updatedTrail.getDificultate());
                    trail.setDistantaKm(updatedTrail.getDistantaKm());
                    trail.setDurataOre(updatedTrail.getDurataOre());
                    trail.setCoordonate(updatedTrail.getCoordonate());//permite modificcare linie desenata pe harta
                    return repository.save(trail);
                })
                .orElseThrow(()->new RuntimeException("Traseul nu a fost gasit."));
    }

    // DELETE traseul se poate sterge doar daca tabara lui nu are inscrieri active
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<String> deleteTrail(@PathVariable Long id) {
        Traseu traseu = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Traseul nu a fost gasit."));

        // Verificare integritate referențială: dacă tabăra traseului are înscrieri active (exclude ANULAT/WAITLIST)
        if (traseu.getTabara() != null) {
            long inscrieriActive = inscriereRepository.countByTabaraId(traseu.getTabara().getId());
            if (inscrieriActive > 0) {
                return ResponseEntity.badRequest()
                        .body("Nu poți șterge traseul! Tabăra asociată are înscrieri active.");
            }
        }

        repository.deleteById(id);
        return ResponseEntity.ok("Traseul a fost sters cu succes.");
    }

}