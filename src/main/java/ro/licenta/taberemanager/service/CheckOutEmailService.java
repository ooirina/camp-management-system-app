package ro.licenta.taberemanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.UserRepository;

import java.time.LocalDate;
import java.time.Period;

@Service
public class CheckOutEmailService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private InscriereRepository inscriereRepository;

    @Autowired
    private UserRepository userRepository;

    public void sendCheckoutEmailIfMinor(Long idInscriere) {

        // 1. Extragem înscrierea
        Inscriere inscriere = inscriereRepository.findById(idInscriere)
                .orElseThrow(() -> new RuntimeException("Înscrierea nu a fost găsită!"));

        Participant participant = inscriere.getParticipant();

        // 2. Calculăm vârsta participantului
        int varsta = Period.between(participant.getDataNasterii(), LocalDate.now()).getYears();

        // 3. Dacă e minor, pregătim și trimitem emailul de plecare
        if (varsta < 18) {
            User platitor = userRepository.findById(inscriere.getIdPlatitor())
                    .orElseThrow(() -> new RuntimeException("Utilizatorul plătitor nu a fost găsit!"));

            String emailParinte = platitor.getEmail();
            String numeCompletCopil = participant.getNume() + " " + participant.getPrenume();

            // Construim mesajul specific pentru plecare
            String subiect = " Notificare Check-out: " + numeCompletCopil + " a plecat din tabără!";
            String mesaj = "Salutare,\n\n"
                    + "Te anunțăm că " + numeCompletCopil + " a făcut check-out-ul cu succes și a părăsit locația taberei noastre.\n\n"
                    + "Sperăm că a avut o experiență minunată alături de noi și abia așteptăm să ne revedem la următoarea ediție!\n\n"
                    + "Toate cele bune,\n"
                    + "Echipa CampCore";

            // Trimitem emailul
            emailService.sendSimpleEmail(emailParinte, subiect, mesaj);
        }
    }
}


