package ro.licenta.taberemanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LicentaTabereApplication {

    public static void main(String[] args) {
        SpringApplication.run(LicentaTabereApplication.class, args);
    }

}
