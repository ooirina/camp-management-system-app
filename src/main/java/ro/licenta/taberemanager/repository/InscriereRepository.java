package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Inscriere;
@Repository

public interface InscriereRepository extends JpaRepository<Inscriere,Long> {
}
