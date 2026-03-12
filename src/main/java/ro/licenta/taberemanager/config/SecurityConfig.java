package ro.licenta.taberemanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Dezactivăm protecția CSRF (necesar pentru POST/DELETE)
                .cors(cors -> cors.configurationSource(request -> {
                    var opt = new CorsConfiguration();
                    opt.setAllowedOrigins(List.of("http://localhost:3000")); // Permitem React
                    opt.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
                    opt.setAllowedHeaders(List.of("*"));
                    return opt;
                }))
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // PERMITEM TOT (provizoriu, pentru licență)
                );
        return http.build();
    }
}