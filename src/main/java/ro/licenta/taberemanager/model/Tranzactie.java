package ro.licenta.taberemanager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "tranzactie")
public class Tranzactie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Înscrierea pentru care s-a făcut tranzacția, tabara se obtine prin join cu inscriere.idTabara, pt forma nominala 3nf
    @Column(name = "id_inscriere")
    private Long idInscriere;

    // INCASARE=plată primită  sau RAMBURSARE=bani returnați la anulare
    @Column(name = "tip")
    private String tip;

    @Column(name = "suma", precision = 10, scale = 2)
    private BigDecimal suma;

    //se completeaza aoutoamt la salvare automat la salvare
    @Column(name = "data_tranzactie")
    private LocalDateTime dataTranzactie;

    @Column(name = "descriere")
    private String descriere;

    // ID-ul sesiunii Stripe —ca sa nu ineregistram de 2 ori
    @Column(name = "stripe_session_id")
    private String stripeSessionId;
}