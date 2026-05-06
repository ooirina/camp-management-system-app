package ro.licenta.taberemanager.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import ro.licenta.taberemanager.model.User;
import ro.licenta.taberemanager.repository.UserRepository;
import ro.licenta.taberemanager.security.JwtAuthenticationFilter;
import ro.licenta.taberemanager.security.JwtService;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserRepository userRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Dezactivăm protecția CSRF (necesar pentru POST/DELETE)
                .cors(cors -> cors.configurationSource(request -> {
                    var opt = new CorsConfiguration();
                    opt.setAllowedOrigins(List.of("http://localhost:3000")); // Permitem React
                    opt.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
                    opt.setAllowedHeaders(List.of("*"));
                    opt.setAllowCredentials(true);
                    return opt;
                }))
              //  .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/autentificare/**","/login/**","/oauth2/**","/tabere/**","/activitati/**","/utilizatori/**","/inscrieri/**","/prezenta/**", "/cazare/**", "/flux/**").permitAll()
                        .anyRequest().authenticated() // PERMITEM TOT (provizoriu, pentru licență)


                )
                .oauth2Login(oauth2->oauth2
                        .successHandler((request, response, authentication)->{
                            ///extragere obiect Oauth2USer care contine toate datele de la google
                            OAuth2User oAuth2User=(OAuth2User) authentication.getPrincipal();
                            //luare email de la Google
                            String email=oAuth2User.getAttribute("email");//returneaza id intern sau email

                            //verificare daca userul exista in bd dupa email, daca nu se creaza unu nou
                            User user= userRepository.findByEmail(email).orElseGet(()->{
                                 //logica de inregistrare automata
                                  User newUser=new User();
                                  newUser.setEmail(email);
                                  newUser.setParola("");///parola goala pt utilizatori google
                                  newUser.setIdRol(BigDecimal.valueOf(5));//setare default rol USER
                                return userRepository.save(newUser);
                            });

                            //generare token folosind serviciul meu
                            String token=jwtService.generateToken(user.getEmail());

                            //redirectionam catre react cu token ul si demailul in url
                            String targetUrl="http://localhost:3000/dashboard?token="+token+ "&email="+email;
                            response.sendRedirect(targetUrl);
                        })
                );
        return http.build();
    }
    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

}