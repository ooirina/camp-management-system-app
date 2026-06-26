package ro.licenta.taberemanager.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.repository.InscriereRepository;

import java.util.List;
import java.util.Map;

@Service
public class BroadcastService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private InscriereRepository inscriereRepository;

    //Trimite email broadcast către toți părinții cu taxe plătite dintr-o tabără.

    public Map<String, String> trimiteEmailBroadcast(Long idTabara, String subject, String messageText) {

        List<String> parentEmails = inscriereRepository.findConfirmedParentsEmails(idTabara);

        if (parentEmails.isEmpty()) {
            return Map.of("status", "error",
                    "message", "Nu s-au găsit participanți cu taxe plătite pentru această tabără.");
        }

        try {
            //initialzare container pentru email-uri complexe(html)
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            //setare detalii folosind helper
            helper.setSubject(subject);
            helper.setFrom("campcore.app@gmail.com");
            helper.setText(messageText, true); // Acel 'true' îi spune Java-ului că textul este de fapt cod HTML!

            String[] bccArray = parentEmails.toArray(new String[0]);
            helper.setBcc(bccArray);

            //trimitere obiect
            mailSender.send(mimeMessage);

            return Map.of("status", "success",
                    "message", "Email trimis cu succes către " + parentEmails.size() + " părinți!");

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error",
                    "message", "Eroare la trimiterea email-ului: " + e.getMessage());
        }
    }
}