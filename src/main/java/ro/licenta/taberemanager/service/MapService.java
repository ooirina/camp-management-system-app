package ro.licenta.taberemanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Tabara;
import ro.licenta.taberemanager.model.Traseu;
import ro.licenta.taberemanager.repository.TabaraRepository;
import ro.licenta.taberemanager.repository.TraseuRepository;

import java.util.List;

@Service
public class MapService {

    @Autowired
    private TabaraRepository tabaraRepository;

    @Autowired
    private TraseuRepository traseuRepository;

    public List<Tabara> getAllCampsWithTrails(){
        List<Tabara> tabere=tabaraRepository.findAll();
        for(Tabara t: tabere){
            //pt fiecare tabara, incarcam lista de trasee din bd
            List <Traseu> trasee= traseuRepository.findByTabaraId(t.getId());
            t.setTrasee(trasee);
        }
        return  tabere;
    }
}
