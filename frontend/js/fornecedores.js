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
// 2. UTILITÁRIOS DE INTERFACE (MODAL, MÁSCARAS E ERROS)
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

const aplicarMascaras = {
    cnpj(value) {
        if (!value) return '';
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    },
    telefone(value) {
        if (!value) return '';
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }
};

// ==========================================================================
// 3. CARREGAMENTO E RENDERIZAÇÃO DE DADOS (SEGURO CONTRA XSS)
// ==========================================================================
async function listarTodos() {
    const corpoTabela = document.getElementById('tabela-fornecedores');
    if (!corpoTabela) return;

    try {
        const fornecedores = await apiFetch('/fornecedor');
        corpoTabela.innerHTML = '';

        fornecedores.forEach(f => {
            const tr = document.createElement('tr');

            const colunasTexto = [
                f.nome,
                aplicarMascaras.cnpj(f.cnpj),
                f.endereco || '',
                f.contato ? aplicarMascaras.telefone(f.contato) : '',
                f.obs || ''
            ];

            colunasTexto.forEach(texto => {
                const td = document.createElement('td');
                td.textContent = texto;
                tr.appendChild(td);
            });

            const tdAcoes = document.createElement('td');
            const divBotoes = document.createElement('div');
            divBotoes.style.display = 'flex';
            divBotoes.style.gap = '5px';

            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn-acao-edit';
            btnEdit.textContent = 'Editar';
            btnEdit.onclick = () => prepararEdicao(f.id);

            const btnExcluir = document.createElement('button');
            btnExcluir.className = 'btn-acao-excluir';
            btnExcluir.textContent = 'Excluir';
            btnExcluir.onclick = () => excluirFornecedor(f.id);

            divBotoes.appendChild(btnEdit);
            divBotoes.appendChild(btnExcluir);
            tdAcoes.appendChild(divBotoes);
            tr.appendChild(tdAcoes);

            corpoTabela.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao listar fornecedores:', error);
        dispararAlerta("Erro de Conexão", "Não foi possível carregar os fornecedores.");
    }
}

function obterDadosFormulario(prefixo) {
    const campoCnpj = document.getElementById(`${prefixo}-cnpj`);
    const campoNome = document.getElementById(`${prefixo}-nome`);
    const campoEndereco = document.getElementById(`${prefixo}-endereco`);
    const campoContato = document.getElementById(`${prefixo}-contato`);
    const campoObs = document.getElementById(`${prefixo}-observacao`);

    const cnpjLimpo = campoCnpj ? campoCnpj.value.replace(/\D/g, '') : '';
    const nome = campoNome ? campoNome.value.trim() : '';

    let valido = true;

    if (cnpjLimpo.length !== 14) {
        gerenciarErroCampo(`${prefixo}-cnpj`, 'Informe um CNPJ válido com 14 dígitos.');
        valido = false;
    } else {
        gerenciarErroCampo(`${prefixo}-cnpj`);
    }

    if (!nome) {
        gerenciarErroCampo(`${prefixo}-nome`, 'Informe o nome ou razão social.');
        valido = false;
    } else {
        gerenciarErroCampo(`${prefixo}-nome`);
    }

    if (!valido) return null;

    return {
        cnpj: cnpjLimpo,
        nome: nome,
        endereco: campoEndereco ? campoEndereco.value.trim() : '',
        contato: campoContato ? campoContato.value.replace(/\D/g, '') : '',
        obs: campoObs ? campoObs.value.trim() : ''
    };
}

// ==========================================================================
// 4. INICIALIZAÇÃO DO DOM E EVENTOS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btnFecharModal')?.addEventListener('click', fecharModal);

    const aplicarMascaraInput = (id, tipo) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => e.target.value = aplicarMascaras[tipo](e.target.value));
        }
    };

    aplicarMascaraInput('cadastrar-cnpj', 'cnpj');
    aplicarMascaraInput('cadastrar-contato', 'telefone');
    aplicarMascaraInput('editar-cnpj', 'cnpj');
    aplicarMascaraInput('editar-contato', 'telefone');

    document.getElementById('form-cadastrar')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fornecedor = obterDadosFormulario('cadastrar');
        if (!fornecedor) return;

        try {
            await apiFetch('/fornecedor', { method: 'POST', body: fornecedor });
            dispararAlerta("Sucesso", "Fornecedor cadastrado com sucesso!");
            event.target.reset();
            await listarTodos();
        } catch (error) {
            dispararAlerta("Erro de Conexão", "Não foi possível conectar ao servidor.");
        }
    });

    document.getElementById('editar-id')?.addEventListener('blur', async (e) => {
        const id = e.target.value;
        if (!id) return;

        try {
            const dados = await apiFetch(`/fornecedor/${id}`);
            document.getElementById('editar-cnpj').value = aplicarMascaras.cnpj(dados.cnpj);
            document.getElementById('editar-nome').value = dados.nome || '';
            document.getElementById('editar-endereco').value = dados.endereco || '';
            document.getElementById('editar-contato').value = dados.contato ? aplicarMascaras.telefone(dados.contato) : '';
            document.getElementById('editar-observacao').value = dados.obs || '';
        } catch (error) {
            console.error('Erro ao buscar fornecedor:', error);
            dispararAlerta("Erro", "Fornecedor não encontrado.");
        }
    });

    document.getElementById('form-editar')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editar-id').value;

        if (!id) {
            dispararAlerta("Aviso", "Selecione um fornecedor na lista primeiro.");
            return;
        }

        const dadosAtualizados = obterDadosFormulario('editar');
        if (!dadosAtualizados) return;

        try {
            await apiFetch(`/fornecedor/${id}`, { method: 'PUT', body: dadosAtualizados });
            dispararAlerta("Sucesso", "Fornecedor atualizado!");
            e.target.reset();
            await listarTodos();
        } catch (error) {
            dispararAlerta("Erro", "Verifique se o backend está rodando na porta 8081.");
        }
    });

    listarTodos().catch(err => console.error("Erro no carregamento inicial:", err));
});

// ==========================================================================
// 5. FUNÇÕES GLOBAIS
// ==========================================================================
window.prepararEdicao = function (id) {
    const campoIdEditar = document.getElementById('editar-id');
    if (campoIdEditar) {
        campoIdEditar.value = id;
        campoIdEditar.dispatchEvent(new Event('blur'));
        campoIdEditar.scrollIntoView({ behavior: "smooth" });
    }
};

window.excluirFornecedor = async function (id) {
    if (!window.confirm('Tem certeza de que deseja excluir este fornecedor?')) return;

    try {
        await apiFetch(`/fornecedor/${id}`, { method: 'DELETE' });
        dispararAlerta("Excluído", "O fornecedor foi removido do sistema RE-FLOW.");
        await listarTodos();
    } catch {
        dispararAlerta("Erro", "Não foi possível excluir o fornecedor.");
    }
};