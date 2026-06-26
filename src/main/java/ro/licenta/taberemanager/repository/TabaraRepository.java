package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Tabara;

import java.util.List;

@Repository
public interface TabaraRepository extends JpaRepository<Tabara,Long> {
    //taberele la care coordonatorul a fost asignat
    @Query("SELECT DISTINCT a.tabara FROM Activitate a WHERE a.coordonator.id = :idCoordonator")
    List<Tabara> findTabereByCoordonator(@Param("idCoordonator") Long idCoordonator);

    List<Tabara> findByIdCoordonatorPrincipal(Long idCoordonatorPrincipal);

//verifica daca exista vreo tabara care foloseste o anumita categorie- folosit la stergerea categoriei
    @Query("SELECT COUNT(t)> 0 FROM Tabara t JOIN t.categorii c WHERE c.id=:idCategorie")
    boolean existaTabaraCuCategoria(@Param("idCategorie") Long idCategorie);
}
