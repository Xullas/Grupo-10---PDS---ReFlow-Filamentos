package br.com.repet3d.backend.service;

import br.com.repet3d.backend.domain.Forms.FornecedorForm;
import br.com.repet3d.backend.domain.Fornecedor;
import br.com.repet3d.backend.domain.Views.FornecedorView;
import br.com.repet3d.backend.infra.exception.RegraDeNegocioException;
import br.com.repet3d.backend.repositories.FornecedorRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    @Transactional
    public FornecedorView criarFornecedor(FornecedorForm fornecedorForm) {
        Fornecedor fornecedor = fornecedorForm.toEntity();

        if (fornecedorRepository.existsByCnpj(fornecedor.getCnpj())) {
            throw new RegraDeNegocioException("cnpj", "Já existe um fornecedor cadastrado com este CNPJ.");
        }

        fornecedorRepository.save(fornecedor);
        return FornecedorView.from(fornecedor);
    }

    public FornecedorView buscarPorId(Long id) {
        return fornecedorRepository.findById(id)
                .map(FornecedorView::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado"));
    }


    public List<FornecedorView> listarTodos() {
        return fornecedorRepository.findAll()
                .stream()
                .map(FornecedorView::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public FornecedorView atualizarFornecedor(Long id, FornecedorForm fornecedorForm) {
        Fornecedor fornecedor = fornecedorForm.toEntity();

        if (fornecedorRepository.existsByCnpj(fornecedor.getCnpj())) {
            throw new RegraDeNegocioException("cnpj", "Já existe um fornecedor cadastrado com este CNPJ.");
        }

        Fornecedor fornecedorAtualizado = Fornecedor.builder()
                .id(id)
                .nome(fornecedor.getNome())
                .cnpj(fornecedor.getCnpj())
                .endereco(fornecedor.getEndereco())
                .contato(fornecedor.getContato())
                .obs(fornecedor.getObs())
                .build();

        Fornecedor salvo = fornecedorRepository.save(fornecedorAtualizado);

        return FornecedorView.from(salvo);
    }

    @Transactional
    public void deletarFornecedor(Long id) {
        if (!fornecedorRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado");
        }

        fornecedorRepository.deleteById(id);
    }

    public Fornecedor buscarEntidadePorId(Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado"));
    }
}
