package br.com.repet3d.backend.repositories;

import br.com.repet3d.backend.domain.Filamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FilamentoRepository extends JpaRepository<Filamento, Long> {
}
