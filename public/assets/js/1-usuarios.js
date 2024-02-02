// Função para verificar se a URL contém "/usuarios"
function pagina_usuarios() {
   return window.location.pathname.includes('/usuarios');
}

// Lista os usuarios do sistema
async function usuarios() {
   const response = await fetch('/api/usuarios');

   if (response.ok) {
      try {
         const responseData = await response.json();

         // Verifica se existe o item data para inserir os dados na função
         if (responseData) {
            atualizarTabelaUsuarios(responseData);
            
         }

      } catch (error) {
         console.error('Erro ao processar os dados:', error);
      }
      
   } else {
      console.log('Erro na requisição:', response.status);
   }
}

// Função para atualizar a tabela de usuários na interface
function atualizarTabelaUsuarios(data) {
   const usuarios = document.querySelector('.usuarios');

   // Limpa a tabela antes de adicionar os novos usuários
   usuarios.innerHTML = '';

   data.forEach(username => {
      const duas_primeiras_letras = username.username.slice(0, 2);
      const html_usuarios = `<tr id-user="${username.id}" class="item-usuario">
                                 <td class="sorting_1" colspan="2">
                                    <div class="d-flex justify-content-left align-items-center">
                                       <div class="avatar-wrapper">
                                          <div class="avatar me-2">
                                             <span class="avatar-initial rounded-circle" style="text-transform: uppercase; background-color: #ffcc005b !important; color: #2f74b5;">${duas_primeiras_letras}</span>
                                          </div>
                                       </div>
                                       <div class="d-flex flex-column">
                                          <span class="text-truncate fw-medium">${username.username}</span>
                                          <span style="display: none;">${JSON.stringify(username)}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td>
                                    <div class="d-inline-block" style="margin-left: 10px;">
                                       <a href="javascript:;" class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                          <i class="ti ti-dots-vertical"></i>
                                       </a>
                                       <div class="dropdown-menu dropdown-menu-end m-0">
                                          <button type="button" class="waves-effect waves-light dropdown-item" data-bs-toggle="modal" data-bs-target="#editUser" onclick="clique_btn_editar(this)"> Editar </button>
                                          <div class="dropdown-divider"></div>
                                          <button type="button" class="waves-effect waves-light dropdown-item text-danger delete-record" 
                                          onclick="clique_btn_remover(this)"> Remover </button>
                                       </div>
                                    </div>
                                 </td>
                              </tr>`;

      usuarios.innerHTML += html_usuarios;
   });
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



/* ========== EDITAR ========== */

// Inserir modulos no campo de seleção de modulos no usuario
async function inserir_modulos_usuarios_modal_editar(usuario) {
   // Verifica se a URL é /usuarios
   if (pagina_usuarios()) {
      const modulos = await obter_modulos();
      const modulos_usuarios = $(document.querySelector('.modulos-usuarios-modal-editar'));

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

// Função assíncrona para obter informações do usuário com base no ID
async function obter_dados_usuarios(id) {
   const response = await fetch('/api/usuarios');
   const responseData = await response.json();

   // Verifica se existe o item data para inserir os dados na função
   if(responseData) {
      const usuarioEncontrado = responseData.find(user => user.id === id);

      if (usuarioEncontrado) {
         return usuarioEncontrado;
      } else {
         console.error('Usuário não encontrado com o ID:', id);
         return null;
      }
   } else {
      console.error('Erro ao processar os dados:', responseData);
      return null;
   }
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
      const modal = document.querySelector('.modal-editar');
      const modulos_usuarios = document.querySelector('.modulos-usuarios-modal-editar');
      const modalEditUserFirstName = document.querySelector('#modalEditUserFirstName');
      const password = document.querySelector('#password-modal-editar');

      // Limpar os campos do modal
      modalEditUserFirstName.value = '';
      password.value = '';
      modulos_usuarios.innerHTML = '';

      if (usuarioEmEdicao) {
         // modal.style.display = 'block';
         // modal.classList.add('show');
         modalEditUserFirstName.value = usuarioEmEdicao.username;
         password.value = usuarioEmEdicao.password;

         // Inserir módulos do usuário em edição
         await inserir_modulos_usuarios_modal_editar(usuarioEmEdicao);

         // Adiciona o evento de clique fora do modal
         clique_fora_modal_editar();
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
function fechar_modal_editar() {
   const modal = document.querySelector('#editUser');
   const modalContent = document.querySelector('.modal-editar');
   const modulosUsuarios = document.querySelector('.modulos-usuarios-modal-editar');

   // modalContent.classList.remove('show');
   // modal.style.display = 'none';

   if (modulosUsuarios) {
       // Remove a classe 'selected' de todas as opções
       const options = modulosUsuarios.options;
       for (let i = 0; i < options.length; i++) {
           options[i].removeAttribute('selected');
       }
   }
}

// Função para manipular o clique fora do modal
function fechar_modal_clicar_fora_editar(event) {
   if (event.target === document.querySelector('#editUser')) {
      fechar_modal_editar();
   }
}

// Adiciona o evento de clique fora do modal quando o modal está visível
function clique_fora_modal_editar() {
   window.addEventListener('click', fechar_modal_clicar_fora_editar);
}

// Remove o evento de clique fora do modal quando o modal está fechado
function remover_evento_clique_fora_modal_editar() {
   window.removeEventListener('click', fechar_modal_clicar_fora_editar);
}

// Evento de clique no botão de fechar
const closeButton = document.querySelector('.btn-close-modal-editar');
closeButton.addEventListener('click', function() {
   fechar_modal_editar();
});

// Evento de clique no botão de cancelar
const cancelarButton = document.querySelector('.btn-cancelar-modal-editar');
cancelarButton.addEventListener('click', function() {
   fechar_modal_editar();
});

// Evento de clique no botão "Salvar"
const btnSave = document.getElementById('btnSalvar-modal-editar');
btnSave.addEventListener('click', salvar_usuario_editar);

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
async function salvar_usuario_editar() {
   try {
      const modalEditUserFirstName = document.getElementById('modalEditUserFirstName').value;
      const password = document.getElementById('password-modal-editar').value;
      const modulosUsuarios = document.querySelector('.modulos-usuarios-modal-editar');
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
            // Após salvar no banco, fecha o modal
            fechar_modal_editar();
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

// Adicionar manipulador de eventos de entrada para o campo de username
const username_input = document.getElementById('modalEditUserFirstName');
username_input.addEventListener('input', function() {
   converter_para_minusculas(username_input)
   verificar_espaços(username_input)
})

/* ========== FIM EDITAR ========== */




/* ========== INSERIR ========== */
// Inserir modulos no campo de seleção de modulos no usuario
async function inserir_modulos_usuarios_modal_inserir() {
   // Verifica se a URL é /usuarios
   if (pagina_usuarios()) {
      const modulos = await obter_modulos();
      const modulos_usuarios = $(document.querySelector('.modulos-usuarios-modal-inserir'));

      // Limpa o conteúdo atual antes de adicionar novas opções
      modulos_usuarios.empty().trigger('change');

      modulos.forEach(modulo => {
         var newOption = new Option(modulo, modulo, false);
         modulos_usuarios.append(newOption).trigger('change');
      });
   }
}

// Adiciona estilos ao clicar no botao usuarios
async function btn_cadastrar(e) {
   const usuarios = document.querySelector('.btn_usuarios');
   const cadastrar = document.querySelector('.btn_cadastrar');

   // Remove os estilos do botão Usuarios
   usuarios.style.backgroundColor = 'transparent';
   usuarios.style.boxShadow = 'none';
   usuarios.style.color = '#5d596c';
   usuarios.classList.remove('active');

   // Adiciona os estilos no botão Cadastrar
   cadastrar.style.backgroundColor = '#2F74B5'
   cadastrar.style.color = '#FFF'
   cadastrar.classList.add('active');

   // modal
   const modal = document.querySelector('.modal-inserir');
   const modulos_usuarios = document.querySelector('.modulos-usuarios-modal-inserir');
   const modalEditUserFirstName = document.querySelector('#modalInsertUserFirstName');
   const password = document.querySelector('#password-modal-inserir');

   // Limpar os campos do modal
   modalEditUserFirstName.value = '';
   password.value = '';
   modulos_usuarios.innerHTML = '';

   // modal.classList.add('show');
   // modal.style.display = 'block';

   await inserir_modulos_usuarios_modal_inserir();


   // Fecha o modal ao clicar fora dele
   clique_fora_modal_inserir();
}

// Botao para salvar/criar novo usuario
async function salvar_usuario_inserir() {
   const usernameInputInserir = document.getElementById('modalInsertUserFirstName');
   const passwordInputInserir = document.getElementById('password-modal-inserir');
   const modulosInputInserir = document.querySelector('.modulos-usuarios-modal-inserir');

   const nome_usuario = usernameInputInserir.value;
   const senha = passwordInputInserir.value;
   const modulos_selecionados = Array.from(modulosInputInserir.selectedOptions).map(option => option.value);

   const dados_usuarios = {
      username: nome_usuario,
      password: senha,
      module: modulos_selecionados
   };

   try {
      const response = await fetch('/api/inserir-usuario', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(dados_usuarios)
      });

      if (response.ok) {
         // Faça algo após a atualização bem-sucedida (talvez fechar o modal)
         fechar_modal_inserir();
         // Recarregue a lista de usuários ou faça qualquer outra ação necessária
         await usuarios();
      } else {
         console.error('Erro ao inserir usuário');
      }
   } catch (erro) {
      console.error('Erro ao enviar requisição: ', erro);
   }
}

const usernameInputInserir = document.getElementById('modalInsertUserFirstName');
const passwordInputInserir = document.getElementById('password-modal-inserir');
const btnSaveInserir = document.getElementById('btnSalvar-modal-inserir');

// Adiciona manipuladores de eventos para os campos de entrada relevantes
usernameInputInserir.addEventListener('input', verificarCampos);
passwordInputInserir.addEventListener('input', verificarCampos);

// Função para verificar os campos e habilitar/desabilitar o botão "Salvar"
function verificarCampos() {
   const nome_usuario = usernameInputInserir.value;
   const senha = passwordInputInserir.value;
   
   if (nome_usuario.trim().length >= 4 && senha.trim().length >= 4) {
      btnSaveInserir.disabled = false; // Habilita o botão
   } else {
      btnSaveInserir.disabled = true; // Desabilita o botão
   }
}


// Evento de clique no botão "Salvar"
btnSaveInserir.addEventListener('click', salvar_usuario_inserir);


// Função auxiliar para fechar o modal e manipular os módulos
function fechar_modal_inserir() {
   const modal_inserir = document.querySelector('.modal-inserir.show')
   const modulosUsuarios = document.querySelector('.modulos-usuarios-modal-inserir');

   const usuarios = document.querySelector('.btn_usuarios');
   const cadastrar = document.querySelector('.btn_cadastrar');

   // Campos Inputs
   const modalInsertUserFirstName = document.querySelector('#modalInsertUserFirstName');
   const password_modal_inserir = document.querySelector('#password-modal-inserir');
   const btnSaveInserir = document.getElementById('btnSalvar-modal-inserir');

   if (!modal_inserir) {
      // Remove os estilos do botão Usuarios
      cadastrar.style.backgroundColor = 'transparent';
      cadastrar.style.boxShadow = 'none';
      cadastrar.style.color = '#5d596c';
      cadastrar.classList.remove('active');

      // Adiciona os estilos no botão Cadastrar
      usuarios.style.backgroundColor = '#2F74B5'
      usuarios.style.color = '#FFF'
      usuarios.classList.add('active');

      modalInsertUserFirstName.value = '';
      password_modal_inserir.value = '';
      btnSaveInserir.setAttribute('disabled', 'true')

      if (modulosUsuarios) {
         // Remove a classe 'selected' de todas as opções
         const options = modulosUsuarios.options;
         for (let i = 0; i < options.length; i++) {
            options[i].removeAttribute('selected');
         }
      }
   }
}

// Função para manipular o clique fora do modal
function fechar_modal_clicar_fora_inserir(event) {
   if (event.target === document.querySelector('#insertUser')) {
      fechar_modal_inserir();
   }
}

// Adiciona o evento de clique fora do modal quando o modal está visível
function clique_fora_modal_inserir() {
   window.addEventListener('click', fechar_modal_clicar_fora_inserir);
}

// Remove o evento de clique fora do modal quando o modal está fechado
function remover_evento_clique_fora_modal_inserir() {
   window.removeEventListener('click', fechar_modal_clicar_fora_inserir);
}

// Evento de clique no botão de fechar
const closeButtonInserir = document.querySelector('.btn-close-modal-inserir');
closeButtonInserir.addEventListener('click', function() {
   fechar_modal_inserir();
});

// Evento de clique no botão de cancelar
const cancelarButtonInserir = document.querySelector('.btn-cancelar-modal-inserir');
cancelarButtonInserir.addEventListener('click', function() {
   fechar_modal_inserir();
});

// Adicionar manipulador de eventos de entrada para o campo de username
const username_input_inserir = document.getElementById('modalInsertUserFirstName');
username_input_inserir.addEventListener('input', function() {
   converter_para_minusculas(username_input_inserir)
   verificar_espaços(username_input_inserir)
})

/* ========== FIM INSERIR ========== */




// ========== PESQUISA ========== //

function search(e){
   var termoPesquisa = e.value.toLowerCase(); // Obtém o valor do input em minúsculas

   // Itera sobre os itens da lista e mostra/oculta com base no termo de pesquisa
   var listaItems = document.querySelectorAll('.usuarios tr');
   listaItems.forEach(function(item) {
      var textoItem = item.textContent.toLowerCase();

      // Verifica se o texto do item contém o termo de pesquisa
      if (textoItem.includes(termoPesquisa)) {
         item.style.display = 'table-row'; // Mostra o item
      } else {
         item.style.display = 'none'; // Oculta o item
      }
   });
}

// ========== FIM PESQUISA ========== //
