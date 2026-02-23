package br.com.repet3d.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "filamento")
public class Filamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String material;

    @Column(nullable = false, length = 100)
    private String cor;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal diametro;

    @Column(name = "peso_gramas", nullable = false)
    private Integer pesoGramas;

    @Column(name = "origem_reciclada")
    private Boolean origemReciclada = false;

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    @Column(name = "fornecedor_nome_manual")
    private String fornecedorNomeManual;

    public String getNomeFornecedorExibicao() {
        if (this.fornecedor != null) {
            return this.fornecedor.getNome();
        }
        return (this.fornecedorNomeManual != null && !this.fornecedorNomeManual.isEmpty())
                ? this.fornecedorNomeManual : "Não informado";
    }
}
