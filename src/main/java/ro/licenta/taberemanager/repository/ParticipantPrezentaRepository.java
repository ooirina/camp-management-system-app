package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.dto.PrezentaDTO;
import ro.licenta.taberemanager.model.ParticipantPrezenta;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantPrezentaRepository extends  JpaRepository<ParticipantPrezenta,Long> {
    // Această metodă este necesară pentru a verifica dacă există deja o bifă în baza de date
    Optional<ParticipantPrezenta> findByInscriereIdAndActivitateId(Long idInscriere, Long idActivitate);
    @Query("SELECT new ro.licenta.taberemanager.dto.PrezentaDTO(" +
            "p.nume, p.prenume, t.nume, a.nume, " +
            "COALESCE(pp.prezenta, 'NU'), " +
            "pp.id, i.id, pp.observatii, a.id) " + // <-- adaugat a.id ca al 9-lea parametru
            "FROM Inscriere i " +
            "JOIN i.participant p " +
            "JOIN i.tabara t " +
            "CROSS JOIN Activitate a " +
            "LEFT JOIN ParticipantPrezenta pp ON pp.inscriere.id = i.id AND pp.activitate.id = a.id " +
            "WHERE t.id = :idTabara AND a.id = :idActivitate")
    List<PrezentaDTO> getListaPrezentaActivitate(@Param("idTabara") Long idTabara, @Param("idActivitate") Long idActivitate);
}
