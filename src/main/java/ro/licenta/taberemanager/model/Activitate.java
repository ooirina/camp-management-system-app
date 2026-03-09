package ro.licenta.taberemanager.model;

import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.math.BigDecimal;
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
    private Data data;
    @NotNull
    private String descriere;
    @NotNull
    @Column(name = "ora_inceput")
    private Date oraInceput;
    @NotNull
    @Column(name = "ora_sfarsit")
    private Date oraSfarsit;
    @NotNull
    private String locatie;
    @NotNull
    @Column(name="capacitate_maxima")
    private Long capacitateMax;
    @NotNull
    @Column(name="id_tabara")
    private Long idTabara;
}
