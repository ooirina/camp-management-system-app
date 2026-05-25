package ro.licenta.taberemanager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.model.Categorie;
import ro.licenta.taberemanager.repository.CategorieRepository;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/categorii")
public class CategorieController {

    @Autowired
    private CategorieRepository categorieRepository;

    @GetMapping({"", "/lista"})
    public List<Categorie> getAllCategorii() {
        return categorieRepository.findAll();
    }
}