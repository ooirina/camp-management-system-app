package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Activitate;

import java.util.List;

@Repository
public interface ActivitateRepository extends JpaRepository<Activitate,Long> {
    List<Activitate> findByTabaraIdOrderByDataAsc(Long idTabara);
    // Spring Boot este atât de deștept încât va genera singur SQL-ul de căutare doar pe baza acestui nume!
    List<Activitate> findByCoordonatorId(Long idCoordonator);

}
