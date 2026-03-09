package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Traseu;

@Repository
public interface TraseuRepository extends  JpaRepository<Traseu, Long> {
}
