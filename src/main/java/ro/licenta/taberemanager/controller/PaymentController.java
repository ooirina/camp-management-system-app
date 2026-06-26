package ro.licenta.taberemanager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.service.PaymentService;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/plati")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/creaza-sesiune/{idInscriere}")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@PathVariable Long idInscriere) {
        Map<String, String> result = paymentService.createCheckoutSession(idInscriere);
        // Daca rezultatul contine eroare, returnam bad request
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/plata-reusita/{id}")
    public ResponseEntity<String> marcheazaPlatit(@PathVariable Long id,
                                                  @RequestParam(required = false) String sessionId) {
        try {
            String msg = paymentService.marcheazaPlatit(id, sessionId);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Eroare: " + e.getMessage());
        }
    }
}