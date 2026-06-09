package ro.licenta.taberemanager.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

//clasa actioneaza ca un pod intr-un folder fizic de calculator si internet

// @Configuration îi spune lui Spring Boot că aceasta este o clasă de setări
// care trebuie citită și aplicată automat la pornirea serverului.

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Găsește calea absolută către folderul "uploads" din proiect
        Path uploadDir = Paths.get("./uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // Expune folderul la adresa /uploads/**
        // se mapeaza URL ul public la folderul fizic privat
        // Orice cerere HTTP de tipul "http://localhost:8080/uploads/nume_fisier.pdf"
        // va fi direcționată să citească fișierul real din "file:C:/.../proiect/uploads/".
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }

}
