package ro.licenta.taberemanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
public class PrezentaDTO {

    private String nume;
    private String prenume;
    private String numeTabara;
    private String numeActivitate;
    private String prezenta;//da sau nu
    private Long idPrezenta;
    private Long idInscriere;// nu am pus idPrezenta fiindca id inscriere o sa existe mereu fiindca fiecare copil din lista e inscris in tabara
    private String observatii;
    private Long idActivitate;

    public PrezentaDTO(String nume, String prenume, String numeTabara, String numeActivitate,
                       String prezenta, Long idPrezenta, Long idInscriere, String observatii, Long idActivitate) {
        this.nume = nume;
        this.prenume = prenume;
        this.numeTabara = numeTabara;
        this.numeActivitate = numeActivitate;
        this.prezenta = prezenta;
        this.idPrezenta = idPrezenta;
        this.idInscriere = idInscriere;
        this.observatii = observatii;
        this.idActivitate = idActivitate;
    }
}

