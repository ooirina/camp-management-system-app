package ro.licenta.taberemanager.model;
import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;


@Entity
@Data
@NoArgsConstructor
@Table(name="tabara_categorie")

public class TabaraCategorie {
    @Id
    private Long id;
    @NotNull
    @Column(name="id_tabara")
    private BigDecimal idTabara;
    @NotNull
    @Column(name="id_categorie")
    private BigDecimal idCategorie;


}
