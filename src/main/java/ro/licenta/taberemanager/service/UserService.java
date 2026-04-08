package ro.licenta.taberemanager.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.UserRepository;
import ro.licenta.taberemanager.security.JwtService;


@Service
public class UserService  implements UserServiceInterface {
@Autowired
    private UserRepository userRepository;
@Autowired
private JwtService jwtService;
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilizator negăsit cu email-ul: " + email));

    String roleName="ROLE_"+user.getIdRol().toString();

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getParola(),
                Collections.singletonList(new SimpleGrantedAuthority(roleName)) // Rol default
        );
    }
    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public User findUserProfileByJwt(String jwt)
    {//extragere email din token folosind serviciul de JWT
        String email=jwtService.extractEmail(jwt);
        //cautare utilizator in baza de date
        return userRepository.findByEmail(email)
        .orElseThrow(()-> new RuntimeException("Utilizatorul nu a fost gasit pentru acest token."));

    }
    @Override
    public User saveUser(User user) {
        // Aici Spring Data JPA face toată magia în spate
        return userRepository.save(user);
    }
    }
