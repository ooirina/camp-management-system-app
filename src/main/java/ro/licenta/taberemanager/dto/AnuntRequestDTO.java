package ro.licenta.taberemanager.dto;

import lombok.Data;

@Data
public class AnuntRequestDTO {
    private Long idTabara;
    private String mesaj;
    private Long idAutor;//// Aici se va primi de fapt email-ul utilizatorului din React
}
