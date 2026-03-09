package ro.licenta.taberemanager.service;

import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.repository.ParticipantRepository;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    // Constructor injection
    public ParticipantService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    public Participant salveazaParticipant(Participant p) {
        // cautare varsta in ani bazat pe data nasterii
        if (p.getDataNasterii() != null) {
            int varsta = Period.between(p.getDataNasterii(), LocalDate.now()).getYears();

            // logica de repartizare automată în grupuri
            if (varsta >= 7 && varsta <= 10) {
             //   p.setNumeGrup("Juniori (7-10 ani)");
            } else if (varsta >= 11 && varsta <= 14) {
              //  p.setNumeGrup("Exploratori (11-14 ani)");
            } else if (varsta >= 15 && varsta <= 18) {
             //   p.setNumeGrup("Adolescenți (15-18 ani)");
            } else {
              //  p.setNumeGrup("Alte Categorii");
            }
        }

        // salvăm obiectul completat cu grupul calculat
        return participantRepository.save(p);
    }

    public List<Participant> gasesteToti() {
        return participantRepository.findAll();
    }
}