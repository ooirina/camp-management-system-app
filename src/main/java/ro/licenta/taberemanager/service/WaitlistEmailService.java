package ro.licenta.taberemanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.UserRepository;

@Service
public class WaitlistEmailService
{

    @Autowired
    private EmailService emailService;

    @Autowired
    private InscriereRepository inscriereRepository;

    @Autowired
    private UserRepository userRepository;

    public void sendWaitlistApprovalEmail(Long idInscriere) {

        // 1. Extragem înscrierea
        Inscriere inscriere = inscriereRepository.findById(idInscriere)
                .orElseThrow(() -> new RuntimeException("Înscrierea nu a fost găsită!"));

        Participant participant = inscriere.getParticipant();

        // 2. Extragem plătitorul (cel care trebuie să facă plata)
        User platitor = userRepository.findById(inscriere.getIdPlatitor())
                .orElseThrow(() -> new RuntimeException("Utilizatorul plătitor nu a fost găsit!"));

        String emailParinte = platitor.getEmail();
        String numeCompletCopil = participant.getNume() + " " + participant.getPrenume();
        String numeTabara = inscriere.getTabara().getNume();

        // 3. Construim mesajul cu o veste bună!
        String subiect = " Veste excelentă! S-a eliberat un loc pentru " + numeCompletCopil;
        String mesaj = "Salutare,\n\n"
                + "Avem o veste grozavă! S-a eliberat un loc în tabăra " + numeTabara + ", "
                + "iar cererea pentru " + numeCompletCopil + " a fost aprobată din lista de așteptare (Waitlist).\n\n"
                + "Dacă încă doriți să participați, vă rugăm să intrați în contul dumneavoastră de pe platformă "
                + "pentru a achita contravaloarea înscrierii și a confirma astfel locul definitiv.\n\n"
                + "Atenție: Locul este rezervat temporar, așa că vă recomandăm să finalizați plata cât mai curând posibil!\n\n"
                + "Cu drag,\n"
                + "Echipa CampCore";

        // 4. Trimitem emailul
        emailService.sendSimpleEmail(emailParinte, subiect, mesaj);
          }
    }
