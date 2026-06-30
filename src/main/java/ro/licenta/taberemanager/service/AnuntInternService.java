package ro.licenta.taberemanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.dto.AnuntRequestDTO;
import ro.licenta.taberemanager.model.AnuntIntern;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.AnuntInternRepository;

import java.util.List;

@Service
public class AnuntInternService {

    @Autowired
    private AnuntInternRepository anuntRepository;

   @Autowired
    private UserServiceInterface userServiceInterface;

    // Aducere avizului pentru o tabara specifica
    public List<AnuntIntern> getAnunturiTabara(Long idTabara) {
        return anuntRepository.findByIdTabaraOrderByDataPostareDesc(idTabara);
    }

    // Coordonatorul principal salveaza un anunt nou
    public AnuntIntern posteazaAnunt(AnuntRequestDTO payload) {
        AnuntIntern anunt = new AnuntIntern();
        anunt.setIdTabara(payload.getIdTabara());
        anunt.setMesaj(payload.getMesaj());


        User autor = userServiceInterface.findUserById(payload.getIdAutor());

        anunt.setAutor(autor);
        return anuntRepository.save(anunt);
    }
}