package ro.licenta.taberemanager.repository;

import ro.licenta.taberemanager.model.AnuntIntern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnuntInternRepository extends JpaRepository<AnuntIntern, Long> {

List<AnuntIntern> findByIdTabaraOrderByDataPostareDesc(Long idTabara);
}
