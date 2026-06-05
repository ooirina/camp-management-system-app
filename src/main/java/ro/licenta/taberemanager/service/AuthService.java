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
        /// 1 cautare utilizator dupa email
        User user= userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new RuntimeException("Email sau parolă incorectă!"));
        //2 verificare parola trimisa necriptata se potriveste cu cea din bd
        if(!passwordEncoder.matches(request.getParola(), user.getParola()))
        {
            throw  new RuntimeException("Email sau parolă incorectă!");
        }
        //luare id ul rolului din obiectul user
        int roleId= user.getIdRol().intValue();

        //daca e la logare de admin/coordonator, dar are id ul de user sau altceva- se refuza
       if("ADMIN".equals(loginType)&& roleId!=1 && roleId != 2)
       {
           throw new RuntimeException("Acces interzis:Acest cont nu are drepturi de administrator sau coordonator.");
       }
  // daca  e la pagina de user, dar are id de admin
       if("USER".equals(loginType)&& roleId ==1)
       {
           throw new RuntimeException("Acces interzis: Administratorii trebuie să folosească portalul dedicat.");
       }

        //3. genereaza token ul jwt

        String jwt= jwtService.generateToken(user.getEmail());
        String numeRol=String.valueOf(user.getIdRol());


        //4. Construim raspunsul
        return new LoginResponse(jwt, "Logare reușită", true, numeRol,user.getEmail(),user.getId());
    }

    public String register(User userNou){

        if(userRepository.findByEmail(userNou.getEmail()).isPresent()) {
            throw new RuntimeException("Eroare: Email-ul este deja utilizat!");
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
