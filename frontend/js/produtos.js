// ==========================================================================
// 1. CONFIGURAÇÕES E CLIENTE API
// ==========================================================================
const API_URL = 'http://localhost:8081';

async function apiFetch(endpoint, options = {}) {
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options
    };
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }
    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
    return response.status !== 204 ? await response.json() : null;
}

// ==========================================================================
// 2. UTILITÁRIOS DE INTERFACE (MODAL E ERROS)
// ==========================================================================
function dispararAlerta(titulo, mensagem) {
    document.getElementById('modalTitulo').innerText = titulo;
    document.getElementById('modalMensagem').innerText = mensagem;
    document.getElementById('modalAlerta').classList.add('ativo');
}

function fecharModal() {
    document.getElementById('modalAlerta').classList.remove('ativo');
}

function gerenciarErroCampo(campoId, mensagem = '') {
    const campo = document.getElementById(campoId);
    if (!campo) return;
    const msgEl = document.getElementById(`erro-${campo.id}`);

    campo.classList.toggle('campo-invalido', Boolean(mensagem));
    if (msgEl) msgEl.textContent = mensagem;
}

// Converte strings formatadas ("1,75 mm" ou "1,50 kg") em números puros
function extrairNumero(valorString) {
    if (!valorString) return 0;
    const limpo = valorString.toString().replace(/[^0-9,/.]/g, '').replace(',', '.');
    return parseFloat(limpo) || 0;
}

// ==========================================================================
// 3. CARREGAMENTO E RENDERIZAÇÃO DE DADOS (SEGURO CONTRA XSS)
// ==========================================================================
async function carregarSugestoesFornecedores() {
    try {
        const fornecedores = await apiFetch('/fornecedor');
        const selects = [
            document.getElementById('cadastrar-fornecedor-select'),
            document.getElementById('editar-fornecedor-select')
        ];

        selects.forEach(select => {
            if (!select) return;
            select.innerHTML = '';

            const optPadrao = document.createElement('option');
            optPadrao.value = '';
            optPadrao.selected = true;
            optPadrao.textContent = 'Selecione um fornecedor';

            const optOutro = document.createElement('option');
            optOutro.value = 'NOVO_FORNECEDOR';
            optOutro.textContent = 'Fornecedor não listado / Outro';

            select.appendChild(optPadrao);
            select.appendChild(optOutro);

            fornecedores.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = f.nome; // Usando textContent para segurança
                select.appendChild(opt);
            });
        });
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
    }
}

async function listarTodos() {
    const corpoTabela = document.getElementById('tabela-produtos');
    if (!corpoTabela) return;

    try {
        const produtos = await apiFetch('/filamento');
        corpoTabela.innerHTML = ''; // Limpa a tabela antes de renderizar

        produtos.forEach(p => {
            const tr = document.createElement('tr');

            // Valores das colunas organizados em array
            const colunasTexto = [
                p.material,
                p.cor,
                `${p.diametro} mm`,
                `${(p.pesoGramas / 1000).toFixed(2).replace('.', ',')} kg`,
                p.fornecedorNome || 'Não informado',
                p.origemReciclada ? 'Sim' : 'Não'
            ];

            // Cria e preenche cada TD usando textContent (100% Seguro)
            colunasTexto.forEach(texto => {
                const td = document.createElement('td');
                td.textContent = texto;
                tr.appendChild(td);
            });

            // Coluna de Ações (Botões Editar / Excluir)
            const tdAcoes = document.createElement('td');
            const divBotoes = document.createElement('div');
            divBotoes.style.display = 'flex';
            divBotoes.style.gap = '5px';

            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn-acao-edit';
            btnEdit.textContent = 'Editar';
            btnEdit.onclick = () => prepararEdicao(p.id);

            const btnExcluir = document.createElement('button');
            btnExcluir.className = 'btn-acao-excluir';
            btnExcluir.textContent = 'Excluir';
            btnExcluir.onclick = () => excluirProduto(p.id);

            divBotoes.appendChild(btnEdit);
            divBotoes.appendChild(btnExcluir);
            tdAcoes.appendChild(divBotoes);
            tr.appendChild(tdAcoes);

            corpoTabela.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao listar:", error);
        dispararAlerta("Erro", "Erro ao carregar produtos.");
    }
}

// Extrai e valida dados dos formulários (cadastrar ou editar)
function obterDadosFormulario(prefixo) {
    const material = document.getElementById(`${prefixo}-material`).value.trim();
    const cor = document.getElementById(`${prefixo}-cor`).value.trim();
    const diametro = extrairNumero(document.getElementById(`${prefixo}-diametro`).value);
    const pesoKg = extrairNumero(document.getElementById(`${prefixo}-peso`).value);
    const pesoGramas = Math.round(pesoKg * 1000);
    const selectForn = document.getElementById(`${prefixo}-fornecedor-select`);
    const inputManual = document.getElementById(`${prefixo}-fornecedor-manual`);

    let valido = true;

    if (!material) { gerenciarErroCampo(`${prefixo}-material`, 'Informe o material.'); valido = false; }
    else gerenciarErroCampo(`${prefixo}-material`);

    if (!cor) { gerenciarErroCampo(`${prefixo}-cor`, 'Informe a cor.'); valido = false; }
    else gerenciarErroCampo(`${prefixo}-cor`);

    if (diametro <= 0) { gerenciarErroCampo(`${prefixo}-diametro`, 'Diâmetro inválido.'); valido = false; }
    else gerenciarErroCampo(`${prefixo}-diametro`);

    if (pesoGramas <= 0) { gerenciarErroCampo(`${prefixo}-peso`, 'Peso inválido.'); valido = false; }
    else gerenciarErroCampo(`${prefixo}-peso`);

    if (!valido) return null;

    return {
        material,
        cor,
        diametro,
        pesoGramas,
        fornecedorId: selectForn.value && selectForn.value !== "NOVO_FORNECEDOR" ? Number(selectForn.value) : null,
        fornecedorNomeManual: selectForn.value === "NOVO_FORNECEDOR" ? inputManual.value.trim() : null,
        origemReciclada: document.getElementById(`${prefixo}-origem`).value === 'true'
    };
}

// ==========================================================================
// 4. INICIALIZAÇÃO DO DOM E EVENTOS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btnFecharModal')?.addEventListener('click', fecharModal);

    // MÁSCARAS DE INPUT
    const mascaras = {
        diametro: (v) => v ? (parseFloat(v.replace(/\D/g, "")) / 100).toFixed(2) + " mm" : "",
        peso: (v) => v ? (parseFloat(v.replace(/\D/g, "")) / 100).toFixed(2) + " kg" : ""
    };

    [
        { id: 'cadastrar-diametro', tipo: 'diametro' },
        { id: 'editar-diametro', tipo: 'diametro' },
        { id: 'cadastrar-peso', tipo: 'peso' },
        { id: 'editar-peso', tipo: 'peso' }
    ].forEach(({ id, tipo }) => {
        const input = document.getElementById(id);
        if (!input) return;

        input.addEventListener('focus', e => e.target.value = e.target.value.replace(/[^0-9,]/g, ""));
        input.addEventListener('blur', e => {
            if (e.target.value.trim()) e.target.value = mascaras[tipo](e.target.value);
        });
    });

    // ALTERNÂNCIA DE CAMPOS DE FORNECEDOR
    const vincularSelectFornecedor = (selectId, grupoId) => {
        document.getElementById(selectId)?.addEventListener('change', e => {
            const grupo = document.getElementById(grupoId);
            if (grupo) grupo.style.display = e.target.value === "NOVO_FORNECEDOR" ? "block" : "none";
        });
    };
    vincularSelectFornecedor('cadastrar-fornecedor-select', 'grupo-fornecedor-novo-cad');
    vincularSelectFornecedor('editar-fornecedor-select', 'grupo-fornecedor-novo-edit');

    // SUBMIT CADASTRAR
    document.getElementById('form-cadastrar')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const produto = obterDadosFormulario('cadastrar');
        if (!produto) return;

        try {
            await apiFetch('/filamento', { method: 'POST', body: produto });
            dispararAlerta("Sucesso", "Produto cadastrado!");
            e.target.reset();
            document.getElementById('grupo-fornecedor-novo-cad').style.display = "none";
            listarTodos();
            carregarSugestoesFornecedores();
        } catch {
            dispararAlerta("Erro", "Servidor não respondeu.");
        }
    });

    // BUSCA PARA EDIÇÃO (BLUR NO ID)
    document.getElementById('editar-id')?.addEventListener('blur', async (e) => {
        const id = e.target.value;
        if (!id) return;

        try {
            const dados = await apiFetch(`/filamento/${id}`);

            document.getElementById('editar-material').value = dados.material;
            document.getElementById('editar-cor').value = dados.cor;
            document.getElementById('editar-diametro').value = `${dados.diametro.toFixed(2).replace('.', ',')} mm`;
            document.getElementById('editar-peso').value = `${(dados.pesoGramas / 1000).toFixed(2).replace('.', ',')} kg`;
            document.getElementById('editar-origem').value = dados.origemReciclada.toString();

            const selectEdit = document.getElementById('editar-fornecedor-select');
            const grupoManual = document.getElementById('grupo-fornecedor-novo-edit');
            const inputManual = document.getElementById('editar-fornecedor-manual');

            const opcao = Array.from(selectEdit.options).find(o => o.textContent.toLowerCase() === (dados.fornecedorNome || "").toLowerCase());

            if (dados.fornecedorNome && opcao && opcao.value !== "NOVO_FORNECEDOR") {
                selectEdit.value = opcao.value;
                grupoManual.style.display = "none";
            } else if (dados.fornecedorNome) {
                selectEdit.value = "NOVO_FORNECEDOR";
                grupoManual.style.display = "block";
                inputManual.value = dados.fornecedorNome;
            } else {
                selectEdit.value = "";
                grupoManual.style.display = "none";
            }
        } catch {
            dispararAlerta("Erro", "Produto não encontrado.");
        }
    });

    // SUBMIT EDIÇÃO
    document.getElementById('form-editar')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editar-id').value;
        if (!id) return dispararAlerta("Aviso", "Selecione um produto primeiro.");

        const produto = obterDadosFormulario('editar');
        if (!produto) return;

        try {
            await apiFetch(`/filamento/${id}`, { method: 'PUT', body: produto });
            dispararAlerta("Sucesso", "Produto atualizado!");
            e.target.reset();
            document.getElementById('grupo-fornecedor-novo-edit').style.display = "none";
            listarTodos();
            carregarSugestoesFornecedores();
        } catch {
            dispararAlerta("Erro", "Erro ao atualizar.");
        }
    });

    listarTodos();
    carregarSugestoesFornecedores();
});

// ==========================================================================
// 5. FUNÇÕES GLOBAIS (CHAMADAS PELOS BOTÕES DA TABELA)
// ==========================================================================
window.prepararEdicao = function(id) {
    const campo = document.getElementById('editar-id');
    if (!campo) return;
    campo.value = id;
    campo.dispatchEvent(new Event('blur'));
    campo.scrollIntoView({ behavior: "smooth" });
};

window.excluirProduto = async function(id) {
    if (!confirm('Tem certeza de que deseja excluir este produto?')) return;

    try {
        await apiFetch(`/filamento/${id}`, { method: 'DELETE' });
        dispararAlerta("Excluído", "Produto removido.");
        listarTodos();
    } catch {
        dispararAlerta("Erro", "Não foi possível excluir o produto.");
    }
};