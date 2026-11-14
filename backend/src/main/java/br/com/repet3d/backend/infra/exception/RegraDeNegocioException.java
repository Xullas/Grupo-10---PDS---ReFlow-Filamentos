package br.com.repet3d.backend.infra.exception;

import lombok.Getter;

@Getter
public class RegraDeNegocioException extends RuntimeException {
    private final String campo;

    public RegraDeNegocioException(String campo, String mensagem) {
        super(mensagem);
        this.campo = campo;
    }

}
