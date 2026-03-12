package ro.licenta.taberemanager.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;


@Entity
@Data
@Table(name="user")
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
    @Column(name="id_rol")
    private BigDecimal idRol;

}
