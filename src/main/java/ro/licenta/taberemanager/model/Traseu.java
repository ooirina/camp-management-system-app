package ro.licenta.taberemanager.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Data@NoArgsConstructor
@Table(name="traseu")
public class Traseu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    //decimal(3,0) ->Long/Integer
    private Long id;
    @NotNull
    @Column(length = 255)
    private String nume;

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
    @ManyToOne
    @JoinColumn(name="id_tabara")
     @JsonProperty(access =JsonProperty.Access.WRITE_ONLY)//write_onlyreact trmite id ul taberei catre java(deserializare)
    //  @JsonIgnore pentru a evita o bucla infinita la json, dar pentru ca erau probleme la trimitere formular de adaugare traseu am schimbat
    private Tabara tabara;

    @Column(columnDefinition = "TEXT")
    private String coordonate; // String formatat: "45.51,25.36;45.52,25.37"


}
