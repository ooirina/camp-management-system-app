package ro.licenta.taberemanager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.model.Camera;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.repository.CameraRepository;
import ro.licenta.taberemanager.repository.InscriereRepository;

import java.util.List;

@RestController
@RequestMapping("/cazare")
@CrossOrigin(origins = "http://localhost:3000")
public class CameraController {

    @Autowired
    private CameraRepository cameraRepository;

    @Autowired
    private InscriereRepository inscriereRepository;

    // 1. CRUD Clasic - Adaugare camera
    @PostMapping("/camera/salveaza")
    public Camera salveazaCamera(@RequestBody Camera camera) {
        return cameraRepository.save(camera);
    }

    // 2. Lista de camere pentru o tabără (Include locatarii prin relatia @OneToMany)
    @GetMapping("/camere/tabara/{idTabara}")
    public List<Camera> getCamereTabara(@PathVariable Long idTabara) {
        return cameraRepository.findByTabaraId(idTabara);
    }

    // 3. Participanții "nealocați" (id_camera IS NULL) pentru o tabara
    @GetMapping("/participanti/nealocati/{idTabara}")
    public List<Inscriere> getNealocati(@PathVariable Long idTabara) {
        return inscriereRepository.findByTabaraIdAndCameraIsNull(idTabara).stream()
                                  .filter(ins -> "CONFIRMAT".equals(ins.getStatut()) && "PLATIT".equals(ins.getStatusPlata()))
                                  .toList();
    }

    // 4. Logica de alocare: Muta un participant intr-o camera
    @PostMapping("/alocare")
    public void alocaParticipant(@RequestParam Long idInscriere, @RequestParam Long idCamera) {
        Inscriere ins = inscriereRepository.findById(idInscriere).orElseThrow();
        Camera cam = cameraRepository.findById(idCamera).orElseThrow();

        // Verificare capacitate
        if (ins.getCamera() == null && cam.getLocatari().size() >= cam.getCapacitate()) {
            throw new RuntimeException("Camera este plina!");
        }

        ins.setCamera(cam);
        inscriereRepository.save(ins);
    }

    // 5. Stergere alocare (Scoate din camera)
    @PostMapping("/evacuare")
    public void scoateDinCamera(@RequestParam Long idInscriere) {
        Inscriere ins = inscriereRepository.findById(idInscriere).orElseThrow();
        ins.setCamera(null);
        inscriereRepository.save(ins);
    }

    // UPDATE camera
    @PutMapping("/camera/update/{id}")
    public Camera updateCamera(@PathVariable Long id, @RequestBody Camera cameraDetails){
       Camera cam= cameraRepository.findById(id)
               .orElseThrow(()-> new RuntimeException("Camera nu exista"));
       cam.setNumar(cameraDetails.getNumar());
       cam.setCapacitate(cameraDetails.getCapacitate());
       cam.setEtaj(cameraDetails.getEtaj());
       return cameraRepository.save(cam);
    }

    //6. Stergere camera
    @DeleteMapping("/camera/sterge/{id}")
    public void stergeCamera(@PathVariable Long id) {
        Camera cam = cameraRepository.findById(id).orElseThrow();
        // Inainte de stergere, "evacuam" toti locatarii
        for (Inscriere ins : cam.getLocatari()) {
            ins.setCamera(null);
            inscriereRepository.save(ins);
        }
        cameraRepository.delete(cam);
    }
}