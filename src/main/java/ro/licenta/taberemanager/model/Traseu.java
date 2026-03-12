package ro.licenta.taberemanager.model;
import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Data@NoArgsConstructor
@Table(name="traseu")
public class Traseu {
    @Id
    //decimal(3,0) ->Long/Integer
    private Long id;
    @NotNull
    @Column(length = 255)
    private String nume;
    @NotNull
    @Column(length =1000)
    private String descriere;
    @NotNull
    @Column(length =20)
    private String dificultate;
    @NotNull
    @Column(name="distanta_km", precision=10,scale=2)
    private BigDecimal distantaKm;
    @NotNull
    @Column(name="durata_ore", precision=4,scale=2)
    private BigDecimal durataOre;
    @NotNull
    @Column(name="id_tabara")
    private Long idTabara;


}
