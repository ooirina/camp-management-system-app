package ro.licenta.taberemanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;

import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@Table(name="inscriere")

public class Inscriere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    @Column(name="data_inscriere")
    private LocalDate dataInscriere;
    @NotNull
    private String statut;
    @NotNull
    private BigDecimal suma;
   // @NotNull
    @Column(name="data_plata")
    private LocalDate dataPlata;
    //@NotNull
    @Column(name="status_plata")
    private String statusPlata;

    private String documentMedical;

    @NotNull
    @ManyToOne
    @JoinColumn(name="id_tabara")
    @JsonIgnoreProperties({"inscrieri", "hibernateLazyInitializer", "handler"})
    private Tabara tabara;

    @NotNull
    @ManyToOne
    @JoinColumn(name="id_participant")
    @JsonIgnoreProperties({"inscrieri", "hibernateLazyInitializer", "handler"})
    private Participant participant;

    @NotNull
    @Column(name="id_platitor")
    private Long idPlatitor;

    @ManyToOne
    @JoinColumn(name = "id_camera", nullable = true)
    private Camera camera;

    @Column(name="status_sosire")
    private String statusSosire;//nesosit, sosit

    @Column(name = "data_checkin")
    private LocalDateTime dataCheckin;

    @Column(name = "data_checkout")
    private LocalDateTime dataCheckout;
}
