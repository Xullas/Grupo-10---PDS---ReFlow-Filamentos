package br.com.repet3d.backend.domain.Forms;

import br.com.repet3d.backend.domain.Filamento;
import br.com.repet3d.backend.domain.Fornecedor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FilamentoForm(
        @NotBlank(message = "O material é obrigatório.")
        String material,

        @NotBlank(message = "A cor é obrigatória.")
        String cor,

        @NotNull(message = "O diâmetro é obrigatório.")
        BigDecimal diametro,

        @NotNull(message = "O peso é obrigatório.")
        Integer pesoGramas,

        Boolean origemReciclada,

        Long fornecedorId,

        String fornecedorNomeManual
) {

        public Filamento toEntity(Fornecedor fornecedor) {
                return Filamento.builder()
                        .material(this.material)
                        .cor(this.cor)
                        .diametro(this.diametro)
                        .pesoGramas(this.pesoGramas)
                        .origemReciclada(this.origemReciclada != null ? this.origemReciclada : false)
                        .fornecedor(fornecedor)
                        .fornecedorNomeManual(this.fornecedorNomeManual)
                        .build();
        }
}
