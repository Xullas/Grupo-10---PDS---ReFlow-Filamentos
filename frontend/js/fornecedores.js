// FUNÇÕES DO MODAL
function dispararAlerta(titulo, mensagem) {
    const modal = document.getElementById('modalAlerta');
    const tituloHTML = document.getElementById('modalTitulo');
    const mensagemHTML = document.getElementById('modalMensagem');

    tituloHTML.innerText = titulo;
    mensagemHTML.innerText = mensagem;
    modal.classList.add('ativo');
}

function fecharModal() {
    document.getElementById('modalAlerta').classList.remove('ativo');
}

const aplicarMascaras = {
    cnpj(value) {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    },
    telefone(value) {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }
};

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btnFecharModal').addEventListener('click', fecharModal);

    const inputCnpjCadastrar = document.querySelector('input[name="cnpj"]');
    const inputCnpjEditar = document.getElementById('editar-cnpj');
    const inputContatoEditar = document.getElementById('editar-contato');

    // Aplicar Máscaras nos Inputs
    [inputCnpjCadastrar, inputCnpjEditar].forEach(input => {
        if (input) input.addEventListener('input', (e) => e.target.value = aplicarMascaras.cnpj(e.target.value));
    });

    const inputContatoCadastrar = document.querySelector('input[name="contato"]');
    if (inputContatoCadastrar) {
        inputContatoCadastrar.addEventListener('input', (e) => e.target.value = aplicarMascaras.telefone(e.target.value));
    }

    if (inputContatoEditar) {
        inputContatoEditar.addEventListener('input', (e) => e.target.value = aplicarMascaras.telefone(e.target.value));
    }

    const formCadastrar = document.getElementById('form-cadastrar');
    const campoIdEditar = document.getElementById('editar-id');

    // FUNÇÕES UTILITÁRIAS DE ERRO
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

    // CADASTRO
    if (formCadastrar) {
        formCadastrar.addEventListener('submit', async (event) => {
            event.preventDefault();

            const campoCnpj = document.getElementById('cadastrar-cnpj');
            const campoNome = document.getElementById('cadastrar-nome');
            let formularioValido = true;

            const cnpjLimpo = campoCnpj.value.replace(/\D/g, '');
            if (cnpjLimpo.length !== 14) {
                mostrarErroCampo(campoCnpj, 'Informe um CNPJ válido com 14 dígitos.');
                formularioValido = false;
            } else {
                limparErroCampo(campoCnpj);
            }

            if (!campoNome.value.trim()) {
                mostrarErroCampo(campoNome, 'Informe o nome ou razão social.');
                formularioValido = false;
            } else {
                limparErroCampo(campoNome);
            }

            if (!formularioValido) return;

            const formData = new FormData(formCadastrar);
            const fornecedor = Object.fromEntries(formData.entries());

            fornecedor.cnpj = fornecedor.cnpj.replace(/\D/g, '');
            if (fornecedor.contato) fornecedor.contato = fornecedor.contato.replace(/\D/g, '');

            if (fornecedor.nome.trim() === "" || fornecedor.cnpj.length !== 14) {
                dispararAlerta("Dados Inválidos", "Por favor, preencha o Nome e um CNPJ válido!");
                return;
            }

            try {
                const response = await fetch('http://localhost:8081/fornecedor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fornecedor)
                });

                if (response.ok) {
                    dispararAlerta("Sucesso", "Fornecedor cadastrado com sucesso!");
                    formCadastrar.reset();
                    await listarTodos();
                }
            } catch (error) {
                dispararAlerta("Erro de Conexão", "Não foi possível conectar ao servidor.");
            }
        });
    }

    // BUSCA PARA EDIÇÃO
    if (campoIdEditar) {
        campoIdEditar.addEventListener('blur', async () => {
            const id = campoIdEditar.value;
            if (!id) return;
            try {
                const response = await fetch(`http://localhost:8081/fornecedor/${id}`);
                if (response.ok) {
                    const dados = await response.json();
                    document.getElementById('editar-cnpj').value = aplicarMascaras.cnpj(dados.cnpj);
                    document.getElementById('editar-nome').value = dados.nome;
                    document.getElementById('editar-endereco').value = dados.endereco;
                    document.getElementById('editar-contato').value = dados.contato ? aplicarMascaras.telefone(dados.contato) : '';
                    document.getElementById('editar-observacao').value = dados.obs || '';
                }
            } catch (error) {
                console.error('Erro ao buscar:', error);
            }
        });
    }

    // SALVAR EDIÇÃO
    const formEditar = document.querySelector('#form-editar');
    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editar-id').value;

            if (!id) {
                dispararAlerta("Aviso", "Selecione um fornecedor na lista primeiro.");
                return;
            }

            const campoCnpj = document.getElementById('editar-cnpj');
            const campoNome = document.getElementById('editar-nome');
            let formularioValido = true;

            const cnpjLimpo = campoCnpj.value.replace(/\D/g, '');
            if (cnpjLimpo.length !== 14) {
                mostrarErroCampo(campoCnpj, 'Informe um CNPJ válido com 14 dígitos.');
                formularioValido = false;
            } else {
                limparErroCampo(campoCnpj);
            }

            if (!campoNome.value.trim()) {
                mostrarErroCampo(campoNome, 'Informe o nome ou razão social.');
                formularioValido = false;
            } else {
                limparErroCampo(campoNome);
            }

            if (!formularioValido) return;

            const dadosAtualizados = {
                cnpj: document.getElementById('editar-cnpj').value.replace(/\D/g, ''),
                nome: document.getElementById('editar-nome').value,
                endereco: document.getElementById('editar-endereco').value,
                contato: document.getElementById('editar-contato').value.replace(/\D/g, ''),
                obs: document.getElementById('editar-observacao').value
            };

            try {
                const response = await fetch(`http://localhost:8081/fornecedor/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });

                if (response.ok) {
                    dispararAlerta("Sucesso", "Fornecedor atualizado!");
                    await listarTodos();
                    formEditar.reset();
                } else {
                    dispararAlerta("Erro", "Erro ao atualizar fornecedor.");
                }
            } catch (error) {
                dispararAlerta("Erro", "Verifique se o backend está rodando na porta 8081.");
            }
        });
    }

    listarTodos().catch(err => console.error("Erro no carregamento inicial:", err));
});

// LISTAGEM
window.listarTodos = async function() {
    const corpoTabela = document.getElementById('tabela-fornecedores');
    if (!corpoTabela) return;

    try {
        const response = await fetch('http://localhost:8081/fornecedor');
        if (!response.ok) throw new Error("Erro na rede");

        const fornecedores = await response.json();
        corpoTabela.innerHTML = '';

        fornecedores.forEach(f => {
            const linha = document.createElement('tr');

            const tdNome = document.createElement('td');
            tdNome.textContent = f.nome;

            const tdCnpj = document.createElement('td');
            tdCnpj.textContent = aplicarMascaras.cnpj(f.cnpj);

            const tdEndereco = document.createElement('td');
            tdEndereco.textContent = f.endereco || '';

            const tdContato = document.createElement('td');
            tdContato.textContent = f.contato ? aplicarMascaras.telefone(f.contato) : '';

            const tdObs = document.createElement('td');
            tdObs.textContent = f.obs || '';

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
            btnExcluir.addEventListener('click', () => excluirFornecedor(f.id));

            divBotoes.appendChild(btnEdit);
            divBotoes.appendChild(btnExcluir);
            tdAcoes.appendChild(divBotoes);

            linha.appendChild(tdNome);
            linha.appendChild(tdCnpj);
            linha.appendChild(tdEndereco);
            linha.appendChild(tdContato);
            linha.appendChild(tdObs);
            linha.appendChild(tdAcoes);

            corpoTabela.appendChild(linha);
        });
    } catch (error) {
        console.error('Erro ao listar fornecedores:', error);
        dispararAlerta("Erro de Conexão", "Não foi possível carregar os fornecedores.");
    }
}

window.prepararEdicao = function (id) {
    const campoIdEditar = document.getElementById('editar-id');
    if (campoIdEditar) {
        campoIdEditar.value = id;
        campoIdEditar.dispatchEvent(new Event('blur'));
        campoIdEditar.scrollIntoView({ behavior: "smooth" });
    }
};

window.excluirFornecedor = async function (id) {
    const confirmou = window.confirm('Tem certeza de que deseja excluir este fornecedor?');
    if (!confirmou) return;

    try {
        const response = await fetch(`http://localhost:8081/fornecedor/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            dispararAlerta("Excluído", "O fornecedor foi removido do sistema RE-FLOW.");
            await listarTodos();
        } else {
            dispararAlerta("Erro", "Não foi possível excluir. O servidor retornou um erro.");
        }
    } catch (error) {
        dispararAlerta("Erro de Conexão", "Verifique se o seu servidor backend está rodando.");
    }
};