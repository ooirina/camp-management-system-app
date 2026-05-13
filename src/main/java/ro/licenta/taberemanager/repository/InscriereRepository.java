package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.licenta.taberemanager.dto.InscriereDetaliiDTO;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.dto.PrezentaDTO;

import java.util.List;

@Repository

public interface InscriereRepository extends JpaRepository<Inscriere,Long> {
  /// join intre inscriere si tabere pt istoric
  @Query( "SELECT new  ro.licenta.taberemanager.dto.InscriereDetaliiDTO(i.id,t.nume, i.dataInscriere, i.suma, i.statusPlata)"+
  " FROM Inscriere i JOIN i.tabara t "+" WHERE i.idPlatitor =:idPlatitor"+" ORDER BY i.id DESC")

  List<InscriereDetaliiDTO> findDetailedInscrieri(@Param("idPlatitor") Long idPlatitor);
    List<Inscriere> findByTabaraIdAndCameraIsNull(Long idTabara);
    List<Inscriere> findByTabaraId(Long idTabara);
    long countByTabaraId(Long tabaraId);



   }
