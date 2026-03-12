package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.repository.InscriereRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/inscrieri")
public class InscriereController {

    private final InscriereRepository repository;
    public InscriereController(InscriereRepository repository){
        this.repository=repository;
    }


    @GetMapping("/lista")
    @ResponseBody
    public List<Inscriere> getAllRegistrations(){
        return repository.findAll();
    }
  //Cautare Activitate dupa id
  @GetMapping("/{id}")
  @ResponseBody
  public Inscriere getRegistrationById(@PathVariable Long id){
      return repository.findById(id)
              .orElseThrow(()->new RuntimeException("Inregistrarea nu a fost gasita"));
  }
    //PAginare Activitatei
    @GetMapping("/paginat")
    @ResponseBody
    public Page<Inscriere> getRegistrations(Pageable pageable){
        return repository.findAll(pageable);
    }

    //creare
    @PostMapping("/creare")
    @ResponseBody
    public Inscriere createRegistration(@Valid @RequestBody  Inscriere inscriere)
    {
        return repository.save(inscriere);
    }

    @DeleteMapping("/stergere/{id}")
    @ResponseBody
    public void deleteRegistration(@PathVariable Long id)
    {
        repository.deleteById(id);
    }

    //actualizare inscriere
    @PutMapping("/actualizare/{id}")
    public Inscriere updateRegistration(@PathVariable Long id, @Valid @RequestBody Inscriere updatedRegistration){
        return repository.findById(id)
                .map(registration->{
                    registration.setDataInscriere(updatedRegistration.getDataInscriere());
                    registration.setDataPlata(updatedRegistration.getDataPlata());
                    registration.setStatut(updatedRegistration.getStatut());
                    registration.setSuma(updatedRegistration.getSuma());
                    registration.setIdPlatitor(updatedRegistration.getIdPlatitor());
                    registration.setStatusPlata(updatedRegistration.getStatusPlata());
                    registration.setIdParticipant(updatedRegistration.getIdParticipant());
                    registration.setIdTabara(updatedRegistration.getIdTabara());
                    return repository.save(registration);
                })
                .orElseThrow(()-> new RuntimeException("Utilizatorul nu a fost gasit"));
    }
    
    
    
}
