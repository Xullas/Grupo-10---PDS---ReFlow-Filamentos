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

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btnFecharModal').addEventListener('click', fecharModal);

    const inputCnpjCadastrar = document.querySelector('input[name="cnpj"]');
    const inputCnpjEditar = document.getElementById('editar-cnpj');
    const inputContatoEditar = document.getElementById('editar-contatos');

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
    const corpoTabela = document.getElementById('tabela-fornecedores');
    const campoIdEditar = document.getElementById('editar-id');

    // CADASTRO
    if (formCadastrar) {
        formCadastrar.addEventListener('submit', async (event) => {
            event.preventDefault();
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
                    listarTodos();
                }
            } catch (error) {
                dispararAlerta("Erro de Conexão", "Não foi possível conectar ao servidor.");
            }
        });
    }

    // LISTAGEM
    async function listarTodos() {
        try {
            const response = await fetch('http://localhost:8081/fornecedor');
            if (response.ok) {
                const fornecedores = await response.json();
                corpoTabela.innerHTML = '';
                fornecedores.forEach(f => {
                    const linha = document.createElement('tr');
                    linha.innerHTML = `
                        <td>${f.id}</td>
                        <td>${f.nome}</td>
                        <td>${f.cnpj}</td>
                        <td>${f.endereco}</td>
                        <td>${f.contato || ''}</td>
                        <td>${f.observacao || ''}</td>
                        <td>
                            <div style="display: flex; gap: 5px;">
                                <button class="btn-acao-edit" onclick="prepararEdicao(${f.id})">Editar</button>
                                <button class="btn-acao-excluir" onclick="excluirFornecedor(${f.id})">Excluir</button>
                            </div>
                        </td>
                    `;
                    corpoTabela.appendChild(linha);
                });
            }
        } catch (error) {
            console.error('Erro ao listar:', error);
        }
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
                    document.getElementById('editar-contatos').value = dados.contato ? aplicarMascaras.telefone(dados.contato) : '';
                    document.getElementById('editar-observacao').value = dados.observacao || '';
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

            const dadosAtualizados = {
                cnpj: document.getElementById('editar-cnpj').value.replace(/\D/g, ''),
                nome: document.getElementById('editar-nome').value,
                endereco: document.getElementById('editar-endereco').value,
                contato: document.getElementById('editar-contatos').value.replace(/\D/g, ''),
                observacao: document.getElementById('editar-observacao').value
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

    listarTodos();
});

window.prepararEdicao = function (id) {
    const campoIdEditar = document.getElementById('editar-id');
    if (campoIdEditar) {
        campoIdEditar.value = id;
        campoIdEditar.dispatchEvent(new Event('blur'));
        campoIdEditar.scrollIntoView({ behavior: "smooth" });
    }
};

window.excluirFornecedor = async function (id) {
    try {
        const response = await fetch(`http://localhost:8081/fornecedor/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {

            dispararAlerta("Excluído", "O fornecedor foi removido do sistema RE-FLOW.");
            listarTodos();

            setTimeout(() => {
                location.reload();
            }, 2400);

        } else {
            dispararAlerta("Erro", "Não foi possível excluir. O servidor retornou um erro.");
        }
    } catch (error) {
        console.error('Erro ao excluir:', error);
        dispararAlerta("Erro de Conexão", "Verifique se o seu banco de dados (JSON Server) está rodando.");
    }
};




