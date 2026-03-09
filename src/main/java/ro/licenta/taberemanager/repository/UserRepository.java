package ro.licenta.taberemanager.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.licenta.taberemanager.model.User;

@Repository
public interface UserRepository extends  JpaRepository<User, Long> {
}
