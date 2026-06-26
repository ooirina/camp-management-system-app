package ro.licenta.taberemanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.licenta.taberemanager.model.Tranzactie;

import  java.math.BigDecimal;
import java.util.List;

@Repository
public interface TranzactieRepository extends JpaRepository<Tranzactie, Long> {
    // Toate tranzacțiile unei înscrieri — folosit pentru deduplicare Stripe
    List<Tranzactie> findByIdInscriereOrderByDataTranzactieDesc(Long idInscriere);

    // Istoricul tranzacțiilor unei tabere se obține prin JOIN cu Inscriere,
    @Query("SELECT tr FROM Tranzactie tr JOIN Inscriere i ON tr.idInscriere = i.id " +
            "WHERE i.tabara.id = :idTabara ORDER BY tr.dataTranzactie DESC")
    List<Tranzactie> findByTabaraId(@Param("idTabara") Long idTabara);

    // Total încasat pentru o tabără (suma tuturor tranzactiilor de tip INCASARE)
    @Query("SELECT COALESCE(SUM(tr.suma), 0) FROM Tranzactie tr JOIN Inscriere i ON tr.idInscriere = i.id " +
            "WHERE i.tabara.id = :idTabara AND tr.tip = 'INCASARE'")
    BigDecimal getTotalIncasat(@Param("idTabara") Long idTabara);

    // Total rambursat pentru o tabără (suma tuturor tranzactiilor de tip RAMBURSARE)
    @Query("SELECT COALESCE(SUM(tr.suma), 0) FROM Tranzactie tr JOIN Inscriere i ON tr.idInscriere = i.id " +
            "WHERE i.tabara.id = :idTabara AND tr.tip = 'RAMBURSARE'")
    BigDecimal getTotalRambursat(@Param("idTabara") Long idTabara);

    // calcul sold net = total incasat - total rambursat
    @Query("SELECT COALESCE(SUM(CASE WHEN tr.tip = 'INCASARE' THEN tr.suma ELSE -tr.suma END), 0) " +
            "FROM Tranzactie tr JOIN Inscriere i ON tr.idInscriere = i.id WHERE i.tabara.id = :idTabara")
    BigDecimal getSoldNet(@Param("idTabara") Long idTabara);


}
