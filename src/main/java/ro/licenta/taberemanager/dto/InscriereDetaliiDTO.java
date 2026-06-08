package ro.licenta.taberemanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor

public class InscriereDetaliiDTO {
    private  Long id;
    private String numeTabara;
    private LocalDate dataInscriere;
    private BigDecimal suma;
    private String statusPlata;
    private String numeParticipant;
    private String prenumeParticipant;


}
