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
private Long id;
@NotNull
    private String prezenta;
@NotNull
    private String observatii;
@NotNull
@Column(name="id_activitate")
    private Long idActivitate;
@NotNull
    @Column(name="id_participant")
    private Long idParticipant;

}
