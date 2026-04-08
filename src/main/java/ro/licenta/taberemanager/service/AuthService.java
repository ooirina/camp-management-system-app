package ro.licenta.taberemanager.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.dto.LoginRequest;
import ro.licenta.taberemanager.dto.LoginResponse;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.UserRepository;
import ro.licenta.taberemanager.security.JwtService;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;
    @Autowired
    UserServiceInterface userServiceInterface;

    public LoginResponse login(LoginRequest request){
        /// 1 cautare utilizator dupa email
        User user= userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new RuntimeException("Utilizator negăsit!"));
        //2 verificare parola trimisa necriptata se potriveste cu cea din bd
        if(!passwordEncoder.matches(request.getParola(), user.getParola()))
        {
            throw  new RuntimeException("Parolă incorectă!");
        }
        //3. genereaza token ul jwt

        String jwt= jwtService.generateToken(user.getEmail());
        String numeRol=String.valueOf(user.getIdRol());


        //4. Construim raspunsul
        return new LoginResponse(jwt, "Logare reușită", true, numeRol,user.getEmail());
    }

    public String register(User userNou){

        if(userRepository.findByEmail(userNou.getEmail())!=null){
            throw new RuntimeException("Eroare:Email-ul este deja utilizat!");
        }
        /// criptare parola
        userNou.setParola(passwordEncoder.encode(userNou.getParola()));
      /// setare rol defaul utilizator daca nu are unul
        if (userNou.getIdRol()==null){
            userNou.setIdRol(java.math.BigDecimal.valueOf(5));
        }

        userServiceInterface.saveUser(userNou);
        return "Utilizator înregistrat cu succes! ";

    }
}
