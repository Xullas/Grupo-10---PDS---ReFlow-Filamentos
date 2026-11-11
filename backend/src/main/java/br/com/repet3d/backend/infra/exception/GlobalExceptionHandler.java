package br.com.repet3d.backend.infra.exception;

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
}
