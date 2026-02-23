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

    @Transactional
    public FilamentoView atualizarFilamento(Long id, FilamentoForm filamentoForm) {

        if (!filamentoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Filamento não encontrado");
        }

        Fornecedor fornecedor = null;
        if (filamentoForm.fornecedorId() != null) {
            fornecedor = fornecedorService.buscarEntidadePorId(filamentoForm.fornecedorId());
        }

        Filamento filamento = filamentoForm.toEntity(fornecedor);
        Filamento filamentoAtualizado = Filamento.builder()
                .id(id)
                .material(filamento.getMaterial())
                .cor(filamento.getCor())
                .diametro(filamento.getDiametro())
                .pesoGramas(filamento.getPesoGramas())
                .origemReciclada(filamento.getOrigemReciclada())
                .fornecedor(filamento.getFornecedor())
                .fornecedorNomeManual(filamento.getFornecedorNomeManual())
                .build();

        Filamento salvo = filamentoRepository.save(filamentoAtualizado);

        return FilamentoView.from(salvo);
    }

    @Transactional
    public void deletarFilamento(Long id) {
        if (!filamentoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Filamento não encontrado");
        }

        filamentoRepository.deleteById(id);
    }

}
