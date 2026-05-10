package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Traseu;

import java.util.List;

@Repository
public interface TraseuRepository extends  JpaRepository<Traseu, Long> {

  //cauta toate traseele apartinand unei tabere specifice
  List<Traseu> findByTabaraId(Long idTabara);
}
