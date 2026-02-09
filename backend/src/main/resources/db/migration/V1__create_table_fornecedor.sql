CREATE TABLE fornecedor (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    endereco VARCHAR(255),
    contato VARCHAR(100),
    obs TEXT
);