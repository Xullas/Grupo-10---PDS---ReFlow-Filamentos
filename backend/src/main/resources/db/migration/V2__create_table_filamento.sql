CREATE TABLE filamento (
    id BIGSERIAL PRIMARY KEY,
    material VARCHAR(50) NOT NULL,
    cor VARCHAR(100) NOT NULL,
    diametro NUMERIC(4, 2) NOT NULL,
    peso_gramas INTEGER NOT NULL,
    origem_reciclada BOOLEAN DEFAULT FALSE,
    fornecedor_id BIGINT,
    fornecedor_nome_manual VARCHAR(255),

    CONSTRAINT fk_fornecedor
    FOREIGN KEY (fornecedor_id)
    REFERENCES fornecedor(id)
    ON DELETE SET NULL
);