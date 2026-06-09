package ro.licenta.taberemanager.controller;

import  ro.licenta.taberemanager.model.AnuntIntern;
import ro.licenta.taberemanager.model.User;
import  ro.licenta.taberemanager.repository.AnuntInternRepository;
import ro.licenta.taberemanager.dto.AnuntRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/anunturi-interne")
@CrossOrigin(origins = "http://localhost:3000")
public class AnuntInternController {

    @Autowired
    private  AnuntInternRepository anuntRepository;

    @Autowired
    private UserRepository userRepository;

    //aducere avizului pentru o tabara specifica
    @GetMapping("/tabara/{idTabara}")
    public List<AnuntIntern> getAnunturiTabara(@PathVariable Long idTabara) {
        return anuntRepository.findByIdTabaraOrderByDataPostareDesc(idTabara);
       }

    //Coordonatorul sef salveaza un anunt nou
    @PostMapping("/salveaza")
    public AnuntIntern posteazaAnunt(@RequestBody AnuntRequestDTO payload) {

        AnuntIntern anunt = new AnuntIntern();
        anunt.setIdTabara(payload.getIdTabara());
        anunt.setMesaj(payload.getMesaj());

        //cautare coordonator in bd dupa id din dto, din react->dto adus
        User autor = userRepository.findById(payload.getIdAutor())
                .orElseThrow(() -> new RuntimeException("Eroare: Utilizatorul autor nu a fost găsit!"));

        //Afisare autor complet al anuntului
       anunt.setAutor(autor);
       return anuntRepository.save(anunt);
       }
    }
