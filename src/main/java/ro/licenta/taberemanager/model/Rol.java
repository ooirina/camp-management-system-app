package ro.licenta.taberemanager.model;

import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;


@Entity
@Data
@NoArgsConstructor
@Table(name="rol")

public class Rol {
    @Id
    private Long id;
    @NotNull
    private String tip;
}
