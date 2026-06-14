package ro.licenta.taberemanager.dto;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class RaportRowDTO {

    //Participant
    private Long   idParticipant;
    private String numeParticipant;
    private String prenumeParticipant;
    private Integer varsta;
    private String gen;
    private String alergii;
    private String problemeMedicale;
    private String telefon;
    private String contactUrgenta;

    //Tabara
    private Long   idTabara;
    private String numeTabara;

    //Inscriere
    private Long          idInscriere;
    private LocalDate dataInscriere;
    private String        statut;
    private BigDecimal    suma;
    private String        statusPlata;
    private LocalDate dataPlata;
    private String        statusSosire;
    private LocalDateTime dataCheckin;
    private LocalDateTime dataCheckout;
    private Boolean       documentMedical;
}
