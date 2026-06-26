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
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

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
                        // Rute complet publice — autentificare, OAuth2, catalog tabere, harta
                        .requestMatchers("/autentificare/**", "/login/**", "/oauth2/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/tabere/lista", "/tabere/{id}", "/tabere/paginat").permitAll()
                        .requestMatchers("/map/**", "/trasee/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/categorii/**").permitAll()

                        //fisere din uploads cu fise medicale acces direct blocat
                        //singura cale valida e endpoint-ul protejat /inscrieri/{id}/fisa-medicala
                        .requestMatchers("/uploads/**").denyAll()


                        // Coordonator Principal si Admin — lista coordonatorilor (necesara la adaugarea unei activitati)
                        // EXCEPȚIE de poziție: trebuie declarată ÎNAINTE de /utilizatori/** (doar Admin) mai jos,
                        // fiindcă Spring Security aplică prima regulă care se potrivește
                                .requestMatchers("/utilizatori/coordonatori/lista").hasAnyAuthority("ROLE_1", "ROLE_2")

                         //necesar pentru salvarea userId după autentificare Google OAuth2
                        .requestMatchers("/utilizatori/get_id_user").permitAll()
                        // Doar Admin (ROLE_1) — gestiune utilizatori si gestiune tabere (creare/editare/stergere)
                                .requestMatchers("/utilizatori/**").hasAuthority("ROLE_1")
                                .requestMatchers(org.springframework.http.HttpMethod.POST, "/tabere/creare").hasAuthority("ROLE_1")
                                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/tabere/stergere/**").hasAuthority("ROLE_1")
                                .requestMatchers(org.springframework.http.HttpMethod.POST, "/categorii/creare").hasAuthority("ROLE_1")
                                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/categorii/stergere/**").hasAuthority("ROLE_1")

                        // Coordonator Principal si Admin — gestionarea globala a inscrierilor (vizualizare toate, confirmare, respingere)
                                .requestMatchers("/inscrieri/lista", "/inscrieri/toate", "/inscrieri/paginat").hasAnyAuthority("ROLE_1", "ROLE_2")
                                .requestMatchers("/inscrieri/coordonator/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/inscrieri/confirma/**", "/inscrieri/respinge/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                                .requestMatchers("/cazare/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                                .requestMatchers("/rapoarte/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                                .requestMatchers("/buget/**").hasAnyAuthority("ROLE_1", "ROLE_2")

                        // Utilizator autentificat (orice rol) — propriile inscrieri: creare, anulare, istoric, plata, fisa medicala
                        .requestMatchers("/inscrieri/save-completa", "/inscrieri/creare").authenticated()
                        .requestMatchers("/inscrieri/stergere/**", "/inscrieri/istoric/**").authenticated()
                        .requestMatchers("/inscrieri/locuri-disponibile/**", "/inscrieri/factura/**", "/inscrieri/upload-document/**").authenticated()

                        // Coordonator si Admin — prezenta, check-in/out, panou medical, comunicare interna
                        .requestMatchers("/prezenta/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers("/flux/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers("/anunturi-interne/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers("/broadcast/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                        // Coordonator si Admin — panou medical si rapoarte specifice bucatariei
                        .requestMatchers("/participanti/medical/**", "/participanti/raport-bucatarie/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers("/participanti/lista", "/participanti/paginat").hasAnyAuthority("ROLE_1", "ROLE_2")

                        // Utilizator autentificat (orice rol) — gestionarea propriilor participanti (familia mea)
                        .requestMatchers("/participanti/familie/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/participanti").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/participanti/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/participanti/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/participanti/{id}").authenticated()

                        .anyRequest().authenticated() // orice alta rută plăți, tabere actualizate, profil-doar autentificare valida


                )

                //opreste redirectionarea catre google daca calea e secretea
                .exceptionHandling(customizer -> customizer
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
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

}