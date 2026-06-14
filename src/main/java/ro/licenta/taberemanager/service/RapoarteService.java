package ro.licenta.taberemanager.service;

import ro.licenta.taberemanager.dto.RaportRowDTO;
import ro.licenta.taberemanager.model.Inscriere;
import ro.licenta.taberemanager.model.Participant;
import ro.licenta.taberemanager.repository.InscriereRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licenta.taberemanager.repository.TabaraRepository;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RapoarteService {

    @Autowired
    private InscriereRepository inscriereRepository;

    @Autowired
    private TabaraRepository tabaraRepository;

    // ─── Metodă internă: aduce toate înscrierile unui coordonator (+ filtu tabăra) ──
    private List<Inscriere> getInscrieri(Long idCoordonator, Long idTabara) {
        if (idTabara != null) {
            return inscriereRepository.findByTabara_IdCoordonatorPrincipalAndTabara_Id(idCoordonator, idTabara);
        }
        return inscriereRepository.findByTabara_IdCoordonatorPrincipal(idCoordonator);
    }

    // ─── Metodă internă: mapare Inscriere → DTO complet ─────────────────────
    private RaportRowDTO toDTO(Inscriere ins) {
        Participant p = ins.getParticipant();

        Integer varsta = null;
        if (p.getDataNasterii() != null) {
            varsta = Period.between(p.getDataNasterii(), LocalDate.now()).getYears();
           }

        return RaportRowDTO.builder()
                .idInscriere(ins.getId())
                .idParticipant(p.getId())
                .numeParticipant(p.getNume())
                .prenumeParticipant(p.getPrenume())
                .varsta(varsta)
                .gen(p.getGen())
                .alergii(p.getAlergii())
                .problemeMedicale(p.getProblemeMedicale())
                .telefon(p.getTelefon())
                .contactUrgenta(p.getContactUrgenta())
                .idTabara(ins.getTabara().getId())
                .numeTabara(ins.getTabara().getNume())
                .dataInscriere(ins.getDataInscriere())
                .statut(ins.getStatut())
                .suma(ins.getSuma())
                .statusPlata(ins.getStatusPlata())
                .dataPlata(ins.getDataPlata())
                .statusSosire(ins.getStatusSosire())
                .dataCheckin(ins.getDataCheckin())
                .dataCheckout(ins.getDataCheckout())
                .documentMedical(ins.getDocumentMedical() != null && !ins.getDocumentMedical().isEmpty())
                .build();
    }

    // ─── Raport Înscrieri ─────────────────────────────────────────────────────
    public List<RaportRowDTO> getRaportInscrieri(Long idCoordonator, Long idTabara) {
        // AICI verifici dacă are drept să vadă datele
        boolean estePrincipal = tabaraRepository
                .findByIdCoordonatorPrincipal(idCoordonator)
                .stream().anyMatch(t -> t.getId().equals(idTabara));

        if (!estePrincipal) throw new RuntimeException("Acces nepermis");

        return getInscrieri(idCoordonator, idTabara).stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─── Raport Financiar (doar înscrierile, sortate după sumă desc) ──────────
    public List<RaportRowDTO> getRaportFinanciar(Long idCoordonator, Long idTabara) {
        return getInscrieri(idCoordonator, idTabara).stream()
                .map(this::toDTO)
                .sorted((a, b) -> {
                    if (a.getSuma() == null) return 1;
                    if (b.getSuma() == null) return -1;
                    return b.getSuma().compareTo(a.getSuma());
                })
                .collect(Collectors.toList());
    }

    // ─── Raport Medical (doar cei cu alergii sau probleme) ───────────────────
    public List<RaportRowDTO> getRaportMedical(Long idCoordonator, Long idTabara) {
        return getInscrieri(idCoordonator, idTabara).stream()
                .map(this::toDTO)
                .filter(r -> (r.getAlergii() != null && !r.getAlergii().isBlank())
                        || (r.getProblemeMedicale() != null && !r.getProblemeMedicale().isBlank()))
                .collect(Collectors.toList());
    }

    // ─── Raport Check-in ─────────────────────────────────────────────────────
    public List<RaportRowDTO> getRaportCheckin(Long idCoordonator, Long idTabara) {
        return getInscrieri(idCoordonator, idTabara).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Raport Participanți ──────────────────────────────────────────────────
    public List<RaportRowDTO> getRaportParticipanti(Long idCoordonator, Long idTabara) {
        return getInscrieri(idCoordonator, idTabara).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Raport Complet (toate câmpurile — pentru raportul personalizat) ─────
    public List<RaportRowDTO> getRaportComplet(Long idCoordonator, Long idTabara) {
        return getInscrieri(idCoordonator, idTabara).stream().map(this::toDTO).collect(Collectors.toList());
    }
}

