package ro.licenta.taberemanager.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SchimbareParolaDTO {
  @NotNull
    private String parolaVeche;
  @NotNull
  @Size(min=6, message=" Parola nouă trebuie să aibă cel puțin 6 caractere")
    private String parolaNoua;
}
