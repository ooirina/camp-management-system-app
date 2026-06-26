package ro.licenta.taberemanager.config;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import  org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
 //Erori de baza de date
 @ExceptionHandler(DataIntegrityViolationException.class)
 public ResponseEntity<String> handleDataInegrityViolation(DataIntegrityViolationException ex)
 {
  return ResponseEntity.badRequest().body("Data invalida. Eroare baza de date: "+ex.getMessage());
 }

 //Erori de Validare (folosit cu @Validated pe parametri simpli din Controller)
 @ExceptionHandler(ConstraintViolationException.class)
 public ResponseEntity<String> handleViolationError(ConstraintViolationException ex)
 {
  return ResponseEntity.badRequest().body("Data invalida. Eroare de validare: "+ex.getMessage());
 }

 // Erori de validare pentru @Valid @RequestBody (DTO-uri precum InscriereDTO, User etc.)
 // Returnam un mesaj clar per camp, ca frontend-ul sa poata afisa exact ce e gresit
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
  Map<String, String> erori = new LinkedHashMap<>();
  for (FieldError eroare : ex.getBindingResult().getFieldErrors()) {
   erori.put(eroare.getField(), eroare.getDefaultMessage());
  }
  return ResponseEntity.badRequest().body(erori);
 }

 //Erori neprevazute
 @ExceptionHandler(Exception.class)
 public ResponseEntity<String> handleGeneralException(Exception ex)
 {
  return ResponseEntity.internalServerError().body("Eroare de sistem: "+ex.getMessage());
 }
}