package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Categorie;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie,Long> {
    // Verifică dacă există deja un tip de tabără cu acest nume, fără a ține cont de majuscule
    boolean existsByTipIgnoreCase(String tip);
}