package br.com.repet3d.backend.service;

import br.com.repet3d.backend.domain.Filamento;
import br.com.repet3d.backend.domain.Forms.FilamentoForm;
import br.com.repet3d.backend.domain.Fornecedor;
import br.com.repet3d.backend.domain.Views.FilamentoView;
import br.com.repet3d.backend.repositories.FilamentoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FilamentoService {

    private final FilamentoRepository filamentoRepository;
    private final FornecedorService fornecedorService;

    public FilamentoService(FilamentoRepository filamentoRepository, FornecedorService fornecedorService) {
        this.filamentoRepository = filamentoRepository;
        this.fornecedorService = fornecedorService;
    }

    @Transactional
    public FilamentoView criarFilamento(FilamentoForm filamentoForm) {
        Fornecedor fornecedor = null;
        if (filamentoForm.fornecedorId() != null) {
            fornecedor = fornecedorService.buscarEntidadePorId(filamentoForm.fornecedorId());
        }
        Filamento filamento = filamentoForm.toEntity(fornecedor);
        filamentoRepository.save(filamento);
        return FilamentoView.from(filamento);
    }

    public FilamentoView buscarPorId(Long id) {
        return filamentoRepository.findById(id)
                .map(FilamentoView::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Filamento não encontrado"));
    }

    public List<FilamentoView> listarTodos() {
        return filamentoRepository.findAll()
                .stream()
                .map(FilamentoView::from)
                .collect(Collectors.toList());
    }

}
