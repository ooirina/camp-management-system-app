package ro.licenta.taberemanager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.service.BroadcastService;

import java.util.Map;

@RestController
@RequestMapping("/broadcast")
@CrossOrigin(origins = "http://localhost:3000")
public class BroadcastController {

    @Autowired
    private BroadcastService broadcastService;

    @PostMapping("/trimite/{idTabara}")
    public Map<String, String> sendBroadcastEmail(@PathVariable Long idTabara,
                                                  @RequestBody Map<String, String> payload) {
        String subject = payload.get("subiect");
        String messageText = payload.get("mesaj");

        // Deleghează logica de email către BroadcastService
        return broadcastService.trimiteEmailBroadcast(idTabara, subject, messageText);
    }
}