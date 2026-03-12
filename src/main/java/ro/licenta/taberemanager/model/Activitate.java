package ro.licenta.taberemanager.model;

import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@Table(name="activitate")
public class Activitate {
    @Id
    private Long id;
    @NotNull
    private String nume;
    @NotNull
    private LocalDate data;
    @NotNull
    private String descriere;
    @NotNull
    @Column(name = "ora_inceput")
    private LocalTime oraInceput;
    @NotNull
    @Column(name = "ora_sfarsit")
    private LocalTime oraSfarsit;
    @NotNull
    private String locatie;
    @NotNull
    @Column(name="capacitate_maxima")
    private BigDecimal capacitateMax;
    @NotNull
    @Column(name="id_tabara")
    private BigDecimal idTabara;
}
