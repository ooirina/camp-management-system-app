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

        // se ia header-ul "Authorization"
        String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String userEmail = null;

        // se verifia dacă începe cu "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);

            try {
                userEmail = jwtService.extractEmail(jwt);//verifica daca tokenul e expirat sau modificat manual
            }catch (Exception e) {
                System.out.println("Token expirat sau invalid:" +e.getMessage());
                  }

        }
        // daca e email și user-ul nu e deja logat în sistem
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userServiceInterface.loadUserByUsername(userEmail);

            // validare token-ul
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 5. Îl marcăm ca fiind "Autentificat"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Trimite cererea mai departe către restul aplicației(chiar daca tokenul a fost bun , expirat sau lipseste trebuie lasata cerea sa treaca msai departe
        filterChain.doFilter(request, response);
    }

}
