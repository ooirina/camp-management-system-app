package ro.licenta.taberemanager.model;

import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;


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
}
