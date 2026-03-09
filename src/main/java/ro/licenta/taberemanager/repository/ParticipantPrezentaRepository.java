package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.ParticipantPrezenta;
@Repository
public interface ParticipantPrezentaRepository extends  JpaRepository<ParticipantPrezenta,Long> {
}
