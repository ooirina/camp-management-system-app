package ro.licenta.taberemanager.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.dto.LoginRequest;
import ro.licenta.taberemanager.dto.LoginResponse;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.UserRepository;
import ro.licenta.taberemanager.security.JwtService;
import ro.licenta.taberemanager.service.AuthService;
import ro.licenta.taberemanager.service.EmailService;
import ro.licenta.taberemanager.service.UserServiceInterface;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/autentificare")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    //folosit in singup
    @Autowired
    private UserServiceInterface userServiceInterface;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        String type=loginRequest.getLoginType();
        return ResponseEntity.ok(authService.login(loginRequest, type));
    }
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody User user) {
        // 1. Verificăm dacă email-ul există deja ca să nu avem dubluri
        if (userServiceInterface.findUserByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Eroare: Email-ul este deja utilizat!");
        }

        // 2. Criptăm parola înainte de salvare (OBLIGATORIU pentru securitate)
        user.setParola(passwordEncoder.encode(user.getParola()));

        // 3. Salvăm utilizatorul (va trebui să adaugi o metodă saveUser în Service)
        // userServiceInterface.saveUser(user);

        // 4. Opțional: Putem genera un token direct după înregistrare
        // ca utilizatorul să fie logat automat
        String token = jwtService.generateToken(user.getEmail());
        userServiceInterface.saveUser(user);
        return ResponseEntity.ok("Utilizator înregistrat cu succes! Token: " + token);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            String msg = authService.register(user);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {

        // Generăm un token unic de resetare
        String token = UUID.randomUUID().toString();
        // Salvăm token-ul pe user prin service — nu mai accesăm UserRepository direct
        userServiceInterface.saveResetToken(email, token);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendSimpleEmail(email, "Resetare Parolă", "Accesează acest link pentru a reseta parola: " + resetLink);

        return ResponseEntity.ok("Email trimis cu succes!");
    }


    // metoda care sa primeasca parola noua si tokenul
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {

        // Validare manuala — acest endpoint primeste parola ca String simplu (RequestParam),
        // nu prin obiectul User, deci adnotarea @Size de pe model nu se aplica automat aici
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Parola trebuie să aibă cel puțin 6 caractere");
        }

        // Căutare user după token prin service
        User user = userServiceInterface.findUserByResetToken(token);

        //schimba parola
        // parola criptată trebuie setată pe user, nu ignorată ──
        // Înainte: passwordEncoder.encode(newPassword) — rezultatul era aruncat!
        user.setParola(passwordEncoder.encode(newPassword));
        user.setResetToken(null); // Șterge token-ul după utilizare
        userServiceInterface.saveUser(user);

        return ResponseEntity.ok("Parolă schimbată!");
    }


}