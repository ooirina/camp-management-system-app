package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Tabara;
@Repository
public interface TabaraRepository extends JpaRepository<Tabara,Long> {
}
