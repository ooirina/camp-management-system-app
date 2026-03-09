package ro.licenta.taberemanager.model;

import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Date;


@Entity
@Data
@NoArgsConstructor
@Table(name="tabara")

public class Tabara {
    @Id
    private Long id;
    @NotNull
    private String nume;
    @NotNull
    private String locatie;
    @NotNull
    @Column(name="data_inceput")
    private Date dataInceput;
    @NotNull
    @Column(name="data_sfarsit")
    private Date dataSfarsit;
    @NotNull
    private Long capacitate;
    @NotNull
    private Long pret;
    @NotNull
    @Column(name="varsta_min")
    private Long varstaMin;
    @NotNull
    @Column(name="varsta_max")
    private Long varstaMax;
    @NotNull
    @Column(name="tip_public")
    private Long tipPublic;
}
