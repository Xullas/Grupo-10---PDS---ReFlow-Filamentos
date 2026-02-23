package br.com.repet3d.backend.domain.Views;

import br.com.repet3d.backend.domain.Filamento;

import java.math.BigDecimal;

public record FilamentoView(
        Long id,
        String material,
        String cor,
        BigDecimal diametro,
        Integer pesoGramas,
        Boolean origemReciclada,
        String fornecedorNome
) {

    public static FilamentoView from(Filamento entity) {
        return new FilamentoView(
                entity.getId(),
                entity.getMaterial(),
                entity.getCor(),
                entity.getDiametro(),
                entity.getPesoGramas(),
                entity.getOrigemReciclada(),
                entity.getNomeFornecedorExibicao()
        );
    }
}
