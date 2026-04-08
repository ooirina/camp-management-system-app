package ro.licenta.taberemanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class LoginResponse {

    private String jwt;
    private String message;
    private boolean status;
    private String role;
    private String email;
}
