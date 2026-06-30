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
    private final UserServiceInterface userService;
    private final ParticipantService participantService;
    private final BugetService bugetService;

    @Transactional
    public Inscriere creeazaInscriereCompleta(InscriereDTO dto) {

        Tabara tabara = tabaraRepository.findById(dto.getIdTabara())
                .orElseThrow(() -> new RuntimeException("Tabara nu exista"));

        long inscrieriCurente = inscriereRepository.countByTabaraId(tabara.getId());
        String statusInscriere = "PENDING"; //status default

        if (tabara.getCapacitate().longValue() - inscrieriCurente <= 0) {

            statusInscriere = "WAITLIST";
         //   System.out.println("Tabăra este plină. Participantul va fi pus pe WAITLIST.");
        }

       //cautare user
        User user = userService.findUserByEmail(dto.getEmailUtilizator());
        if (user == null) {
            throw new RuntimeException("Userul nu a fost găsit");
        }

        //particiant
        Participant p;

        if (dto.getIdParticipant() != null) {

            p = participantService.findById(dto.getIdParticipant());
        } else {

            p = new Participant();
        }

       //salveaza participantul-toate datele
        p.setNume(dto.getNumeParticipant());
        p.setPrenume(dto.getPrenumeParticipant());
        p.setDataNasterii(dto.getDataNasterii());
        p.setGen(dto.getGen());
        p.setTelefon(dto.getTelefon());
        p.setAlergii(dto.getAlergii());
        p.setProblemeMedicale(dto.getProblemeMedicale());
        p.setContactUrgenta(dto.getContactUrgenta());
        p.setIdUser(user.getId());

        //id nou/ actualizare date
        Participant participantSalvat = participantService.salveazaParticipant(p);

        // Creare înscriere

        Inscriere inscriere = new Inscriere();
        inscriere.setDataInscriere(LocalDate.now());
        inscriere.setStatut(statusInscriere);
        inscriere.setSuma(BigDecimal.valueOf(dto.getSuma()));
        inscriere.setDataPlata(LocalDate.now());
        inscriere.setStatusPlata("NEPLATIT");
        inscriere.setStatusSosire("NESOSIT");
        inscriere.setTabara(tabara);
        inscriere.setParticipant(participantSalvat);
        inscriere.setIdPlatitor(user.getId());


        return inscriereRepository.saveAndFlush(inscriere);
    }

    //stergere cu integrare referentiala
    //nu se poate anula daca ziua curenta e in perioada taberei
    public void sterge(Long id) {
        inscriereRepository.findById(id).ifPresent(inscriere -> {


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


    //anulare automata
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