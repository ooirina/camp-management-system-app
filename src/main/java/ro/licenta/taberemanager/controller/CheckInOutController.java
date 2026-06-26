package ro.licenta.taberemanager.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.service.CheckInEmailService;
import ro.licenta.taberemanager.service.CheckInOutService;
import ro.licenta.taberemanager.service.CheckOutEmailService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/flux")
@CrossOrigin(origins = "http://localhost:3000")
public class CheckInOutController {

    @Autowired
    private CheckInOutService checkInOutService;

    @GetMapping("/participanti/tabara/{idTabara}")
    public List<Inscriere> getParticipantiTabara(@PathVariable Long idTabara) {
        return checkInOutService.getParticipantiTabara(idTabara);
    }

    // Check in
    @PostMapping("/checkin/{id}")
    public ResponseEntity<?> doCheckin(@PathVariable Long id) {
        return checkInOutService.doCheckin(id)
                .map(ins -> ResponseEntity.ok().build())
                .orElse(ResponseEntity.notFound().build());
    }

    // Check out
    @PostMapping("/checkout/{id}")
    public ResponseEntity<?> doCheckout(@PathVariable Long id) {
        return checkInOutService.doCheckout(id)
                .map(ins -> ResponseEntity.ok().build())
                .orElse(ResponseEntity.notFound().build());
    }

    // Raport CSV
    @GetMapping(value = "/raport/csv/{idTabara}", produces = "text/csv")
    public void genereazaRaportCSV(@PathVariable Long idTabara, HttpServletResponse response) throws IOException {
        checkInOutService.genereazaRaportCSV(idTabara, response);
    }
}