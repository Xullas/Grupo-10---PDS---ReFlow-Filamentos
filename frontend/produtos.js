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
        const response = await fetch('http://localhost:8081/filamento');
        if (!response.ok) throw new Error();

        const produtos = await response.json();
        corpoTabela.innerHTML = '';

        produtos.forEach(f => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${f.material}</td>
                <td>${f.cor}</td>
                <td>${f.diametro} mm</td>
                <td>${(f.pesoGramas / 1000).toFixed(2).replace('.', ',')} kg</td>
                <td>${f.origemReciclada ? 'Sim' : 'Não'}</td>
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
            let num = valor.replace(/\D/g, "");
            if (!num) return "";
            return (parseFloat(num) / 100).toFixed(2) + " mm";
        },
        peso: (valor) => {
            let num = valor.replace(/\D/g, "");
            if (!num) return "";
            return (parseFloat(num) / 100).toFixed(2) + " kg";
        }
    };

    const inputs = [
        { el: document.querySelector('input[name="diametro"]'), tipo: 'diametro' },
        { el: document.querySelector('input[name="diametro-editar"]'), tipo: 'diametro' },
        { el: document.querySelector('input[name="pesoGramas"]'), tipo: 'peso' },
        { el: document.querySelector('input[name="peso-editar"]'), tipo: 'peso' }
    ];

    inputs.forEach(item => {
        if (item.el) {
            item.el.addEventListener('focus', e => {
                e.target.value = e.target.value.replace(/[^0-9,]/g, "");
            });

            item.el.addEventListener('blur', e => {
                if (e.target.value.trim() !== "") {
                    e.target.value = aplicarMascaras[item.tipo](e.target.value);
                }
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
            produto.pesoGramas = Math.round(produto.pesoGramas.replace('kg', '').replace(',', '.') * 1000);

            const pesoNum = parseFloat(produto.pesoGramas);
            const diametroNum = parseFloat(produto.diametro);

            produto.origemReciclada = (produto.origemReciclada === 'true');

            if (!produto.material.trim() || isNaN(pesoNum) || isNaN(diametroNum)) {
                dispararAlerta("Dados Inválidos", "Preencha material, peso e diâmetro corretamente.");
                return;
            }

            produto.pesoGramas = pesoNum;
            produto.diametro = diametroNum;

            try {
                const response = await fetch('http://localhost:8081/filamento', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(produto)
                });

                if (!response.ok) throw new Error();

                dispararAlerta("Sucesso", "Produto cadastrado!");
                formCadastrar.reset();
                document.getElementById('cadastrar-origem').value = "";
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
                const response = await fetch(`http://localhost:8081/filamento/${id}`);
                if (!response.ok) throw new Error();

                const dados = await response.json();

                document.getElementById('editar-material').value = dados.material;
                document.getElementById('editar-cor').value = dados.cor;
                document.getElementById('editar-diametro').value = dados.diametro.toFixed(2).replace('.', ',') + " mm";
                const pesoKg = (dados.pesoGramas / 1000).toFixed(2).replace('.', ',');
                document.getElementById('editar-peso').value = pesoKg + " kg";
                document.getElementById('editar-origem').value = dados.origemReciclada.toString();

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
                diametro: parseFloat(document.getElementById('editar-diametro').value.replace('mm','').replace(',', '.')),
                pesoGramas: Math.round(parseFloat(document.getElementById('editar-peso').value.replace('kg', '').replace(',', '.')) * 1000),
                origemReciclada: document.getElementById('editar-origem').value === 'true'
            };

            try {
                const response = await fetch(`http://localhost:8081/filamento/${id}`, {
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
        const response = await fetch(`http://localhost:8081/filamento/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error();

        dispararAlerta("Excluído", "Produto removido.");
        listarTodos();

    } catch {
        dispararAlerta("Erro", "Erro ao excluir.");
    }
};
