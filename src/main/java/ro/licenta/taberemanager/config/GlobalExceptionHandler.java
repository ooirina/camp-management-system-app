package ro.licenta.taberemanager.config;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import  org.springframework.web.bind.annotation.ExceptionHandler;
@ControllerAdvice
public class GlobalExceptionHandler {
   //Erori de baza de date
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataInegrityViolation(DataIntegrityViolationException ex)
    {
     return ResponseEntity.badRequest().body("Data invalida. Eroare baza de date: "+ex.getMessage());
    }

    //Erori de Validare
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<String> handleViolationError(ConstraintViolationException ex)
    {
        return ResponseEntity.badRequest().body("Data invalida. Eroare de validare: "+ex.getMessage());
    }

    //Erori neprevazute
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception ex)
    {
        return ResponseEntity.internalServerError().body("Eroare de sistem: "+ex.getMessage());
    }
}
