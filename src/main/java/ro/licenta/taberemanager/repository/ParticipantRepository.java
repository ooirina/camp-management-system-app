package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Participant;

@Repository
public interface ParticipantRepository extends  JpaRepository<Participant, Long>{
}
