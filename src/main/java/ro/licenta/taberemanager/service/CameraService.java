package ro.licenta.taberemanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Camera;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.repository.CameraRepository;
import ro.licenta.taberemanager.repository.InscriereRepository;

import java.util.List;

@Service
public class CameraService {

    @Autowired
    private CameraRepository cameraRepository;

    @Autowired
    private InscriereRepository inscriereRepository;


    public Camera salveazaCamera(Camera camera) {
        return cameraRepository.save(camera);
    }

    public List<Camera> getCamereTabara(Long idTabara) {
        return cameraRepository.findByTabaraId(idTabara);
    }

    // Participanții "nealocați" (id_camera null)
    public List<Inscriere> getNealocati(Long idTabara) {
        return inscriereRepository.findByTabaraIdAndCameraIsNull(idTabara).stream()
                .filter(ins -> "CONFIRMAT".equals(ins.getStatut()) && "PLATIT".equals(ins.getStatusPlata()))
                .toList();
    }

    // Logica de alocare
    public void alocaParticipant(Long idInscriere, Long idCamera) {
        Inscriere ins = inscriereRepository.findById(idInscriere).orElseThrow();
        Camera cam = cameraRepository.findById(idCamera).orElseThrow();

        // Verificare capacitate
        if (ins.getCamera() == null && cam.getLocatari().size() >= cam.getCapacitate()) {
            throw new RuntimeException("Camera este plina!");
        }

        ins.setCamera(cam);
        inscriereRepository.save(ins);
    }

    // Stergere alocare (Scoate din camera)
    public void scoateDinCamera(Long idInscriere) {
        Inscriere ins = inscriereRepository.findById(idInscriere).orElseThrow();
        ins.setCamera(null);
        inscriereRepository.save(ins);
    }


    public Camera updateCamera(Long id, Camera cameraDetails) {
        Camera cam = cameraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Camera nu exista"));
        cam.setNumar(cameraDetails.getNumar());
        cam.setCapacitate(cameraDetails.getCapacitate());
        cam.setEtaj(cameraDetails.getEtaj());
        return cameraRepository.save(cam);
    }

    // 6. Stergere camera
    public void stergeCamera(Long id) {
        Camera cam = cameraRepository.findById(id).orElseThrow();
        // integritate referentiala- Inainte de stergere, se scot toti locatarii din camera
        for (Inscriere ins : cam.getLocatari()) {
            ins.setCamera(null);
            inscriereRepository.save(ins);
        }
        cameraRepository.delete(cam);
    }
}