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

    public LoginResponse login(LoginRequest request, String loginType){

        User user= userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new RuntimeException("Email sau parolă incorectă!"));

        if(!passwordEncoder.matches(request.getParola(), user.getParola()))
        {
            throw  new RuntimeException("Email sau parolă incorectă!");
        }

        int roleId= user.getIdRol().intValue();

        //verificare paagian potrivita in fucntie de rol
       if("ADMIN".equals(loginType)&& roleId!=1 && roleId != 2)
       {
           throw new RuntimeException("Acces interzis:Acest cont nu are drepturi de administrator sau coordonator.");
       }
      // daca  e la pagina de user, dar are id de admin
       if("USER".equals(loginType)&& roleId ==1)
       {
           throw new RuntimeException("Acces interzis: Administratorii trebuie să folosească portalul dedicat.");
       }

        // genereaza token ul jwt

        String jwt= jwtService.generateToken(user.getEmail());
        String numeRol=String.valueOf(user.getIdRol());



        return new LoginResponse(jwt, "Logare reușită", true, numeRol,user.getEmail(),user.getId());
    }

    public String register(User userNou){

        if(userRepository.findByEmail(userNou.getEmail()).isPresent()) {
            throw new RuntimeException("Eroare: Email-ul este deja utilizat!");
        }

        userNou.setParola(passwordEncoder.encode(userNou.getParola()));

        if (userNou.getIdRol()==null){
            userNou.setIdRol(java.math.BigDecimal.valueOf(5));
        }

        userServiceInterface.saveUser(userNou);
        return "Utilizator înregistrat cu succes! ";

    }
}
