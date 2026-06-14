package ro.licenta.taberemanager.controller;

import ro.licenta.taberemanager.dto.RaportRowDTO;
import ro.licenta.taberemanager.service.RapoarteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/rapoarte")
@CrossOrigin(origins = "*")
public class RapoarteController {

    @Autowired
    private RapoarteService rapoarteService;
    /** Raport Înscrieri */
    @GetMapping("/inscrieri/{idCoordonator}")
    public List<RaportRowDTO> inscrieri(@PathVariable Long idCoordonator) {
        return rapoarteService.getRaportInscrieri(idCoordonator, null);
    }
    @GetMapping("/inscrieri/{idCoordonator}/tabara/{idTabara}")
    public List<RaportRowDTO> inscrieriTabara(@PathVariable Long idCoordonator, @PathVariable Long idTabara) {
        return rapoarteService.getRaportInscrieri(idCoordonator, idTabara);
    }

    /** Raport Financiar */
    @GetMapping("/financiar/{idCoordonator}")
    public List<RaportRowDTO> financiar(@PathVariable Long idCoordonator) {
        return rapoarteService.getRaportFinanciar(idCoordonator, null);
    }
    @GetMapping("/financiar/{idCoordonator}/tabara/{idTabara}")
    public List<RaportRowDTO> financiarTabara(@PathVariable Long idCoordonator, @PathVariable Long idTabara) {
        return rapoarteService.getRaportFinanciar(idCoordonator, idTabara);
    }

    /** Raport Medical */
    @GetMapping("/medical/{idCoordonator}")
    public List<RaportRowDTO> medical(@PathVariable Long idCoordonator) {
        return rapoarteService.getRaportMedical(idCoordonator, null);
    }
    @GetMapping("/medical/{idCoordonator}/tabara/{idTabara}")
    public List<RaportRowDTO> medicalTabara(@PathVariable Long idCoordonator, @PathVariable Long idTabara) {
        return rapoarteService.getRaportMedical(idCoordonator, idTabara);
    }

    /** Raport Check-in / Check-out */
    @GetMapping("/checkin/{idCoordonator}")
    public List<RaportRowDTO> checkin(@PathVariable Long idCoordonator) {
        return rapoarteService.getRaportCheckin(idCoordonator, null);
    }
    @GetMapping("/checkin/{idCoordonator}/tabara/{idTabara}")
    public List<RaportRowDTO> checkinTabara(@PathVariable Long idCoordonator, @PathVariable Long idTabara) {
        return rapoarteService.getRaportCheckin(idCoordonator, idTabara);
    }

    /** Raport Participanți */
    @GetMapping("/participanti/{idCoordonator}")
    public List<RaportRowDTO> participanti(@PathVariable Long idCoordonator) {
        return rapoarteService.getRaportParticipanti(idCoordonator, null);
    }
    @GetMapping("/participanti/{idCoordonator}/tabara/{idTabara}")
    public List<RaportRowDTO> participantiTabara(@PathVariable Long idCoordonator, @PathVariable Long idTabara) {
        return rapoarteService.getRaportParticipanti(idCoordonator, idTabara);
    }

    // Raport Complet (pentru raportul personalizat — returnează toate câmpurile)
    @GetMapping("/complet/{idCoordonator}")
    public List<RaportRowDTO> complet(@PathVariable Long idCoordonator) {
        return rapoarteService.getRaportComplet(idCoordonator, null);
    }
    @GetMapping("/complet/{idCoordonator}/tabara/{idTabara}")
    public List<RaportRowDTO> completTabara(@PathVariable Long idCoordonator, @PathVariable Long idTabara) {
        return rapoarteService.getRaportComplet(idCoordonator, idTabara);
    }
}
