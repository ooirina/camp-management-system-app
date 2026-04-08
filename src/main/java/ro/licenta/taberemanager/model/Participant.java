package ro.licenta.taberemanager.model;
import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;


@Entity
@Data
@NoArgsConstructor
@Table(name="participant")

public class Participant {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private  Long id;
    @NotNull
    private String nume;
    @NotNull
    private String prenume;
    @NotNull
    @Column(name="data_nasterii")
    private LocalDate dataNasterii;
    @Column(length=1000)
    private String alergii;

    @Column(name="probleme_medicale")
    private String problemeMedicale;
    @Column(name="contact_urgenta")
    private String contactUrgenta;
    @Column(name="id_user")
    private Long idUser;
    @Column(name="id_parinte")
    private Long idParinte;
  //  private String numeGrup;

}
