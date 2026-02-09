package br.com.repet3d.backend.controller;

import br.com.repet3d.backend.domain.Forms.FornecedorForm;
import br.com.repet3d.backend.domain.Views.FornecedorView;
import br.com.repet3d.backend.service.FornecedorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

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
}
