package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.Traseu;
import ro.licenta.taberemanager.repository.TraseuRepository;
import org.springframework.ui.Model;
import org.springframework.data.domain.Pageable;
import java.util.List;
@Controller
@RequestMapping("/trasee")

public class TraseuController {
    private final TraseuRepository repository;
public TraseuController(TraseuRepository repository){
    this.repository=repository;
}

@GetMapping("/lista")
@ResponseBody
    public List<Traseu> getAllTrails(){
    return repository.findAll();
}

@PostMapping
@ResponseBody
    public Traseu createTrail(@Valid @RequestBody  Traseu traseu)
{
    return repository.save(traseu);
}

@DeleteMapping("/{id}")
    @ResponseBody
    public void deleteTrail(@PathVariable Long id)
{
    repository.deleteById(id);
}
}
