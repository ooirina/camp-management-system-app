package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Tabara;
import ro.licenta.taberemanager.repository.TabaraRepository;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
@CrossOrigin(origins ="http://localhost:3000")
@RestController
@RequestMapping("/tabere")
public class TabaraController {

    private final TabaraRepository repository;
    public TabaraController(TabaraRepository repository)
    {
        this.repository=repository;

    }
    //creare tabara
    @PostMapping("/creare")
    public Tabara createCamp(@Valid  @RequestBody Tabara tabara){
        return repository.save(tabara);
    }

    //Lista cu toate taberele
    @GetMapping("/lista")
    public List<Tabara> showCamps(){
       return repository.findAll();
    }

    //Cautare tabara dupa id
    @GetMapping("/{id}")
    @ResponseBody
    public Tabara getCampById(@PathVariable("id") Long id){
        return repository.findById(id)
                .orElseThrow(()->new RuntimeException("Tabrara nu a fost gasita"));
    }
    //PAginare taberelor
    @GetMapping("/paginat")
    @ResponseBody
    public Page<Tabara> getCamps(Pageable pageable){
        return repository.findAll(pageable);
    }

    //Actualizare date tabara
    @PutMapping("actualizare/{id}")
    @ResponseBody
    public Tabara updateCamp(@PathVariable Long id, @Valid @RequestBody Tabara updatedCamp){
        return repository.findById(id)
                .map(camp-> {
                   camp.setNume(updatedCamp.getNume());
                   camp.setCapacitate(updatedCamp.getCapacitate());
                   camp.setDataInceput(updatedCamp.getDataInceput());
                   camp.setDataSfarsit(updatedCamp.getDataSfarsit());
                   camp.setLocatie(updatedCamp.getLocatie());
                   camp.setPret(updatedCamp.getPret());
                   camp.setTipPublic(updatedCamp.getTipPublic());
                   camp.setVarstaMin(updatedCamp.getVarstaMin());
                   camp.setVarstaMax(updatedCamp.getVarstaMax());

                    return repository.save(camp);
                })
                .orElseThrow(()->new RuntimeException("Particiant nu a fost gasit"));

    }
    @DeleteMapping("stergere/{id}")
    @ResponseBody
    public void deleteCamp (@PathVariable Long id){
        repository.deleteById(id);
    }

}
