package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Participant;

import java.util.List;

@Repository
public interface ParticipantRepository extends  JpaRepository<Participant, Long>{
    // Spring Boot va genera automat query-ul SQL pe baza numelui metodei!
    List<Participant> findByIdUser(Long idUser);
    //extrage copiii care au ceva completat l alergii sau probleme  medicale doar pentru taberele unde coordonatorul respectiv are activitati
    @Query("SELECT DISTINCT p FROM Participant p " +
            "JOIN Inscriere i ON i.participant = p " +
            "WHERE i.tabara IN (SELECT a.tabara FROM Activitate a WHERE a.coordonator.id = :idCoordonator) " +
            "AND (p.alergii IS NOT NULL OR p.problemeMedicale IS NOT NULL) " +
            "AND (p.alergii != '' OR p.problemeMedicale != '') "+
            "ORDER BY p.nume ASC")
    List<Participant> findParticipantiMedicalByCoordonator(@Param("idCoordonator") Long idCoordonator);

    ///copii doar dintr-o o anumita tabaraa l coordonatorului
    @Query("SELECT DISTINCT p FROM Participant p " +
            "JOIN Inscriere i ON i.participant = p " +
            "WHERE i.tabara.id = :idTabara " +
            "AND i.tabara IN (SELECT a.tabara FROM Activitate a WHERE a.coordonator.id = :idCoordonator) " +
            "AND (p.alergii IS NOT NULL OR p.problemeMedicale IS NOT NULL) " +
            "AND (p.alergii != '' OR p.problemeMedicale != '') " +
            "ORDER BY p.nume ASC")
    List<Participant> findParticipantiMedicalByCoordonatorAndTabara(@Param("idCoordonator") Long idCoordonator, @Param("idTabara") Long idTabara);

   //îi spui bazei de date să sară "podul" construit de tabela Inscriere pentru a ajunge de la Tabără la Participant
   //sa aduca toti participantii care sunt inscrisi si platit in tabara
   @Query("SELECT p FROM Participant p JOIN Inscriere i ON i.participant = p WHERE i.tabara.id = :idTabara AND i.statut = 'CONFIRMAT' AND i.statusPlata = 'PLATIT'")
   List<Participant> findByTabaraIdReadyForKitchen(@Param("idTabara") Long idTabara);
}
