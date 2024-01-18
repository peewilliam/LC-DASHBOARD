// Função para verificar se a URL contém "/usuarios"
function pagina_usuarios() {
   return window.location.pathname.includes('/usuarios');
}

// Inserir modulos no campo de seleção de modulos no usuario
async function inserir_modulos_usuarios(usuario) {
   // Verifica se a URL é /usuarios
   if (pagina_usuarios()) {
      const modulos = await obter_modulos();
      const modulos_usuarios = $(document.querySelector('.modulos-usuarios'));

      // Limpa o conteúdo atual antes de adicionar novas opções
      modulos_usuarios.empty().trigger('change');

      modulos.forEach(modulo => {
         var newOption = new Option(modulo, modulo, false, verifica_modulo_selecionado(modulo, usuario));
         modulos_usuarios.append(newOption).trigger('change');
      });
   }
}

// Função para verificar se o módulo está presente nos módulos do usuário
function verifica_modulo_selecionado(modulo, usuario) {
   return usuario && usuario.module && usuario.module.includes(modulo);
}

// Função assíncrona para obter informações do usuário
async function obter_dados_usuarios(id) {
   const response = await fetch('/api/usuarios');
   const data = await response.json();
   return data.find(user => user.id === id);
}

// Função para manipular o clique e chamar a função assíncrona
async function clique_btn_editar(e) {
   try {
      // dados do botão clicado
      const parentRow = e.closest('tr');
      const id_user = Number(parentRow.getAttribute('id-user'));

      // Remover a classe 'selected' de todas as linhas
      document.querySelectorAll('.usuarios tr').forEach(row => {
         row.classList.remove('selected');
      });

      // Adicionar a classe 'selected' à linha clicada
      parentRow.classList.add('selected');

      const usuarioEmEdicao = await obter_dados_usuarios(id_user);

      // modal
      const modal = document.querySelector('.modal');
      const modulos_usuarios = document.querySelector('.modulos-usuarios');
      const modalEditUserFirstName = document.querySelector('#modalEditUserFirstName');
      const password = document.querySelector('#password');

      // Limpar os campos do modal
      modalEditUserFirstName.value = '';
      password.value = '';
      modulos_usuarios.innerHTML = '';

      if (usuarioEmEdicao) {
         modal.classList.add('show');
         modal.style.display = 'block';
         modalEditUserFirstName.value = usuarioEmEdicao.username;
         password.value = usuarioEmEdicao.password;

         // Inserir módulos do usuário em edição
         await inserir_modulos_usuarios(usuarioEmEdicao);

         // Adiciona o evento de clique fora do modal
         adicionarEventoCliqueForaModal();
      } else {
         console.log('Usuário não encontrado: ', id_user);
      }
   } catch (error) {
      console.error('Erro ao obter informações do usuário: ', error);
   }
}

// Função de clique no botao remover
function clique_btn_remover(e) {
   const parentRow = e.closest('tr');
   const id_user = parentRow.getAttribute('id-user');

   // Verifica se o ID do usuário é valido
   if (id_user !== null) {
      if(confirm('Tem certeza que deseja remover o usuário?')) {
         // Chama a função para excluir usuário
         excluir_usuario(id_user);
      } else {
         console.error('ID do usuário não encontrado ou inválido');
      }
   }
}

// Função que exclui o usuário
async function excluir_usuario(id_user) {
   try {
      const response = await fetch(`/api/excluir-usuario/${id_user}`, {
         method: 'DELETE',
      });

      if (response.ok) {
         // Faça algo após a exclusão bem-sucedida
         await usuarios();
      } else {
         const errorResponse = await response.text();
         console.error('Erro ao excluir usuário: ', errorResponse);
      }
   } catch (error) {
      console.error('Erro ao excluir usuário: ', error)
   }
}

// Função auxiliar para fechar o modal e manipular os módulos
function fecharModalEModulos() {
   const modal = document.querySelector('#editUser');
   const modalContent = document.querySelector('.modal-edit-user');
   const modulosUsuarios = document.querySelector('.modulos-usuarios');

   modalContent.classList.remove('fade', 'show');
   modal.style.display = 'none';

   if (modulosUsuarios) {
       // Remove a classe 'selected' de todas as opções
       const options = modulosUsuarios.options;
       for (let i = 0; i < options.length; i++) {
           options[i].removeAttribute('selected');
       }
   }
}

// Função para manipular o clique fora do modal
function fecharModalAoClicarFora(event) {
   if (event.target === document.querySelector('#editUser')) {
       fecharModalEModulos();
   }
}

// Adiciona o evento de clique fora do modal quando o modal está visível
function adicionarEventoCliqueForaModal() {
   window.addEventListener('click', fecharModalAoClicarFora);
}

// Remove o evento de clique fora do modal quando o modal está fechado
function removerEventoCliqueForaModal() {
   window.removeEventListener('click', fecharModalAoClicarFora);
}

// Evento de clique no botão de fechar
const closeButton = document.querySelector('.btn-close');
closeButton.addEventListener('click', function() {
   fecharModalEModulos();
});

// Evento de clique no botão de cancelar
const cancelarButton = document.querySelector('.btn-cancelar');
cancelarButton.addEventListener('click', function() {
   fecharModalEModulos();
});

// Lista os usuarios do sistema
async function usuarios() {
   const response = await fetch('/api/usuarios');

   if (response.ok) {
      const data = await response.json();
      const usuarios = document.querySelector('.usuarios');

      // Limpa a tabela antes de adicionar os novos usuários
      usuarios.innerHTML = '';

      data.forEach(username => {
         const duas_primeiras_letras = username.username.slice(0, 2);
         const html_usuarios = `<tr id-user="${username.id}">
                                    <td class="sorting_1" colspan="2">
                                       <div class="d-flex justify-content-left align-items-center">
                                          <div class="avatar-wrapper">
                                             <div class="avatar me-2">
                                             <span class="avatar-initial rounded-circle" style="text-transform: uppercase; background-color: #ffcc005b !important; color: #2f74b5;">${duas_primeiras_letras}</span>
                                             </div>
                                          </div>
                                          <div class="d-flex flex-column">
                                             <span class="text-truncate fw-medium">${username.username}</span>
                                          </div>
                                       </div>
                                    </td>
                                    <td>
                                       <div class="d-inline-block" style="margin-left: 10px;">
                                          <a href="javascript:;" class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                             <i class="ti ti-dots-vertical"></i>
                                          </a>
                                          <div class="dropdown-menu dropdown-menu-end m-0">
                                             <a href="javascript:;" class="dropdown-item" onclick="clique_btn_editar(this)">Editar</a>
                                             <div class="dropdown-divider"></div>
                                             <a href="javascript:;" class="dropdown-item text-danger delete-record" onclick="clique_btn_remover(this)">Remover</a>
                                          </div>
                                       </div>
                                    </td>
                                 </tr>`;

         usuarios.innerHTML += html_usuarios;
      });
   } else {
      console.log('Erro na requisição:', response.status);
   }
}

// Evento de clique no botão "Salvar"
const btnSave = document.getElementById('btnSalvar');
btnSave.addEventListener('click', salvarUsuario);

// Função para obter o ID do usuário atual
function obterIdUsuarioAtual() {
   const parentRow = document.querySelector('.usuarios tr.selected'); // Adicionei a classe 'selected'
   if (parentRow) {
      return Number(parentRow.getAttribute('id-user'));
   } else {
      console.error('ID do usuário não encontrado');
      return null;
   }
}

// Função para enviar os dados do formulário ao backend
async function salvarUsuario() {
   try {
      const modalEditUserFirstName = document.getElementById('modalEditUserFirstName').value;
      const password = document.getElementById('password').value;
      const modulosUsuarios = document.querySelector('.modulos-usuarios');
      const selectedModules = Array.from(modulosUsuarios.selectedOptions).map(option => option.value);

      const id_user = obterIdUsuarioAtual();

      if (id_user !== null) {  // Verifica se o ID do usuário é válido
         const response = await fetch(`/api/atualizar-usuario/${id_user}`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id_user, username: modalEditUserFirstName, password, module: selectedModules }),
         });

         if (response.ok) {
            // Faça algo após a atualização bem-sucedida (talvez fechar o modal)
            fecharModalEModulos();
            // Recarregue a lista de usuários ou faça qualquer outra ação necessária
            await usuarios();
         } else {
            const errorResponse = await response.text();
            console.error('Erro ao salvar usuário:', errorResponse);
         }
      } else {
         console.error('ID do usuário não encontrado ou inválido');
      }
   } catch (error) {
      console.error('Erro ao salvar usuário:', error);
   }
}

// Adiciona estilos ao clicar no botao usuarios
function btn_usuarios(e) {
   const usuarios = document.querySelector('.btn_usuarios');
   const cadastrar = document.querySelector('.btn_cadastrar');

   // Remove os estilos do botão Usuarios
   cadastrar.style.backgroundColor = 'transparent';
   cadastrar.style.boxShadow = 'none';
   cadastrar.style.color = '#5d596c';
   cadastrar.classList.remove('active');

   // Adiciona os estilos no botão Cadastrar
   usuarios.style.backgroundColor = '#2F74B5'
   usuarios.style.color = '#FFF'
   usuarios.classList.add('active');
}


// Converter letras do username e password para minusculas
function converter_para_minusculas(inputElement) {
   const texto_minusc = inputElement.value.toLowerCase();
   inputElement.value = texto_minusc;
}

// Verifica se foi digitado espaços nos inputs
function verificar_espaços(inputElement) {
   const texto = inputElement.value;

   // Verifica se o texto contém espaços
   if (texto.includes(' ')) {
      inputElement.value = texto.replace(/\s/g, '') // Remove os espaços
   }
}

// Adicionar manipulador de eventos de entrada para o campo de username
const username_input = document.getElementById('modalEditUserFirstName');
username_input.addEventListener('input', function() {
   converter_para_minusculas(username_input)
   verificar_espaços(username_input)
})

// Adicionar manipulador de eventos de entrada para o campo de password
const password_input = document.getElementById('password');
password_input.addEventListener('input', function() {
   converter_para_minusculas(password_input)
   verificar_espaços(password_input)
})