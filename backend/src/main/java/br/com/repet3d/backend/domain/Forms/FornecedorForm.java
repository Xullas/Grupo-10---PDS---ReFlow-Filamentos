package br.com.repet3d.backend.domain.Forms;

import br.com.repet3d.backend.domain.Fornecedor;
import jakarta.validation.constraints.NotBlank;

public record FornecedorForm (
        @NotBlank(message = "O nome é obrigatório.")
        String nome,
        @NotBlank(message = "O CNPJ é obrigatório.")
        String cnpj,
        String endereco,
        String contato,
        String obs) {

        public Fornecedor toEntity() {
                return Fornecedor.builder()
                        .nome(this.nome)
                        .cnpj(this.cnpj != null ? this.cnpj.replaceAll("\\D", "") : null)
                        .endereco(this.endereco)
                        .contato(this.contato)
                        .obs(this.obs)
                        .build();
        }
}
