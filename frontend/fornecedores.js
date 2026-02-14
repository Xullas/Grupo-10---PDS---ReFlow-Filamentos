
document.addEventListener('DOMContentLoaded', () => {
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

    if (inputCnpjCadastrar) {
        inputCnpjCadastrar.addEventListener('input', (e) => {
            e.target.value = aplicarMascaras.cnpj(e.target.value);
        });
    }

    if (inputCnpjEditar) {
        inputCnpjEditar.addEventListener('input', (e) => {
            e.target.value = aplicarMascaras.cnpj(e.target.value);
        });
    }

    const inputContatoCadastrar = document.querySelector('input[name="contato"]');
    if (inputContatoCadastrar) {
        inputContatoCadastrar.addEventListener('input', (e) => {
            e.target.value = aplicarMascaras.telefone(e.target.value);
        });
    }

    if (inputContatoEditar) {
        inputContatoEditar.addEventListener('input', (e) => {
            e.target.value = aplicarMascaras.telefone(e.target.value);
        });
    }


    const formCadastrar = document.getElementById('form-cadastrar');
    const btnListar = document.getElementById('btn-listar');
    const corpoTabela = document.getElementById('tabela-fornecedores');
    const campoIdEditar = document.getElementById('editar-id');

    if (formCadastrar) {
        formCadastrar.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(formCadastrar);
            const fornecedor = Object.fromEntries(formData.entries());

            fornecedor.cnpj = fornecedor.cnpj.replace(/\D/g, '');
            if (fornecedor.contato) {
                fornecedor.contato = fornecedor.contato.replace(/\D/g, '');
            }

            if (fornecedor.nome.trim() === "" || fornecedor.cnpj.length !== 14) {
                alert("Por favor, preencha os campos com caracteres válidos!");
                return;
            }

            try {
                const response = await fetch('http://localhost:8081/fornecedor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fornecedor)
                });

                if (response.ok) {
                    alert('Fornecedor cadastrado com sucesso!');
                    formCadastrar.reset();
                    listarTodos();
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        });
    }

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
                        <td><button class="btn-acao-edit" onclick="prepararEdicao(${f.id})">Editar</button></td>
                    `;
                    corpoTabela.appendChild(linha);
                });
            }
        } catch (error) {
            console.error('Erro ao listar:', error);
        }
    }
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
                    document.getElementById('editar-contatos').value = dados.contato;
                    document.getElementById('editar-observacao').value = dados.observacao;

                    if (dados.contato) {
                        document.getElementById('editar-contatos').value = aplicarMascaras.telefone(dados.contato);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar:', error);
            }
        });
    }


    const formEditar = document.querySelector('#form-editar');

    if (formEditar) {
        
        console.log("Formulário de edição encontrado!");
       
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('editar-id').value;

            if (!id) {
                alert("Por favor, selecione um fornecedor na lista primeiro.");
                return;
            }

            const dadosAtualizados = {
                cnpj: document.getElementById('editar-cnpj').value,
                nome: document.getElementById('editar-nome').value,
                endereco: document.getElementById('editar-endereco').value,
                contato: document.getElementById('editar-contatos').value,
                observacao: document.getElementById('editar-observacao').value
            };

try {
            const url = `http://localhost:8081/fornecedor/${id}`;
            console.log("Enviando para:", url);

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizados)
            });

                if (response.ok) {
                    alert('Fornecedor atualizado com sucesso!');
                    
                    await listarTodos();
                    formEditar.reset();
                
                } else {
                    alert('Erro ao atualizar fornecedor.');
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
            alert('Erro de conexão: Verifique se o backend está rodando na porta 8081');
            }
        });
    }


    if (btnListar) btnListar.addEventListener('click', listarTodos);
    listarTodos();
});

window.prepararEdicao = function (id) {
    const campoIdEditar = document.getElementById('editar-id');
    if (campoIdEditar) {
        campoIdEditar.value = id;
        campoIdEditar.dispatchEvent(new Event('blur'));
        campoIdEditar.scrollIntoView();
    }
};

