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
    @Query( "SELECT new  ro.licenta.taberemanager.dto.InscriereDetaliiDTO(i.id,t.nume, i.dataInscriere, i.suma, i.statusPlata, p.nume, p.prenume, i.statut, i.documentMedical)"+
            " FROM Inscriere i JOIN i.tabara t JOIN i.participant p"+" WHERE i.idPlatitor =:idPlatitor"+" ORDER BY i.id DESC")

    List<InscriereDetaliiDTO> findDetailedInscrieri(@Param("idPlatitor") Long idPlatitor);
    List<Inscriere> findByTabaraIdAndCameraIsNull(Long idTabara);
    List<Inscriere> findByTabaraId(Long idTabara);
    // Numără doar înscrierile active (exclude ANULAT și WAITLIST), ca anularea să elibereze efectiv locul
    @Query("SELECT COUNT(i) FROM Inscriere i WHERE i.tabara.id = :tabaraId AND i.statut NOT IN ('ANULAT', 'WAITLIST')")
    long countByTabaraId(@Param("tabaraId") Long tabaraId);
    //metoda care filtreaza inscrierile dupa status si status plata
    List<Inscriere> findByTabaraIdAndStatutAndStatusPlata(Long idTabara, String statut, String statusPlata);

    @Query(value = "SELECT DISTINCT u.email FROM inscriere i " +
            "JOIN utilizator u ON i.id_user = u.id " +
            "WHERE i.id_tabara = :idTabara AND i.status_plata = 'PLATIT'",
            nativeQuery = true)
    List<String> findConfirmedParentsEmails(@Param("idTabara") Long idTabara);

    List<Inscriere> findByTabara_IdCoordonatorPrincipal(Long idCoordonator);

    List<Inscriere> findByTabara_IdCoordonatorPrincipalAndTabara_Id(Long idCoordonator, Long idTabara);

}