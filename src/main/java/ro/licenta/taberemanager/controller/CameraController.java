package ro.licenta.taberemanager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.model.Camera;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.service.CameraService;

import java.util.List;

@RestController
@RequestMapping("/cazare")
@CrossOrigin(origins = "http://localhost:3000")
public class CameraController {

    @Autowired
    private CameraService cameraService;

    // 1. CRUD Clasic - Adaugare camera
    @PostMapping("/camera/salveaza")
    public Camera salveazaCamera(@RequestBody Camera camera) {
        return cameraService.salveazaCamera(camera);
    }

    // 2. Lista de camere pentru o tabără (Include locatarii prin relatia @OneToMany)
    @GetMapping("/camere/tabara/{idTabara}")
    public List<Camera> getCamereTabara(@PathVariable Long idTabara) {
        return cameraService.getCamereTabara(idTabara);
    }

    // 3. Participanții "nealocați" (id_camera IS NULL) pentru o tabara
    @GetMapping("/participanti/nealocati/{idTabara}")
    public List<Inscriere> getNealocati(@PathVariable Long idTabara) {
        return cameraService.getNealocati(idTabara);
    }

    // 4. Logica de alocare: Muta un participant intr-o camera
    @PostMapping("/alocare")
    public void alocaParticipant(@RequestParam Long idInscriere, @RequestParam Long idCamera) {
        // Verificare capacitate și alocare — mutate în CameraService
        cameraService.alocaParticipant(idInscriere, idCamera);
    }

    // 5. Stergere alocare (Scoate din camera)
    @PostMapping("/evacuare")
    public void scoateDinCamera(@RequestParam Long idInscriere) {
        cameraService.scoateDinCamera(idInscriere);
    }

    // UPDATE camera
    @PutMapping("/camera/update/{id}")
    public Camera updateCamera(@PathVariable Long id, @RequestBody Camera cameraDetails) {
        return cameraService.updateCamera(id, cameraDetails);
    }

    // 6. Stergere camera
    @DeleteMapping("/camera/sterge/{id}")
    public void stergeCamera(@PathVariable Long id) {
        // Inainte de stergere, "evacuam" toti locatarii — logica în CameraService
        cameraService.stergeCamera(id);
    }
}