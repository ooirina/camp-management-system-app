package ro.licenta.taberemanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Service
public class CheckInEmailService {
    @Autowired
    private EmailService emailService;//injectare servicu de email creat in emailService

     @Autowired
     private InscriereRepository inscriereRepository;

     @Autowired
     private UserRepository userRepository;

     public void sendEmailIfMinor(Long idInscriere){
         //extragere inscriere din bd pentru a avea accwes la participant si platitor
         Inscriere inscriere = inscriereRepository.findById(idInscriere)
                 .orElseThrow(()-> new RuntimeException("Înscrierea nu a fost găsită!"));

         Participant participant =inscriere.getParticipant();

         ///  Calculam varsta participantului pe baza datei de nastere

         int varsta =Period.between(participant.getDataNasterii(), LocalDate.now()).getYears();

         //daca participantul are sub 18 ani, trimitem emailul catre platitor care e de fapt parintele
         if(varsta <18)
         {
             /// extragere datele utilizatorului(parintele) folosind idPlatitor
           User platitor =userRepository.findById(inscriere.getIdPlatitor())
                   .orElseThrow(()-> new RuntimeException("Utilizatorul plătitor nu a fost găsit!"));

           String emailParinte = platitor.getEmail();
           String numeCompletCopil = participant.getNume()+ " " +participant.getPrenume();

          /// Construire mesaj
         String subiect ="Confirmare Check-in: "+ numeCompletCopil+ " a ajuns cu bine!";
         String mesaj ="Salutare,\n\n"
                 + "Te anunțăm cu bucurie că " + numeCompletCopil + " a făcut check-in-ul cu succes și a fost preluat de coordonatorii noștri.\n\n"
                 + "Găsești în contul tău din platformă toate detaliile despre programul următoarelor zile.\n\n"
                 + "Distracție plăcută și toate cele bune,\n"
                 + "Echipa CampCore";

         //Trimitere email
             emailService.sendSimpleEmail(emailParinte, subiect, mesaj);
         }

     }


}
