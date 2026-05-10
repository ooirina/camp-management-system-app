package ro.licenta.taberemanager.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;


@Entity
@Data
@NoArgsConstructor
@Table(name="tabara")

public class Tabara {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    private String nume;
    @NotNull
    @Column(name="locatia")
    private String locatie;
    @NotNull
    @Column(name="data_inceput")
    private LocalDate dataInceput;
    @NotNull
    @Column(name="data_sfarsit")
    private LocalDate dataSfarsit;
    @NotNull
    private BigDecimal capacitate;
    @NotNull
    private BigDecimal pret;
    @NotNull
    @Column(name="varsta_min")
    private BigDecimal varstaMin;
    @NotNull
    @Column(name="varsta_max")
    private BigDecimal varstaMax;
    @NotNull
    @Column(name="tip_public")
    private String tipPublic;

    @Transient // Înseamnă că acest câmp NU există în tabelul 'tabara' din DB,
    // dar îl folosim în cod pentru a trimite datele către Frontend
    @JsonProperty("trasee")
    private List<Traseu> trasee;

    private BigDecimal latitudine;
    private BigDecimal longitudine;
}
