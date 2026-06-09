package ro.licenta.taberemanager.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "anunt_intern")
public class AnuntIntern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_tabara", nullable = false)
    private Long idTabara;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mesaj;

    @Column(name = "data_postare")
    private LocalDateTime dataPostare;

    @ManyToOne(fetch = FetchType.EAGER) // Aduce automat datele utilizatorului când citim un anunț
    @JoinColumn(name = "id_autor", nullable = false)
    private User autor; // Spring Boot va aduce automat tot user-ul (cu email, nume, etc.)


    // Se apelează automat înainte de salvarea în baza de date
    @PrePersist
    protected void onCreate() {
        this.dataPostare = LocalDateTime.now();
    }

}
