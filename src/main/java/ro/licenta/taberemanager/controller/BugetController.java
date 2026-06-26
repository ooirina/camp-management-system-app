package ro.licenta.taberemanager.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.service.BugetService;

import java.util.Map;

@RestController
@RequestMapping("/buget")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class BugetController {

    private final BugetService bugetService;

    // Bugetul complet al unei tabere — total incasat, total rambursat, sold net, istoric tranzactii
    @GetMapping("/tabara/{idTabara}")
    public Map<String, Object> getBugetTabara(@PathVariable Long idTabara) {
        return bugetService.getBugetTabara(idTabara);
    }

    // Bugetul agregat al TUTUROR taberelor — rezervat Adminului, pentru supervizare financiara generala
    @GetMapping("/agregat")
    public Map<String, Object> getBugetAgregat() {
        return bugetService.getBugetAgregat();
    }
}