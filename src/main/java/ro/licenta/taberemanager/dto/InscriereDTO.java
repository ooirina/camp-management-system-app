package ro.licenta.taberemanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InscriereDTO {
    // Date Participant
    private Long idParticipant; // Poate fi null dacă omul scrie datele manual

    @NotBlank(message = "Numele este obligatoriu")
    @Pattern(
            regexp = "^[A-ZȚȘĂÂÎ][a-zțșăâî]*(-[A-ZȚȘĂÂÎ][a-zțșăâî]*)?( [A-ZȚȘĂÂÎ][a-zțșăâî]*(-[A-ZȚȘĂÂÎ][a-zțșăâî]*)?)*$",
            message = "Fiecare cuvânt din nume trebuie să înceapă cu literă mare (ex: Ana Maria)"
    )
    private String numeParticipant;

    @NotBlank(message = "Prenumele este obligatoriu")
    @Pattern(
            regexp = "^[A-ZȚȘĂÂÎ][a-zțșăâî]*(-[A-ZȚȘĂÂÎ][a-zțșăâî]*)?( [A-ZȚȘĂÂÎ][a-zțșăâî]*(-[A-ZȚȘĂÂÎ][a-zțșăâî]*)?)*$",
            message = "Fiecare cuvânt din prenume trebuie să înceapă cu literă mare (ex: Ana Maria)"
    )
    private String prenumeParticipant;

    private LocalDate dataNasterii;

    @NotBlank(message = "Numărul de telefon este obligatoriu")
    @Pattern(regexp = "^[0-9]{7,15}$", message = "Numărul de telefon trebuie să conțină doar cifre (minim 7, maxim 15)")
    private String telefon;

    private String alergii;
    private String problemeMedicale;
    private String contactUrgenta;
    private String gen;

    // Date Inscriere
    private Long idTabara;

    @NotBlank(message = "Email-ul utilizatorului este obligatoriu")
    @Email(message = "Adresa de email nu este într-un format valid")
    private String emailUtilizator;

    private Long suma;


}