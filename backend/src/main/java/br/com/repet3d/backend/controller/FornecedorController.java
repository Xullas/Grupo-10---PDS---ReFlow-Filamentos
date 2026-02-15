package br.com.repet3d.backend.controller;

import br.com.repet3d.backend.domain.Forms.FornecedorForm;
import br.com.repet3d.backend.domain.Views.FornecedorView;
import br.com.repet3d.backend.service.FornecedorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("fornecedor")
public class FornecedorController {

    private final FornecedorService fornecedorService;

    public FornecedorController(FornecedorService fornecedorService) {
        this.fornecedorService = fornecedorService;
    }

    @PostMapping
    public ResponseEntity<FornecedorView> criarFornecedor(@RequestBody @Valid FornecedorForm fornecedorForm,
                                                UriComponentsBuilder uriBuilder) {
        FornecedorView view = fornecedorService.criarFornecedor(fornecedorForm);
        URI uri = uriBuilder.path("/fornecedor/{id}").buildAndExpand(view.id()).toUri();
        return ResponseEntity.created(uri).body(view);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FornecedorView> buscarPorId(@PathVariable Long id) {
        FornecedorView view = fornecedorService.buscarPorId(id);
        return ResponseEntity.ok(view);
    }

    @GetMapping
    public ResponseEntity<List<FornecedorView>> listarTodosFornecedores(){
        List<FornecedorView> lista = fornecedorService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FornecedorView> atualizarFornecedor(@PathVariable Long id,
                                                              @RequestBody @Valid FornecedorForm fornecedorForm) {
        FornecedorView view = fornecedorService.atualizarFornecedor(id, fornecedorForm);
        return ResponseEntity.ok(view);
    }
}
