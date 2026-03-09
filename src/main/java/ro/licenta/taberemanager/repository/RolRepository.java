package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.Rol;
@Repository
public interface RolRepository extends JpaRepository<Rol,Long>{
}
