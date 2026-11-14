package br.com.repet3d.backend.infra.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<DadosErroValidacao>> tratarErrosValidacao(MethodArgumentNotValidException ex) {

        List<DadosErroValidacao> erros = ex.getFieldErrors().stream()
                .map(DadosErroValidacao::new)
                .toList();

        return ResponseEntity.badRequest().body(erros);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<List<DadosErroValidacao>> tratarErroNotFound(ResponseStatusException ex) {

        String mensagem = ex.getReason();
        DadosErroValidacao erroFormatado = new DadosErroValidacao("id", mensagem);
        return ResponseEntity.status(ex.getStatusCode()).body(List.of(erroFormatado));

    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<List<DadosErroValidacao>> tratarRegraDeNegocio(RegraDeNegocioException ex) {

        DadosErroValidacao erro = new DadosErroValidacao(ex.getCampo(), ex.getMessage());
        return ResponseEntity.badRequest().body(List.of(erro));

    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<List<DadosErroValidacao>> tratarErroIntegridadeDados(DataIntegrityViolationException ex) {

        String mensagemDetalhada = ex.getMostSpecificCause().getMessage();

        if (mensagemDetalhada != null && mensagemDetalhada.contains("fornecedor_cnpj_key")) {
            return ResponseEntity.badRequest()
                    .body(List.of(new DadosErroValidacao("cnpj", "Já existe um fornecedor cadastrado com este CNPJ.")));
        }

        return ResponseEntity.badRequest()
                .body(List.of(new DadosErroValidacao("erro", "Violação de integridade dos dados.")));

    }
}
