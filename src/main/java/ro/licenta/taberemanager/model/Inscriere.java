package ro.licenta.taberemanager.model;

import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;

import jakarta.persistence.*;
import  lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@Table(name="inscriere")

public class Inscriere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    @Column(name="data_inscriere")
    private LocalDate dataInscriere;
    @NotNull
    private String statut;
    @NotNull
    private Long suma;
    @NotNull
    @Column(name="data_plata")
    private LocalDate dataPlata;
    @NotNull
    @Column(name="status_plata")
    private String statusPlata;
    @NotNull
    @Column(name="id_tabara")
    private Long idTabara;
    @NotNull
    @Column(name="id_participant")
    private Long idParticipant;
    @NotNull
    @Column(name="id_platitor")
    private Long idPlatitor;
}
