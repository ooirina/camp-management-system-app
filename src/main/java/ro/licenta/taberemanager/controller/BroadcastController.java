package ro.licenta.taberemanager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import ro.licenta.taberemanager.repository.InscriereRepository;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/broadcast")
@CrossOrigin(origins = "http://localhost:3000")
public class BroadcastController {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private InscriereRepository inscriereRepository;

    @PostMapping("/trimite/{idTabara}")
    public Map <String, String> sendBroadcastEmail(@PathVariable Long idTabara,@RequestBody Map<String, String> payload)
    {
        String subject =payload.get("subiect");
        String messageText= payload.get("mesaj");

        List<String> parentEmails=inscriereRepository.findConfirmedParentsEmails(idTabara);

        if(parentEmails.isEmpty())
        {
            return Map.of("status", "error", "message", "Nu s-au găsit participanți cu taxe plătite pentru această tabără.");
        }

        try{
          //initialzare container pentru emai-uri compexe(html)
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");


            //setare detalii folosind helper
            helper.setSubject(subject);
            helper.setFrom("campcore.app@gmail.com");
            helper.setText(messageText, true); // Acel 'true' magic îi spune Java-ului că textul este de fapt cod HTML!

            String[] bccArray = parentEmails.toArray(new String[0]);
            helper.setBcc(bccArray);

            //trmitere obiect
            mailSender.send(mimeMessage);

            return Map.of("status", "success", "message", "Email trimis cu succes către " + parentEmails.size() + " părinți!");

        }  catch( Exception e){
            e.printStackTrace();
            return Map.of("status", "error", "message", "Eroare la trimiterea email-ului: " + e.getMessage());

    }

    }
}
