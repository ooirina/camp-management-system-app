package ro.licenta.taberemanager.controller;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ro.licenta.taberemanager.dto.SchimbareParolaDTO;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.UserRepository;
import org.springframework.ui.Model;
import org.springframework.data.domain.Pageable;
import ro.licenta.taberemanager.service.UserServiceInterface;
import ro.licenta.taberemanager.repository.ParticipantRepository;
import ro.licenta.taberemanager.repository.InscriereRepository;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/utilizatori")
public class UserController {

    private final UserServiceInterface userService;
    private final ParticipantRepository participantRepository;
    private final InscriereRepository inscriereRepository;

    public UserController(UserServiceInterface userService, ParticipantRepository participantRepository,InscriereRepository inscriereRepository) {
        this.userService = userService;
        this.participantRepository = participantRepository;
        this.inscriereRepository = inscriereRepository;
    }

//Lista cu toti utilizatorii
    @GetMapping("/lista")
    public List<User> showUsers() {
    return userService.findAllUsers();
    }

  /// toti coordoantroii(rol 2)-folosit in activityForm pt dropdown
    @GetMapping("/coordonatori/lista")
    public List<User> getTotiCoordonatorii() {

        return userService.findAllUsers().stream()
                .filter(u -> u.getIdRol() != null && u.getIdRol().intValue() ==2 )
                .collect(Collectors.toList());
    }


//Se cauta un anumit utilizator dupa id
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id){
        return userService.findAllUsers().stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
    }

/// Paginare
@GetMapping("/paginat")
public List<User> getUsers() {
    // Paginarea se poate adăuga ulterior prin UserRepository dacă e nevoie
    return userService.findAllUsers();
}

//Se adauga un utilizator respectand regulile de validare din clasa USer

    @PostMapping("/creare")
    public User createUser(@Valid  @RequestBody User user){
        return userService.saveUser(user);
    }

    //Actualizare un utilizator
    @PutMapping("/actualizare/{id}")
    public User updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser){
        User existing = userService.findAllUsers().stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));

        existing.setEmail(updatedUser.getEmail());
        existing.setParola(updatedUser.getParola());
        existing.setIdRol(updatedUser.getIdRol());
        return userService.saveUser(existing);
    }

    // Ștergere utilizator cu verificare integritate referențială
    @DeleteMapping("/stergere/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {

        // 1. Verificare dacă userul are participanți (copii) înregistrați
        boolean areParticipanti = !participantRepository.findByIdUser(id).isEmpty();
        if (areParticipanti) {
            return ResponseEntity.badRequest()
                    .body("Nu poți șterge acest utilizator! Are participanți (copii) înregistrați în sistem.");
        }

        // 2. Verificare dacă userul are înscrieri ca platitor (s-a inscris el insusi)
        // Nu se poate sterge daca are inscrieri active — orice statut diferit de ANULAT
        boolean areInscrieri = inscriereRepository.findAll().stream()
                .anyMatch(i -> id.equals(i.getIdPlatitor()) &&
                        !"ANULAT".equals(i.getStatut()));
        if (areInscrieri) {
            return ResponseEntity.badRequest()
                    .body("Nu poți șterge acest utilizator! Are înscrieri active în sistem.");
        }

        userService.deleteUser(id);
        return ResponseEntity.ok("Utilizatorul a fost șters cu succes.");
    }

    // Căutare ID după email folosit din React pentru a salva userId în localStorage
    @GetMapping("/get_id_user")
    public ResponseEntity<Long> getUserIdByEmail(@RequestParam String email) {
        User user = userService.findUserByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user.getId());
        }
        return ResponseEntity.notFound().build();
    }

    // Schimbare voluntara a parolei din profil
    @PutMapping("/{id}/schimbare-parola")
    public ResponseEntity<String> schimbaParola(@PathVariable Long id, @RequestBody SchimbareParolaDTO dto)
    {
        try{
            userService.schimbaParola(id,dto.getParolaVeche(), dto.getParolaNoua());
            return ResponseEntity.ok("Parola a fost schimbată cu succes.");
        }catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
