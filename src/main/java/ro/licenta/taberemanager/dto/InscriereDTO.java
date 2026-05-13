package ro.licenta.taberemanager.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InscriereDTO {
    // Date Participant
    private String numeParticipant;
    private String prenumeParticipant;
    private LocalDate dataNasterii;
    private String telefon;
    private String alergii;
    private String problemeMedicale;
    private String contactUrgenta;
    private String gen;

    // Date Inscriere
    private Long idTabara;
    private String emailUtilizator;
    private Long suma;


}