package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.model.ParticipantPrezenta;
import ro.licenta.taberemanager.repository.ParticipantPrezentaRepository;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
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
    @PostMapping
    @ResponseBody
    public ParticipantPrezenta createAttendance(@Valid @RequestBody  ParticipantPrezenta prezenta)
    {
        return repository.save(prezenta);
    }
//stergere
    @DeleteMapping("/{id}")
    @ResponseBody
    public void deleteAttendance(@PathVariable Long id)
    {
        repository.deleteById(id);
    }


}
