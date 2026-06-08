package ro.licenta.taberemanager.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.repository.InscriereRepository;
import ro.licenta.taberemanager.service.CheckInEmailService;
import ro.licenta.taberemanager.service.CheckOutEmailService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

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

    ///Raposrt CSV
    @GetMapping(value = "/raport/csv/{idTabara}", produces ="text/csv")
    public void genereazaRaportCSV(@PathVariable Long idTabara, HttpServletResponse response ) throws IOException{
           /// Setare format fisier pentru descarcare
        response.setContentType("text/csv; charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"raport_tabara_" + idTabara + ".csv\"");

        //Aducere doar particpinatii confiramti si platiti
        List<Inscriere> inscrieri= inscriereRepository.findByTabaraIdAndStatutAndStatusPlata(idTabara, "CONFIRMAT","PLATIT");
        PrintWriter writer=response.getWriter();
        //Adaugare BOM( Byte Order MArk) ca Excel sa citeasca corecr diacriticile
        writer.write('\ufeff');
        //Scriere capul de tabel (numele colaonelor, separate prin virgula)
        writer.println("Nume,Prenume,Gen,Telefon,Contact Urgenta,Alergii, Status Sosire");
        /// Parcurgere lissta si scrierer fiecare participant pe un rand nou
        for(Inscriere i: inscrieri){
            String nume=i.getParticipant().getNume() !=null ? i.getParticipant().getNume():"-";
            String prenume = i.getParticipant().getPrenume() != null ? i.getParticipant().getPrenume() : "-";
            String gen = i.getParticipant().getGen() != null ? i.getParticipant().getGen() : "-";
            String tel = i.getParticipant().getTelefon() != null ? i.getParticipant().getTelefon() : "-";
            String urgenta = i.getParticipant().getContactUrgenta() != null ? i.getParticipant().getContactUrgenta() : "-";
            String alergii = i.getParticipant().getAlergii() != null ? i.getParticipant().getAlergii() : "-";
            String statusSosire = i.getStatusSosire() != null ? i.getStatusSosire() : "NEOSIT";

            writer.println(nume + "," + prenume + "," + gen + "," + tel + "," + urgenta + "," + alergii + "," + statusSosire);
        }
         writer.flush();
        }


    }




