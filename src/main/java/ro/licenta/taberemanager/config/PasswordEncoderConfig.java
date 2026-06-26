package ro.licenta.taberemanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// Clasă separată doar pentru beanul PasswordEncoder, ca să rupă dependența circulară dintre SecurityConfig -> JwtAuthenticationFilter -> UserService -> PasswordEncoder
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}