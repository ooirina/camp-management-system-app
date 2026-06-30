package ro.licenta.taberemanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.repository.ParticipantRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ParticipantService {

    @Autowired
    private ParticipantRepository repository;


    public List<Participant> findAll() {
        return repository.findAll();
    }

    // Lista participanților unei singure tabere
    public List<Participant> findByTabaraId(Long idTabara) {
        return repository.findByTabaraId(idTabara);
    }


    public Participant findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participantul nu a fost gasit"));
    }

   /* // PAginare participanti
    public Page<Participant> findAllPaged(Pageable pageable) {
        return repository.findAll(pageable);
    }
*/
    // Aducere lista de membrii ai familiei pentru un anumit user(parinte)
    public List<Participant> findByIdUser(Long idUser) {
        return repository.findByIdUser(idUser);
    }

    // panoul medical pentru coordonator general toate taberele lui
    public List<Participant> findParticipantiMedicalByCoordonator(Long idCoordonator) {
        return repository.findParticipantiMedicalByCoordonator(idCoordonator);
    }

    // panou medical pentru coordonator pt o anumita tabara
    public List<Participant> findParticipantiMedicalByCoordonatorAndTabara(Long idCoordonator, Long idTabara) {
        return repository.findParticipantiMedicalByCoordonatorAndTabara(idCoordonator, idTabara);
    }

    //Logica de raport meniu-  metoda care face agregare(o grupare si numarare)
    public Map<String, Long> getRaportBucatarie(Long idTabara) {
        List<Participant> participanti = repository.findByTabaraIdReadyForKitchen(idTabara);

        long total = participanti.size();

        // agregam alergiile(grupare dupa detalii_medicale)
        Map<String, Long> raport = participanti.stream()
                .filter(p -> p.getAlergii() != null && !p.getAlergii().isBlank())
                .collect(Collectors.groupingBy(Participant::getAlergii, Collectors.counting()));
        raport.put("Total Porții", total);
        return raport;
    }


    public Participant salveazaParticipant(Participant participant) {
        return repository.save(participant);
    }

    // Actualizare date participant
    public Participant updateParticipant(Long id, Participant updatedParticipant) {
        return repository.findById(id)
                .map(participant -> {
                    participant.setNume(updatedParticipant.getNume());
                    participant.setPrenume(updatedParticipant.getPrenume());
                    participant.setDataNasterii(updatedParticipant.getDataNasterii());
                    participant.setTelefon(updatedParticipant.getTelefon());
                    participant.setGen(updatedParticipant.getGen());
                    participant.setAlergii(updatedParticipant.getAlergii());
                    participant.setProblemeMedicale(updatedParticipant.getProblemeMedicale());
                    participant.setContactUrgenta(updatedParticipant.getContactUrgenta());
                    participant.setIdUser(updatedParticipant.getIdUser());
                    return repository.save(participant);
                })
                .orElseThrow(() -> new RuntimeException("Particiant nu a fost gasit"));
    }

    public void deleteParticipant(Long id) {
        repository.deleteById(id);
    }
}