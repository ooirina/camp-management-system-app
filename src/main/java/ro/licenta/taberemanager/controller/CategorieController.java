package ro.licenta.taberemanager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.model.Categorie;
import ro.licenta.taberemanager.repository.CategorieRepository;
import ro.licenta.taberemanager.repository.TabaraRepository;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/categorii")
public class CategorieController {

    @Autowired
    private CategorieRepository categorieRepository;
    @Autowired
    private TabaraRepository tabaraRepository;

    @GetMapping({"", "/lista"})
    public List<Categorie> getAllCategorii() {
        return categorieRepository.findAll();
    }

    // Adăugare tip de tabără nou — folosit doar din panoul de Admin
    // Verifică dacă tipul există deja, indiferent de majuscule
    @PostMapping("/creare")
    public ResponseEntity<?> createCategorie(@RequestBody Categorie categorie) {
        if (categorieRepository.existsByTipIgnoreCase(categorie.getTip())) {
            return ResponseEntity.badRequest()
                    .body("Tipul \"" + categorie.getTip() + "\" există deja în listă.");
        }
        Categorie salvata = categorieRepository.save(categorie);
        return ResponseEntity.ok(salvata);
    }

    // Ștergere tip de tabără — folosit doar din panoul de Admin
    // Verifică întâi dacă există vreo tabără care folosește această categorie
    @DeleteMapping("/stergere/{id}")
    public ResponseEntity<String> deleteCategorie(@PathVariable Long id) {
        boolean esteFolosita = tabaraRepository.existaTabaraCuCategoria(id);
        if (esteFolosita) {
            return ResponseEntity.badRequest()
                    .body("Nu poți șterge acest tip de tabără! Există tabere care îl folosesc.");
        }
        categorieRepository.deleteById(id);
        return ResponseEntity.ok("Tipul de tabără a fost șters cu succes.");
    }

}