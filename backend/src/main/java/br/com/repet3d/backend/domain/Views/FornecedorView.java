package br.com.repet3d.backend.domain.Views;

import br.com.repet3d.backend.domain.Fornecedor;

public record FornecedorView(Long id, String nome, String cnpj, String endereco, String contato, String obs) {

    public static FornecedorView from(Fornecedor entity) {
        return new FornecedorView(
                entity.getId(),
                entity.getNome(),
                formatarCnpj(entity.getCnpj()),
                entity.getEndereco(),
                entity.getContato(),
                entity.getObs()
        );
    }

    private static String formatarCnpj(String cnpj) {
        if (cnpj == null || cnpj.length() != 14) {
            return cnpj;
        }
        return cnpj.replaceAll("(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})", "$1.$2.$3/$4-$5");
    }
}
