package ro.licenta.taberemanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.repository.InscriereRepository;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CheckInOutService {

    @Autowired
    private InscriereRepository inscriereRepository;

    @Autowired
    private CheckInEmailService checkInEmailService;

    @Autowired
    private CheckOutEmailService checkOutEmailService;

    // Aducere participanti confirmati si platiti pentru o tabara
    public List<Inscriere> getParticipantiTabara(Long idTabara) {
        return inscriereRepository.findByTabaraIdAndStatutAndStatusPlata(idTabara, "CONFIRMAT", "PLATIT");
    }

    // Check in
    public Optional<Inscriere> doCheckin(Long id) {
        return inscriereRepository.findById(id).map(ins -> {
            ins.setDataCheckin(LocalDateTime.now());
            // status daca e sosit sau nu
            ins.setStatusSosire("SOSIT");
            inscriereRepository.save(ins);
            // trimite email dinamic dupa actulaizare baza de date
            checkInEmailService.sendEmailIfMinor(id);
            return ins;
        });
    }

    // Check out
    public Optional<Inscriere> doCheckout(Long id) {
        return inscriereRepository.findById(id).map(ins -> {
            ins.setDataCheckout(LocalDateTime.now());
            ins.setStatusSosire("PLECAT");
            inscriereRepository.save(ins);
            // Apelare servicu dedicat pentru email de plecare
            checkOutEmailService.sendCheckoutEmailIfMinor(id);
            return ins;
        });
    }

    // Raport CSV
    public void genereazaRaportCSV(Long idTabara, HttpServletResponse response) throws IOException {
        // Setare format fisier pentru descarcare
        response.setContentType("text/csv; charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"raport_tabara_" + idTabara + ".csv\"");

        // Aducere doar participantii confirmati si platiti
        List<Inscriere> inscrieri = inscriereRepository.findByTabaraIdAndStatutAndStatusPlata(idTabara, "CONFIRMAT", "PLATIT");
        PrintWriter writer = response.getWriter();
        // Adaugare BOM( Byte Order MArk) ca Excel sa citeasca corect diacriticile
        writer.write('\ufeff');
        // Scriere capul de tabel (numele coloanelor, separate prin virgula)
        writer.println("Nume,Prenume,Gen,Telefon,Contact Urgenta,Alergii, Status Sosire");
        // Parcurgere lista si scriere fiecare participant pe un rand nou
        for (Inscriere i : inscrieri) {
            String nume = i.getParticipant().getNume() != null ? i.getParticipant().getNume() : "-";
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