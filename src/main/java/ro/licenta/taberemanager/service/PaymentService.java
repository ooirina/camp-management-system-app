package ro.licenta.taberemanager.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private InscriereRepository inscriereRepository;

    @Autowired
    private UserServiceInterface userServiceInterface;

    @Autowired
    private BugetService bugetService;
    // Spring boot injecteaza cheia secreta din application.properties
    @Value("${stripe.api.key}")
    private String stripeApiKey;

    // Metoda aceasta ruleaza automat la pornitrea serverului si configureaza Stripe
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    // Creare sesiune Stripe Checkout
    public Map<String, String> createCheckoutSession(Long idInscriere) {
        try {
            // Se gaseste inscriere in bd
            Inscriere inscriere = inscriereRepository.findById(idInscriere)
                    .orElseThrow(() -> new RuntimeException("Înscrierea nu a fost găsită"));

            // Stripe lucreza cu banii in format "centi"(sau bani pentru RON)
            // ex: 2500RON trebuie trimis ca 250000
            long sumaInBani = inscriere.getSuma().longValue() * 100L;

            // Configurare sesiune de plata
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    // url-URILE unne Stripe va trimite utilizatorul dupa ce termina procesul
                    .setSuccessUrl("http://localhost:3000/success-plata?session_id={CHECKOUT_SESSION_ID}&id_inscriere=" + idInscriere)
                    .setCancelUrl("http://localhost:3000/cancel-plata")
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
            Session session = Session.create(params);

            // Se returneaza URL-ul securizat de plata catre frontend
            Map<String, String> responseData = new HashMap<>();
            responseData.put("url", session.getUrl());
            return responseData;

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Eroare la crearea sesiunii Stripe: " + e.getMessage());
            return errorResponse;
        }
    }

    // Marcare plata reusita + inregistrare tranzactie INCASARE + trimitere email confirmare
    public String marcheazaPlatit(Long id, String sessionId) {
        Inscriere inscriere = inscriereRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Înscrierea nu a fost găsită"));

        inscriere.setStatusPlata("PLATIT");
        inscriereRepository.save(inscriere);

        // Inregistreaza tranzactia de tip INCASARE in modulul de buget
        // sessionId e folosit pentru deduplicare — se evita inregistrarea de doua ori a aceleiasi plati
        bugetService.inregistreazaPlata(id, sessionId);

        // Găsești plătitorul
        User platitor = userServiceInterface.findUserById(inscriere.getIdPlatitor());

        // Se trimite emailul folosind serviciul
        String subiect = "Confirmare plată tabără - CampManager";
        String mesaj = "Bună ziua,\n\nPlata pentru înscrierea copilului " +
                inscriere.getParticipant().getPrenume() +
                " a fost procesată cu succes. Vă mulțumim!";

        emailService.sendSimpleEmail(platitor.getEmail(), subiect, mesaj);
        return "Statusul plății a fost actualizat cu succes!";
    }
}