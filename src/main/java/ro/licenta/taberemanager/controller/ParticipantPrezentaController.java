package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.ParticipantPrezenta;
import ro.licenta.taberemanager.repository.ParticipantPrezentaRepository;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/participant_prezenta")
public class ParticipantPrezentaController {
    private final ParticipantPrezentaRepository repository;
    public ParticipantPrezentaController(ParticipantPrezentaRepository repository){
        this.repository=repository;
    }

/// afisare/citire
    @GetMapping("/lista")
    @ResponseBody
    public List<ParticipantPrezenta> getAllAttendances(){
        return repository.findAll();
    }

    //Cautare participant dupa id
    @GetMapping("/{id}")
    @ResponseBody
    public ParticipantPrezenta getAttendanceById(@PathVariable Long id){
        return repository.findById(id)
                .orElseThrow(()->new RuntimeException("Prezenta nu a fost gasita"));
    }

    //PAginare prezenta
    @GetMapping("/paginat")
    @ResponseBody
    public Page<ParticipantPrezenta> getAttendance(Pageable pageable){
        return repository.findAll(pageable);
    }
/// creare
    @PostMapping("/creare")
    @ResponseBody
    public ParticipantPrezenta createAttendance(@Valid @RequestBody  ParticipantPrezenta prezenta)
    {
        return repository.save(prezenta);
    }
//stergere
    @DeleteMapping("/stergere/{id}")
    @ResponseBody
    public void deleteAttendance(@PathVariable Long id)
    {
        repository.deleteById(id);
    }

/// actualizare
    @PutMapping("/actualizare/{id}")
    @ResponseBody
    public ParticipantPrezenta updateAttendance(@PathVariable Long id,@Valid @RequestBody ParticipantPrezenta updatedAttendance){
        return repository.findById(id)
                .map(attandance-> {
                    attandance.setPrezenta(updatedAttendance.getPrezenta());
                    attandance.setObservatii(updatedAttendance.getObservatii());
                    attandance.setIdActivitate(updatedAttendance.getIdActivitate());
                    attandance.setIdParticipant(updatedAttendance.getIdParticipant());
                    return repository.save(attandance);
                })
                .orElseThrow(()->new RuntimeException("Prezenta nu a fost gasita ca sa fie modificata"));
    }

}

