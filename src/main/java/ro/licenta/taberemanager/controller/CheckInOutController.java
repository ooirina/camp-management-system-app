package ro.licenta.taberemanager.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.service.CheckInEmailService;
import ro.licenta.taberemanager.service.CheckOutEmailService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/flux")
@CrossOrigin(origins = "http://localhost:3000")
public class CheckInOutController {

    @Autowired
    private InscriereRepository inscriereRepository;

    @Autowired
    private CheckInEmailService checkInEmailService;

    @Autowired
    private CheckOutEmailService checkOutEmailService;

    @GetMapping("/participanti/tabara/{idTabara}")
    public List<Inscriere> getParticipantiTabara(@PathVariable Long idTabara) {
        return inscriereRepository.findByTabaraIdAndStatutAndStatusPlata(idTabara, "CONFIRMAT", "PLATIT");
    }

      //Check in
      @PostMapping("/checkin/{id}")
    public ResponseEntity<?>doCheckin(@PathVariable Long id){
         return inscriereRepository.findById(id).map(ins->{
             ins.setDataCheckin(LocalDateTime.now());
             //status daca e sosit sau nu
             ins.setStatusSosire("SOSIT");
             inscriereRepository.save(ins);
             //trimite email dinamic dupa actulaizare baza de date
             checkInEmailService.sendEmailIfMinor(id);
             return  ResponseEntity.ok().build();
         }).orElse(ResponseEntity.notFound().build());

     }

     //Check out

    @PostMapping("/checkout/{id}")
    public ResponseEntity<?> doCheckout(@PathVariable Long id){
 return  inscriereRepository.findById(id).map(ins->{
       ins.setDataCheckout(LocalDateTime.now());
       ins.setStatusSosire("PLECAT");
       inscriereRepository.save(ins);
       //Apelare servicu dedicat pentru email de plecare
       checkOutEmailService.sendCheckoutEmailIfMinor(id);
       return ResponseEntity.ok().build();
    }).orElse(ResponseEntity.notFound().build());
     }


}
