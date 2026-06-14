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
    @Autowired
    private UserServiceInterface userServiceInterface;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
       String type=loginRequest.getLoginType();
        return ResponseEntity.ok(authService.login(loginRequest, type));
    }
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
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
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            String msg = authService.register(user);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email inexistent"));

        // Generăm un token
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        userRepository.save(user);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendSimpleEmail(email, "Resetare Parolă", "Accesează acest link pentru a reseta parola: " + resetLink);

        return ResponseEntity.ok("Email trimis cu succes!");
    }

    // metoda care sa primeasca parola noua si tokenul
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        User user = userRepository.findByResetToken(token) // Trebuie să adaugi metoda asta în UserRepository
                .orElseThrow(() -> new RuntimeException("Token invalid"));

        //schimba parola
        passwordEncoder.encode(newPassword);
        user.setResetToken(null); // Șterge token-ul după utilizare
        userRepository.save(user);

        return ResponseEntity.ok("Parolă schimbată!");
    }


}
