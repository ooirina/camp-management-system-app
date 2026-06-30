package ro.licenta.taberemanager.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Tabara;
import ro.licenta.taberemanager.model.Tranzactie;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.TabaraRepository;
import ro.licenta.taberemanager.repository.TranzactieRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BugetService {

    private final TranzactieRepository tranzactieRepository;
    private final InscriereRepository inscriereRepository;
    private final TabaraRepository tabaraRepository;
    private final EmailService emailService;

    // Înregistrează o tranzacție de tip INCASARE
    public void inregistreazaPlata(Long idInscriere, String stripeSessionId) {
        Inscriere inscriere = inscriereRepository.findById(idInscriere)
                .orElseThrow(() -> new RuntimeException("Inscrierea nu exista: " + idInscriere));

        boolean existaDeja = tranzactieRepository.findByIdInscriereOrderByDataTranzactieDesc(idInscriere)
                .stream()
                .anyMatch(t -> stripeSessionId != null && stripeSessionId.equals(t.getStripeSessionId()));

        if (existaDeja) {
            System.out.println("Tranzactie deja inregistrata pentru sesiunea: " + stripeSessionId);
            return;
        }

        Tranzactie tranzactie = Tranzactie.builder()
                .idInscriere(idInscriere)
                .tip("INCASARE")
                .suma(inscriere.getSuma())
                .dataTranzactie(LocalDateTime.now())
                .descriere("Plata inscriere tabara: " + inscriere.getTabara().getNume()
                        + " | Participant: " + inscriere.getParticipant().getNume()
                        + " " + inscriere.getParticipant().getPrenume())
                .stripeSessionId(stripeSessionId)
                .build();

        tranzactieRepository.save(tranzactie);
        System.out.println("Tranzactie INCASARE inregistrata pentru inscrierea " + idInscriere);
    }

    // Înregistrează o tranzacție de tip RAMBURSARE la anularea unei inscrieri deja platite
    // si trimite un email de confirmare catre platitor
    public void inregistreazaAnulare(Long idInscriere, String emailPlatitor) {
        Inscriere inscriere = inscriereRepository.findById(idInscriere)
                .orElseThrow(() -> new RuntimeException("Inscrierea nu exista: " + idInscriere));

        boolean eraPlatita = "PLATIT".equalsIgnoreCase(inscriere.getStatusPlata());

        if (eraPlatita) {
            Tranzactie rambursare = Tranzactie.builder()
                    .idInscriere(idInscriere)
                    .tip("RAMBURSARE")
                    .suma(inscriere.getSuma())
                    .dataTranzactie(LocalDateTime.now())
                    .descriere("Rambursare anulare — tabara: " + inscriere.getTabara().getNume()
                            + " | Participant: " + inscriere.getParticipant().getNume()
                            + " " + inscriere.getParticipant().getPrenume())
                    .stripeSessionId(null)
                    .build();

            tranzactieRepository.save(rambursare);
            System.out.println("Tranzactie RAMBURSARE inregistrata pentru inscrierea " + idInscriere);
        }

        String subiect = "Confirmare anulare inscriere - " + inscriere.getTabara().getNume();
        StringBuilder mesaj = new StringBuilder();
        mesaj.append("Buna ziua,\n\n");
        mesaj.append("Inscrierea participantului ")
                .append(inscriere.getParticipant().getNume()).append(" ")
                .append(inscriere.getParticipant().getPrenume())
                .append(" la tabara \"").append(inscriere.getTabara().getNume())
                .append("\" a fost anulata.\n\n");

        if (eraPlatita) {
            mesaj.append("Suma de ").append(inscriere.getSuma())
                    .append(" RON va fi rambursata in contul dumneavoastra in termen de 5-10 zile lucratoare.\n\n");
        } else {
            mesaj.append("Inscrierea nu fusese platita, deci nu exista sume de rambursat.\n\n");
        }
        mesaj.append("Locul a fost eliberat.\n\nCu stima,\nEchipa CampCore");

        emailService.sendSimpleEmail(emailPlatitor, subiect, mesaj.toString());
    }

    // Bugetul complet al unei tabere
    public Map<String, Object> getBugetTabara(Long idTabara) {
        BigDecimal incasat = tranzactieRepository.getTotalIncasat(idTabara);
        BigDecimal rambursat = tranzactieRepository.getTotalRambursat(idTabara);
        BigDecimal soldNet = tranzactieRepository.getSoldNet(idTabara);
        List<Tranzactie> istoric = tranzactieRepository.findByTabaraId(idTabara);

        Map<String, Object> buget = new HashMap<>();
        buget.put("totalIncasat", incasat);
        buget.put("totalRambursat", rambursat);
        buget.put("soldNet", soldNet);
        buget.put("nrTranzactii", istoric.size());
        buget.put("istoric", istoric);
        return buget;
    }

    // Bugetul agregat al TUTUROR taberelor — folosit exclusiv de Admin pentru supervizare financiara generala
    public Map<String, Object> getBugetAgregat() {
        List<Tabara> toateTaberele = tabaraRepository.findAll();

        BigDecimal incasatTotal = BigDecimal.ZERO;
        BigDecimal rambursatTotal = BigDecimal.ZERO;
        List<Map<String, Object>> perTabara = new ArrayList<>();

        for (Tabara t : toateTaberele) {
            BigDecimal incasat = tranzactieRepository.getTotalIncasat(t.getId());
            BigDecimal rambursat = tranzactieRepository.getTotalRambursat(t.getId());
            BigDecimal sold = tranzactieRepository.getSoldNet(t.getId());

            incasatTotal = incasatTotal.add(incasat);
            rambursatTotal = rambursatTotal.add(rambursat);

            Map<String, Object> rand = new HashMap<>();
            rand.put("idTabara", t.getId());
            rand.put("numeTabara", t.getNume());
            rand.put("totalIncasat", incasat);
            rand.put("totalRambursat", rambursat);
            rand.put("soldNet", sold);
            perTabara.add(rand);
        }

        Map<String, Object> rezultat = new HashMap<>();
        rezultat.put("totalIncasatGlobal", incasatTotal);
        rezultat.put("totalRambursatGlobal", rambursatTotal);
        rezultat.put("soldNetGlobal", incasatTotal.subtract(rambursatTotal));
        rezultat.put("perTabara", perTabara);
        return rezultat;
    }
}