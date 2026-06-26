package ro.licenta.taberemanager.controller;

import ro.licenta.taberemanager.dto.AnuntRequestDTO;
import ro.licenta.taberemanager.model.AnuntIntern;
import ro.licenta.taberemanager.service.AnuntInternService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/anunturi-interne")
@CrossOrigin(origins = "http://localhost:3000")
public class AnuntInternController {

    @Autowired
    private AnuntInternService anuntService;

    // Aducere avizului pentru o tabara specifica
    @GetMapping("/tabara/{idTabara}")
    public List<AnuntIntern> getAnunturiTabara(@PathVariable Long idTabara) {
        return anuntService.getAnunturiTabara(idTabara);
    }

    // Coordonatorul sef salveaza un anunt nou
    @PostMapping("/salveaza")
    public AnuntIntern posteazaAnunt(@RequestBody AnuntRequestDTO payload) {
        return anuntService.posteazaAnunt(payload);
    }
}