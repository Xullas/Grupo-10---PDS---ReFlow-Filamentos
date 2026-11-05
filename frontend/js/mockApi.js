async function carregarFornecedores() {
    try {
        const resposta = await fetch('http://localhost:3000/fornecedores');
        const fornecedores = await resposta.json();
        
        console.log("✅ Conexão estabelecida com sucesso!");
        console.table(fornecedores); // Mostra os dados em formato de tabela no console
    } catch (erro) {
        console.error("❌ Falha ao conectar na API:", erro);
    }
}

carregarFornecedores();