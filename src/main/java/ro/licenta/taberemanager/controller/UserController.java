package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.UserRepository;
import org.springframework.ui.Model;
import org.springframework.data.domain.Pageable;

import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/utilizatori")
public class UserController {
    private final UserRepository repository;

    public UserController(UserRepository repository)
    {
        this.repository=repository;
    }

//Lista cu toti utilizatorii
    @GetMapping("/lista")
    public List<User> showUsers(){
      return repository.findAll();
    }
    /*
    @GetMapping
    public List<User> getAllUsers(){
    return repository.findAll();
    }
    */
//Se cauta un anumit utilizator dupa id
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id){
        return repository.findById(id).orElseThrow(()-> new RuntimeException("Utilizatorul nu a fost gasit"));
    }
/// Paginare
@GetMapping("/paginat")
public Page<User> getUsers(Pageable pageable){
    return repository.findAll(pageable);
}
//Se adauga un utilizator respectand regulile de validare din clasa USer
    @PostMapping("/creare")
    public User createUser(@Valid  @RequestBody User user){
        return repository.save(user);
    }

    //Actualizare un utilizator
    @PutMapping("/actualizare/{id}")
    public User updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser){
         return repository.findById(id)
                 .map(user->{
                     user.setEmail(updatedUser.getEmail());
                     user.setParola(updatedUser.getParola());
                     user.setIdRol(updatedUser.getIdRol());
                 return repository.save(user);
                 })
                 .orElseThrow(()-> new RuntimeException("Utilizatorul nu a fost gasit"));
    }
/// Stergere utilizator
    @DeleteMapping("/stergere/{id}")
    public void deleteUser(@PathVariable Long id)
    {
        repository.deleteById(id);
    }
}
