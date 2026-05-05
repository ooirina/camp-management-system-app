package ro.licenta.taberemanager.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "camera")
public class Camera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String numar;

    @NotNull
    private Integer capacitate;

    private Integer etaj;

    @ManyToOne
    @JoinColumn(name = "id_tabara")
    @NotNull
    private Tabara tabara;

    // Relatie inversa pentru a vedea cine este in camera
    @OneToMany(mappedBy = "camera")
    @JsonIgnoreProperties("camera")//sa nu intre in bucla json, Când scrii locatarii, nu le mai scrie și câmpul 'camera' din interiorul lor, că deja suntem în ea
    private List<Inscriere> locatari;
}