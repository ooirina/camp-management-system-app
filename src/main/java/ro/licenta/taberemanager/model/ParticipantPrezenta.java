package ro.licenta.taberemanager.model;


import jakarta.persistence.*;
import lombok.Cleanup;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Data@NoArgsConstructor
@Table(name="participant_prezenta")
public class ParticipantPrezenta {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
@NotNull
private String prezenta;//ca sa rtimita 'nu' catre java , nu null
@Column(name = "observatii", nullable = true)
private String observatii="";
@NotNull
@ManyToOne
@JoinColumn(name="id_activitate")
    private Activitate activitate;

@NotNull
@ManyToOne
@JoinColumn(name="id_inscriere")
    private Inscriere inscriere;

}
