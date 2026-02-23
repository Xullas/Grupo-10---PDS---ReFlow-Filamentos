package br.com.repet3d.backend.controller;

import br.com.repet3d.backend.domain.Forms.FilamentoForm;
import br.com.repet3d.backend.domain.Views.FilamentoView;
import br.com.repet3d.backend.service.FilamentoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("filamento")
public class FilamentoController {

    private final FilamentoService filamentoService;

    public FilamentoController(FilamentoService filamentoService) {
        this.filamentoService = filamentoService;
    }

    @PostMapping
    public ResponseEntity<FilamentoView> criarFilamento(@RequestBody @Valid FilamentoForm filamentoForm,
                                                         UriComponentsBuilder uriBuilder) {
        FilamentoView view = filamentoService.criarFilamento(filamentoForm);
        URI uri = uriBuilder.path("/filamento/{id}").buildAndExpand(view.id()).toUri();
        return ResponseEntity.created(uri).body(view);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FilamentoView> buscarPorId(@PathVariable Long id) {
        FilamentoView view = filamentoService.buscarPorId(id);
        return ResponseEntity.ok(view);
    }

    @GetMapping
    public ResponseEntity<List<FilamentoView>> listarTodosFilamentos(){
        List<FilamentoView> lista = filamentoService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FilamentoView> atualizarFilamento(@PathVariable Long id,
                                                            @RequestBody @Valid FilamentoForm filamentoForm) {
        FilamentoView view = filamentoService.atualizarFilamento(id, filamentoForm);
        return ResponseEntity.ok(view);
    }
}
