package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Participant;

import java.util.List;

@Repository
public interface ParticipantRepository extends  JpaRepository<Participant, Long>{
    // Spring Boot va genera automat query-ul SQL pe baza numelui metodei!
    List<Participant> findByIdUser(Long idUser);
}
