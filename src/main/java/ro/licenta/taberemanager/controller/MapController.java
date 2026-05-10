package ro.licenta.taberemanager.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.licenta.taberemanager.model.Tabara;
import ro.licenta.taberemanager.service.MapService;

import java.util.List;

@RestController
@RequestMapping("/map")
@CrossOrigin(origins = "http://localhost:3000")
public class MapController {
    @Autowired
    private MapService mapService;

    /// returneaza lista de tabere, fiecare avand lista sa de trasee inclusa
    @GetMapping("/locatii")
    public List<Tabara> getMapList(){
       return mapService.getAllCampsWithTrails();
    }

}
