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

function mostrarErroCampo(campo, mensagem) {
    if (!campo) return;
    const mensagemElement = document.getElementById(`erro-${campo.id}`);
    campo.classList.toggle('campo-invalido', Boolean(mensagem));
    if (mensagemElement) {
        mensagemElement.textContent = mensagem;
    }
}

function limparErroCampo(campo) {
    mostrarErroCampo(campo, '');
}

let mapaFornecedores = {};

async function carregarSugestoesFornecedores() {
    const selects = [
        document.getElementById('cadastrar-fornecedor-select'),
        document.getElementById('editar-fornecedor-select')
    ];

    try {
        const response = await fetch('http://localhost:8081/fornecedor');
        const fornecedores = await response.json();

        selects.forEach(select => {
            if (!select) return;
            select.innerHTML = `
                <option value="" selected>Selecione um fornecedor</option>
                <option value="NOVO_FORNECEDOR">Fornecedor não listado / Outro</option>
            `;

            fornecedores.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = f.nome;
                select.appendChild(opt);
            });
        });
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
    }
}


// FUNÇÃO LISTAR

async function listarTodos() {
    const corpoTabela = document.getElementById('tabela-produtos');
    if (!corpoTabela) return;

    try {
        const response = await fetch('http://localhost:8081/filamento');
        if (!response.ok) throw new Error("Falha ao buscar produtos");

        const produtos = await response.json();
        corpoTabela.innerHTML = '';

        produtos.forEach(f => {
            const linha = document.createElement('tr');

            const tdMaterial = document.createElement('td');
            tdMaterial.textContent = f.material;

            const tdCor = document.createElement('td');
            tdCor.textContent = f.cor;

            const tdDiametro = document.createElement('td');
            tdDiametro.textContent = `${f.diametro} mm`;

            const tdPeso = document.createElement('td');
            tdPeso.textContent = `${(f.pesoGramas / 1000).toFixed(2).replace('.', ',')} kg`;

            const tdFornecedor = document.createElement('td');
            tdFornecedor.textContent = f.fornecedorNome || 'Não informado';

            const tdOrigem = document.createElement('td');
            tdOrigem.textContent = f.origemReciclada ? 'Sim' : 'Não';

            const tdAcoes = document.createElement('td');
            const divBotoes = document.createElement('div');
            divBotoes.style.display = 'flex';
            divBotoes.style.gap = '5px';

            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn-acao-edit';
            btnEdit.textContent = 'Editar';
            btnEdit.addEventListener('click', () => prepararEdicao(f.id));

            const btnExcluir = document.createElement('button');
            btnExcluir.className = 'btn-acao-excluir';
            btnExcluir.textContent = 'Excluir';
            btnExcluir.addEventListener('click', () => excluirProduto(f.id));

            divBotoes.appendChild(btnEdit);
            divBotoes.appendChild(btnExcluir);
            tdAcoes.appendChild(divBotoes);

            linha.appendChild(tdMaterial);
            linha.appendChild(tdCor);
            linha.appendChild(tdDiametro);
            linha.appendChild(tdPeso);
            linha.appendChild(tdFornecedor);
            linha.appendChild(tdOrigem);
            linha.appendChild(tdAcoes);

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

    const configurarAlternanciaFornecedor = (idSelect, idGrupoInput) => {
        const select = document.getElementById(idSelect);
        const grupo = document.getElementById(idGrupoInput);
        if (select && grupo) {
            select.addEventListener('change', (e) => {
                grupo.style.display = e.target.value === "NOVO_FORNECEDOR" ? "block" : "none";
            });
        }
    };

    configurarAlternanciaFornecedor('cadastrar-fornecedor-select', 'grupo-fornecedor-novo-cad');
    configurarAlternanciaFornecedor('editar-fornecedor-select', 'grupo-fornecedor-novo-edit');


    // CADASTRAR

    const formCadastrar = document.getElementById('form-cadastrar');

    if (formCadastrar) {
        formCadastrar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(formCadastrar);
            const produto = Object.fromEntries(formData.entries());

            const diametroLimpo = produto.diametro.replace('mm', '').trim().replace(',', '.');
            const pesoKgLimpo = produto.pesoGramas.replace('kg', '').trim().replace(',', '.');

            const diametroNum = parseFloat(diametroLimpo);
            const pesoGramasNum = Math.round(parseFloat(pesoKgLimpo) * 1000);

            const selectForn = document.getElementById('cadastrar-fornecedor-select');
            const inputManual = document.getElementById('cadastrar-fornecedor-manual');

            let idParaEnviar = null;
            let nomeManualParaEnviar = null;

            if (selectForn.value === "NOVO_FORNECEDOR") {
                idParaEnviar = null;
                nomeManualParaEnviar = inputManual.value.trim();
            } else if (selectForn.value !== "") {
                idParaEnviar = Number(selectForn.value);
                nomeManualParaEnviar = null;
            }

            produto.material = produto.material.trim();
            produto.diametro = diametroNum;
            produto.pesoGramas = pesoGramasNum;
            produto.fornecedorId = idParaEnviar,
            produto.fornecedorNomeManual = nomeManualParaEnviar;
            produto.origemReciclada = (produto.origemReciclada === 'true');

            const campoMaterial = document.getElementById('cadastrar-material');
            const campoCor = document.getElementById('cadastrar-cor');
            const campoDiametro = document.getElementById('cadastrar-diametro');
            const campoPeso = document.getElementById('cadastrar-peso');

            let formularioValido = true;

            if (!produto.material) {
                mostrarErroCampo(campoMaterial, 'Informe o tipo de material.');
                formularioValido = false;
            } else {
                limparErroCampo(campoMaterial);
            }

            if (!produto.cor) {
                mostrarErroCampo(campoCor, 'Informe a cor.');
                formularioValido = false;
            } else {
                limparErroCampo(campoCor);
            }

            if (!Number.isFinite(diametroNum) || diametroNum <= 0) {
                mostrarErroCampo(campoDiametro, 'Informe um diâmetro válido.');
                formularioValido = false;
            } else {
                limparErroCampo(campoDiametro);
            }

            if (!Number.isFinite(pesoGramasNum) || pesoGramasNum <= 0) {
                mostrarErroCampo(campoPeso, 'Informe um peso válido.');
                formularioValido = false;
            } else {
                limparErroCampo(campoPeso);
            }

            if (!formularioValido) {
                return;
            }

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
                document.getElementById('grupo-fornecedor-novo-cad').style.display = "none";

                if (typeof carregarSugestoesFornecedores === 'function') {
                    carregarSugestoesFornecedores();
                }

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
                if (!response.ok) throw new Error("Fetch falhou");

                const dados = await response.json();

                const selectEditar = document.getElementById('editar-fornecedor-select');
                const grupoManualEdit = document.getElementById('grupo-fornecedor-novo-edit');
                const inputManualEdit = document.getElementById('editar-fornecedor-manual');
                const nomeFornecedorBanco = dados.fornecedorNome || "";

                const opcaoEncontrada = Array.from(selectEditar.options).find(opt =>
                    opt.textContent.toLowerCase() === nomeFornecedorBanco.toLowerCase()
                );

                if (nomeFornecedorBanco && opcaoEncontrada && opcaoEncontrada.value !== "NOVO_FORNECEDOR") {
                    selectEditar.value = opcaoEncontrada.value;
                    grupoManualEdit.style.display = "none";
                } else if (nomeFornecedorBanco) {
                    selectEditar.value = "NOVO_FORNECEDOR";
                    grupoManualEdit.style.display = "block";
                    inputManualEdit.value = nomeFornecedorBanco;
                } else {
                    selectEditar.value = "";
                    grupoManualEdit.style.display = "none";
                }

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

            const campoMaterial = document.getElementById('editar-material');
            const campoCor = document.getElementById('editar-cor');
            const campoDiametro = document.getElementById('editar-diametro');
            const campoPeso = document.getElementById('editar-peso');

            const diametroNum = parseFloat(campoDiametro.value.replace('mm', '').trim().replace(',', '.'));
            const pesoKgNum = parseFloat(campoPeso.value.replace('kg', '').trim().replace(',', '.'));
            const pesoGramasNum = Math.round(pesoKgNum * 1000);

            let formularioValido = true;

            if (!campoMaterial.value.trim()) {
                mostrarErroCampo(campoMaterial, 'Informe o material.');
                formularioValido = false;
            } else {
                limparErroCampo(campoMaterial);
            }

            if (!campoCor.value.trim()) {
                mostrarErroCampo(campoCor, 'Informe a cor.');
                formularioValido = false;
            } else {
                limparErroCampo(campoCor);
            }

            if (!Number.isFinite(diametroNum) || diametroNum <= 0) {
                mostrarErroCampo(campoDiametro, 'Informe um diâmetro válido.');
                formularioValido = false;
            } else {
                limparErroCampo(campoDiametro);
            }

            if (!Number.isFinite(pesoGramasNum) || pesoGramasNum <= 0) {
                mostrarErroCampo(campoPeso, 'Informe um peso válido.');
                formularioValido = false;
            } else {
                limparErroCampo(campoPeso);
            }

            if (!formularioValido) return;

            const selectE = document.getElementById('editar-fornecedor-select');
            const inputE = document.getElementById('editar-fornecedor-manual');

            let idParaEnviar = null;
            let nomeManualParaEnviar = null;

            if (selectE.value === "NOVO_FORNECEDOR") {
                idParaEnviar = null;
                nomeManualParaEnviar = inputE.value.trim() || "Não informado";
            } else if (selectE.value !== "") {
                idParaEnviar = Number(selectE.value);
                nomeManualParaEnviar = null;
            }

            const dadosAtualizados = {
                material: document.getElementById('editar-material').value,
                cor: document.getElementById('editar-cor').value,
                diametro: parseFloat(document.getElementById('editar-diametro').value.replace('mm','').replace(',', '.')),
                pesoGramas: Math.round(parseFloat(document.getElementById('editar-peso').value.replace('kg', '').replace(',', '.')) * 1000),
                fornecedorId: idParaEnviar,
                fornecedorNomeManual: nomeManualParaEnviar,
                origemReciclada: document.getElementById('editar-origem').value === 'true'
            };

            try {
                const response = await fetch(`http://localhost:8081/filamento/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });

                if (!response.ok) throw new Error("Erro na requisição");

                dispararAlerta("Sucesso", "Produto atualizado!");
                formEditar.reset();
                if (inputE) {
                    document.getElementById('grupo-fornecedor-novo-edit').style.display = "none";
                }

                listarTodos();
                if (typeof carregarSugestoesFornecedores === 'function') {
                    carregarSugestoesFornecedores();
                }

            } catch {
                dispararAlerta("Erro", "Erro ao atualizar.");
            }
        });
    }

    listarTodos();
    carregarSugestoesFornecedores()
});


// FUNÇÕES GLOBAIS

window.prepararEdicao = function(id) {
    const campo = document.getElementById('editar-id');
    campo.value = id;
    campo.dispatchEvent(new Event('blur'));
    campo.scrollIntoView({ behavior: "smooth" });
};

window.excluirProduto = async function(id) {
    const confirmou = window.confirm('Tem certeza de que deseja excluir este produto?');
    if (!confirmou) return;

    try {
        const response = await fetch(`http://localhost:8081/filamento/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("Falha ao excluir");

        dispararAlerta("Excluído", "Produto removido.");
        listarTodos();

    } catch (error) {
        console.error(error);
        dispararAlerta("Erro", "Não foi possível excluir o produto.");
    }
};
