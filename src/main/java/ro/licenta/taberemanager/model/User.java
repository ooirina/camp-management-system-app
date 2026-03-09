package ro.licenta.taberemanager.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;


@Entity
@Data
@Table(name="utilizatori")
@NoArgsConstructor
public class User
{
    @Id
   // @GeneratedValue(strategy=GenerationType.IDENTITY)
    private  Long id;
    @NotNull
    private String email;
    @NotNull
    private String parola;
    @NotNull
    private int idRol;

}
