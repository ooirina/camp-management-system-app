package ro.licenta.taberemanager.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.licenta.taberemanager.dto.InscriereDTO;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.model.Tabara;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.repository.TabaraRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InscriereService {

    private final InscriereRepository inscriereRepository;
    private final TabaraRepository tabaraRepository;
    // UserRepository și ParticipantRepository înlocuite cu serviciile lor
    private final UserServiceInterface userService;
    private final ParticipantService participantService;
    private final BugetService bugetService;

    @Transactional
    public Inscriere creeazaInscriereCompleta(InscriereDTO dto) {

        // 1. Verificare tabără și locuri disponibile
        Tabara tabara = tabaraRepository.findById(dto.getIdTabara())
                .orElseThrow(() -> new RuntimeException("Tabara nu exista"));

        long inscrieriCurente = inscriereRepository.countByTabaraId(tabara.getId());
        String statusInscriere = "PENDING"; //status default

        if (tabara.getCapacitate().longValue() - inscrieriCurente <= 0) {
            //daca s-au atins locurile maxime, nu se da eroare, ci il pune pe participant la waitlist
            statusInscriere = "WAITLIST";
            System.out.println("Tabăra este plină. Participantul va fi pus pe WAITLIST.");
        }

        // 2. Găsire user după email
        //cautare user in bd dupa email de google pt a il lega de participant
        User user = userService.findUserByEmail(dto.getEmailUtilizator());
        if (user == null) {
            throw new RuntimeException("Userul nu a fost găsit");
        }

        // 3. Participant existent sau nou
        Participant p;
        // Verificăm dacă React ne-a trimis un ID de participant existent (din dropdown)
        if (dto.getIdParticipant() != null) {
            // Îl extragem din baza de date prin ParticipantService
            p = participantService.findById(dto.getIdParticipant());
        } else {
            // Doar dacă nu avem ID, creăm unul nou
            p = new Participant();
        }

        // Actualizăm sau setăm datele (în caz că părintele a schimbat un număr de telefon în formular)
        //salveaza mai întâi participantul-toate datele
        p.setNume(dto.getNumeParticipant());
        p.setPrenume(dto.getPrenumeParticipant());
        p.setDataNasterii(dto.getDataNasterii());
        p.setGen(dto.getGen());
        p.setTelefon(dto.getTelefon());
        p.setAlergii(dto.getAlergii());
        p.setProblemeMedicale(dto.getProblemeMedicale());
        p.setContactUrgenta(dto.getContactUrgenta());
        p.setIdUser(user.getId());

        //salvare :daca e nou , i se da un id nou, dar daca exista, doar face UPDATE la date
        Participant participantSalvat = participantService.salveazaParticipant(p);

        // 4. Creare înscriere
        /// dupa ce a salvat participantul:2. Creăm înscrierea automată(legare participant de tabara)
        Inscriere inscriere = new Inscriere();
        inscriere.setDataInscriere(LocalDate.now());
        inscriere.setStatut(statusInscriere);
        inscriere.setSuma(BigDecimal.valueOf(dto.getSuma()));
        inscriere.setDataPlata(LocalDate.now());
        inscriere.setStatusPlata("NEPLATIT");
        inscriere.setStatusSosire("NESOSIT");
        inscriere.setTabara(tabara); //se da obiectul intreg , nu foar id ul
        inscriere.setParticipant(participantSalvat); //id generat automat mai sus
        inscriere.setIdPlatitor(user.getId());

        // Folosește saveAndFlush în loc de save mai mult pt salvare fortata
        return inscriereRepository.saveAndFlush(inscriere);
    }

    //sergere cu integrare referentiala
    //nu se poate anula adca ziua curenta e in perioada taberei
    public void sterge(Long id) {
        inscriereRepository.findById(id).ifPresent(inscriere -> {

            // Verificare perioadă tabară
            LocalDate azi = LocalDate.now();
            LocalDate dataInceput = inscriere.getTabara().getDataInceput();
            LocalDate dataSfarsit = inscriere.getTabara().getDataSfarsit();

            boolean tabalaEsteActiva = (azi.isEqual(dataInceput) || azi.isAfter(dataInceput))
                    && (azi.isEqual(dataSfarsit) || azi.isBefore(dataSfarsit));

            if (tabalaEsteActiva) {
                throw new RuntimeException(
                        "Nu poți anula înscrierea! Tabăra \"" + inscriere.getTabara().getNume() +
                                "\" este în desfășurare în perioada " + dataInceput + " — " + dataSfarsit + "."
                );
            }

            // Setare ANULAT în loc de ștergere fizică
            inscriere.setStatut("ANULAT");
            Inscriere salvata = inscriereRepository.save(inscriere);

            // inregistrează rambursarea (daca era platita) și trimite email de confirmare anulare
            String emailPlatitor = userService.findUserById(salvata.getIdPlatitor()).getEmail();
            bugetService.inregistreazaAnulare(salvata.getId(), emailPlatitor);
        });
    }

    /*
     Job programat  adica o auto-anulare inscrieri PENDING neplatite de mai mult de 3 zile.
     nu se aplica inscrierilor WAITLIST, acestea nu au termen de expirare  (raman in coada de asteptare pana cand coordonatorul promoveaza manual cererea).
      Ruleaza o data pe zi, la ora 03:00.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void anuleazaAutomatInscrierileNeplatite() {
        LocalDate limita = LocalDate.now().minusDays(3);

        List<Inscriere> inscrieriExpirate = inscriereRepository.findAll().stream()
                .filter(i -> "PENDING".equals(i.getStatut()))
                .filter(i -> "NEPLATIT".equals(i.getStatusPlata()))
                .filter(i -> i.getDataInscriere() != null && i.getDataInscriere().isBefore(limita))
                .toList();

        for (Inscriere inscriere : inscrieriExpirate) {
            inscriere.setStatut("ANULAT");
            inscriereRepository.save(inscriere);

            try {
                String emailPlatitor = userService.findUserById(inscriere.getIdPlatitor()).getEmail();
                bugetService.inregistreazaAnulare(inscriere.getId(), emailPlatitor);
            } catch (Exception e) {
                System.err.println("Eroare la notificarea anularii automate pentru inscrierea "
                        + inscriere.getId() + ": " + e.getMessage());
            }

            System.out.println("Inscrierea " + inscriere.getId()
                    + " a fost anulata automat, termenul de 3 zile pentru plata a expirat.");
        }
    }


}