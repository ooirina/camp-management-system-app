package ro.licenta.taberemanager.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;


@Entity
@Data
@Table(name="user")
//@NoArgsConstructor
public class User
{
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private  Long id;
    public User() {
    }
    @NotNull
    private String email;
    @NotNull
    @JsonProperty(access= JsonProperty.Access.WRITE_ONLY)
    private String parola;
    @Column(name="id_rol")
    private BigDecimal idRol;
    @Column(name="reset_token")
    private  String resetToken;
   /* @ManyToOne
    private Set<Rol> roluri--nu stiu care e faza teebuie modificat nu am trecutw relatiile intre entitati*/

}
