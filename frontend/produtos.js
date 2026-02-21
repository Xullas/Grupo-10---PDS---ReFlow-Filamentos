// FUNÇÕES DO MODAL

function dispararAlerta(titulo, mensagem) {
    const modal = document.getElementById('modalAlerta');
    document.getElementById('modalTitulo').innerText = titulo;
    document.getElementById('modalMensagem').innerText = mensagem;
    modal.classList.add('ativo');
}

function fecharModal() {
    document.getElementById('modalAlerta').classList.remove('ativo');
}


// FUNÇÃO LISTAR

async function listarTodos() {
    const corpoTabela = document.getElementById('tabela-produtos');
    if (!corpoTabela) return;

    try {
        const response = await fetch('http://localhost:8081/produtos');
        if (!response.ok) throw new Error();

        const produtos = await response.json();
        corpoTabela.innerHTML = '';

        produtos.forEach(f => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${f.material}</td>
                <td>${f.cor}</td>
                <td>${f.diametro}mm</td>
                <td>${f.peso}kg</td>
                <td>${f.origem || ''}</td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button class="btn-acao-edit" onclick="prepararEdicao(${f.id})">Editar</button>
                        <button class="btn-acao-excluir" onclick="excluirProduto(${f.id})">Excluir</button>
                    </div>
                </td>
            `;
            corpoTabela.appendChild(linha);
        });

    } catch (error) {
        console.error("Erro ao listar:", error);
        dispararAlerta("Erro", "Erro ao carregar produtos.");
    }
}


// DOM 

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btnFecharModal')
        .addEventListener('click', fecharModal);

    
    // MÁSCARAS
    
    const aplicarMascaras = {
        diametro: (valor) => {
            valor = valor.replace(/\D/g, "");
            if (!valor) return "";
            return (valor / 100).toFixed(2) + "mm";
        },
        peso: (valor) => {
            valor = valor.replace(/\D/g, "");
            if (!valor) return "";
            return (valor / 100).toFixed(2) + "kg";
        }
    };

    const inputs = [
        { el: document.querySelector('input[name="diametro"]'), tipo: 'diametro' },
        { el: document.querySelector('input[name="diametro-editar"]'), tipo: 'diametro' },
        { el: document.querySelector('input[name="peso"]'), tipo: 'peso' },
        { el: document.querySelector('input[name="peso-editar"]'), tipo: 'peso' }
    ];

    inputs.forEach(item => {
        if (item.el) {
            item.el.addEventListener('input', e => {
                e.target.value = aplicarMascaras[item.tipo](e.target.value);
            });
        }
    });

    
    // CADASTRAR
    
    const formCadastrar = document.getElementById('form-cadastrar');

    if (formCadastrar) {
        formCadastrar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(formCadastrar);
            const produto = Object.fromEntries(formData.entries());

            produto.diametro = produto.diametro.replace('mm', '');
            produto.peso = produto.peso.replace('kg', '');

            const pesoNum = parseFloat(produto.peso);
            const diametroNum = parseFloat(produto.diametro);

            if (!produto.material.trim() || isNaN(pesoNum) || isNaN(diametroNum)) {
                dispararAlerta("Dados Inválidos", "Preencha material, peso e diâmetro corretamente.");
                return;
            }

            try {
                const response = await fetch('http://localhost:8081/produtos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(produto)
                });

                if (!response.ok) throw new Error();

                dispararAlerta("Sucesso", "Produto cadastrado!");
                formCadastrar.reset();
                listarTodos();

            } catch {
                dispararAlerta("Erro", "Servidor não respondeu.");
            }
        });
    }

    
    // BUSCAR PARA EDIÇÃO
    
    const campoIdEditar = document.getElementById('editar-id');

    if (campoIdEditar) {
        campoIdEditar.addEventListener('blur', async () => {
            const id = campoIdEditar.value;
            if (!id) return;

            try {
                const response = await fetch(`http://localhost:8081/produtos/${id}`);
                if (!response.ok) throw new Error();

                const dados = await response.json();

                document.getElementById('editar-material').value = dados.material;
                document.getElementById('editar-cor').value = dados.cor;
                document.getElementById('editar-diametro').value = dados.diametro + "mm";
                document.getElementById('editar-peso').value = dados.peso + "kg";
                document.getElementById('editar-origem').value = dados.origem || "";

            } catch {
                dispararAlerta("Erro", "Produto não encontrado.");
            }
        });
    }

    // SALVAR EDIÇÃO
    const formEditar = document.getElementById('form-editar');

    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('editar-id').value;
            if (!id) {
                dispararAlerta("Aviso", "Selecione um produto primeiro.");
                return;
            }

            const dadosAtualizados = {
                material: document.getElementById('editar-material').value,
                cor: document.getElementById('editar-cor').value,
                diametro: document.getElementById('editar-diametro').value.replace('mm',''),
                peso: document.getElementById('editar-peso').value.replace('kg',''),
                origem: document.getElementById('editar-origem').value
            };

            try {
                const response = await fetch(`http://localhost:8081/produtos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });

                if (!response.ok) throw new Error();

                dispararAlerta("Sucesso", "Produto atualizado!");
                formEditar.reset();
                listarTodos();

            } catch {
                dispararAlerta("Erro", "Erro ao atualizar.");
            }
        });
    }

    listarTodos();
});


// FUNÇÕES GLOBAIS

window.prepararEdicao = function(id) {
    const campo = document.getElementById('editar-id');
    campo.value = id;
    campo.dispatchEvent(new Event('blur'));
    campo.scrollIntoView({ behavior: "smooth" });
};

window.excluirProduto = async function(id) {
    try {
        const response = await fetch(`http://localhost:8081/produtos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error();

        dispararAlerta("Excluído", "Produto removido.");
        listarTodos();

    } catch {
        dispararAlerta("Erro", "Erro ao excluir.");
    }
};

