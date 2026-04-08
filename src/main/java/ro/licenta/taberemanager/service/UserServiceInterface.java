package ro.licenta.taberemanager.service;
import org.springframework.security.core.userdetails.UserDetailsService;
import ro.licenta.taberemanager.model.User;

import java.util.List;
public interface UserServiceInterface extends UserDetailsService {


public User findUserProfileByJwt(String jwt);
public User findUserByEmail(String email);
public List<User> findAllUsers();
public User saveUser(User user);
}
