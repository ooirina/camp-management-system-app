package ro.licenta.taberemanager.controller;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.InscriereRepository;

import jakarta.annotation.PostConstruct;
import ro.licenta.taberemanager.repository.UserRepository;
import ro.licenta.taberemanager.service.EmailService;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/plati")
public class PaymentController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private InscriereRepository inscriereRepository;

    @Autowired
    private UserRepository userRepository;//pentru a gasi emailul


    //Spring boot injecteaza cheia secreta din application.properties
    @Value("${stripe.api.key}")
    private String stripeApiKey;

    public PaymentController(InscriereRepository inscriereRepository){
        this.inscriereRepository=inscriereRepository;

    }

// metoda aceasta ruleaza automat la pornitrea serverului si configureaza Stripe
@PostConstruct
    public void init(){
        Stripe.apiKey= stripeApiKey;
}
@PostMapping("/creaza-sesiune/{idInscriere}")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@PathVariable Long idInscriere){
      try{
          //se gaseste inscriere in bd
          Inscriere inscriere= inscriereRepository.findById(idInscriere)
                  .orElseThrow(()-> new RuntimeException("Înscrierea nu a fost găsită"));

          //stripe lucreza cu banii in format "centi"(sau bani pentru RON)
          //ex: 2500RON trerbuie trimis ca 250000
          long sumaInBani =inscriere.getSuma().longValue() *100L;

          //Configurare sesiune de plata
          SessionCreateParams params =SessionCreateParams.builder()
                  .setMode(SessionCreateParams.Mode.PAYMENT)
                  //url-URILE unne Stripe va trimite utilizatorul dupa ce termina procesul
                  .setSuccessUrl("http://localhost:3000/success-plata?session_id={CHECKOUT_SESSION_ID}&id_inscriere=" + idInscriere).setCancelUrl("http://localhost:3000/cancel-plata")
                  .addLineItem(
                          SessionCreateParams.LineItem.builder()
                                  .setQuantity(1L)
                                  .setPriceData(
                                          SessionCreateParams.LineItem.PriceData.builder()
                                                  .setCurrency("ron")
                                                  .setUnitAmount(sumaInBani)
                                                  .setProductData(
                                                          SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                  .setName("Taxă Tabără: " + inscriere.getTabara().getNume())
                                                                  .setDescription("Participant: " + inscriere.getParticipant().getNume() + " " + inscriere.getParticipant().getPrenume())
                                                                  .build())
                                                  .build())
                                  .build())
                  .build();

          // Se cere de la Stripe sa creeze sesiunea
          Session session =Session.create(params);

          //Se returneaza URL-ul securizat de plata catre frontend
          Map<String, String> responseData = new HashMap<>();
          responseData.put("url", session.getUrl());

          return ResponseEntity.ok(responseData);

      } catch (Exception e) {
          e.printStackTrace();
          Map<String, String> errorResponse = new HashMap<>();
          errorResponse.put("error", "Eroare la crearea sesiunii Stripe: " + e.getMessage());
          return ResponseEntity.badRequest().body(errorResponse);
      }
}

    @PutMapping("/plata-reusita/{id}")
    public ResponseEntity<String> marcheazaPlatit(@PathVariable Long id) {
        try {
            Inscriere inscriere = inscriereRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Înscrierea nu a fost găsită"));

            inscriere.setStatusPlata("PLATIT");
            inscriereRepository.save(inscriere);

            //trimitere emial de confirmare

            //  Găsești plătitorul
            User platitor = userRepository.findById(inscriere.getIdPlatitor())
                    .orElseThrow(() -> new RuntimeException("Plătitorul nu a fost găsit"));

            // Se trimite emailul folosind serviciul
            String subiect = "Confirmare plată tabără - CampManager";
            String mesaj = "Bună ziua,\n\nPlata pentru înscrierea copilului " +
                    inscriere.getParticipant().getPrenume() +
                    " a fost procesată cu succes. Vă mulțumim!";

            emailService.sendSimpleEmail(platitor.getEmail(), subiect, mesaj);

            return ResponseEntity.ok("Statusul plății a fost actualizat cu succes!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Eroare: " + e.getMessage());
        }
    }


}