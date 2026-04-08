package ro.licenta.taberemanager.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ro.licenta.taberemanager.service.UserServiceInterface;

import java.io.IOException;

@Component//piesa de sistem
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserServiceInterface userServiceInterface;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Luăm Header-ul "Authorization"
        String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String userEmail = null;

        // 2. Verificăm dacă începe cu "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);

            try {
                userEmail = jwtService.extractEmail(jwt);//verifica daca tokenul e expirat sau modificat manual
            }catch (Exception e) {
                System.out.println("Token expirat sau invalid:" +e.getMessage());
                // Logăm eroarea în consolă ca să știm ce s-a întâmplat, dar nu blocăm cererea
                // userEmail rămâne null, deci codul de mai jos (Pasul 3) va fi sărit automat
            }

        }
        // 3. Dacă avem email și user-ul nu e deja logat în sistem
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userServiceInterface.loadUserByUsername(userEmail);

            // 4. Validăm token-ul
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 5. Îl marcăm ca fiind "Autentificat"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 6. Trimitem cererea mai departe către restul aplicației(chiar daca tokenul a fost bun , expirat sau lipseste trebuie lasata cerea sa treaca msai departe
        filterChain.doFilter(request, response);
    }

}
