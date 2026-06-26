package ro.licenta.taberemanager.service;
import org.springframework.security.core.userdetails.UserDetailsService;
import ro.licenta.taberemanager.model.User;

import java.util.List;


// Interfața definește contractul serviciului de utilizatori.
// UserDetailsService este cerut de Spring Security pentru loadUserByUsername().

public interface UserServiceInterface extends UserDetailsService {


    // Folosit în AuthController pentru validarea profilului prin JWT
    public User findUserProfileByJwt(String jwt);

    // Folosit în AuthController (signup) și UserController
    public User findUserByEmail(String email);

    // Folosit în UserController (lista, paginare, coordonatori)
    public List<User> findAllUsers();

    // Folosit în AuthController (signup, register) și UserController (creare, actualizare)
    public User saveUser(User user);

    // Adăugat pentru UserController (stergere) — implementat în UserService
    public void deleteUser(Long id);

    // Folosit în AuthController (forgot-password)
    public User findUserByResetToken(String token);

    // Folosit în AuthController (forgot-password) — salvare token resetare
    public User saveResetToken(String email, String token);

    // Folosit în AnuntInternService — căutare user după ID
    public User findUserById(Long id);

    // Folosit în UserController (schimbare-parola) — verifică parola veche și o suprascrie
    public void schimbaParola(Long id, String parolaVeche, String parolaNoua);
}