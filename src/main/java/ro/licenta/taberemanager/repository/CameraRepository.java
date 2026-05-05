package ro.licenta.taberemanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Camera;
import java.util.List;

@Repository
public interface CameraRepository extends JpaRepository<Camera, Long> {
    // Lista de camere pentru o tabara specifica
    List<Camera> findByTabaraId(Long idTabara);

}