// Inserir nome do usuário logado
function inserir_nome() {
   const user_name = localStorage.getItem('dataUser');
   const nome_html = document.querySelector('.nome_html');

   nome_html.textContent = user_name;
}

// Verifica os módulos, se o usuário tiver acesso, exibe a div, senão remove a div
function checkModules() {
   const modules = JSON.parse(localStorage.getItem('modules'));

   if (modules) {
      document.querySelectorAll('[module]').forEach(div => {
         const module = div.getAttribute('module');
         if (!modules.includes(module)) {
            div.remove();
         } else {
            div.style.display = 'block';
         }
      });
   }
}

window.addEventListener('load', function () {
   checkModules();
   inserir_nome();
});


// Função de Login
async function login() {
   event.preventDefault(); // Impede a submissão padrão do formulário

   const name = document.getElementById('name').value;
   const password = document.getElementById('password').value;

   // Faça uma solicitação para o servidor
   const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, password }),
   });

   // Verifique a resposta do servidor
   if (response.ok) {
      const { modules } = await response.json();

      // Armazene no localstorage os módulos do usuário logado
      localStorage.setItem('modules', JSON.stringify(modules));
      // Armazene no localstorage o nome do usuário logado
      localStorage.setItem('dataUser', name);

      // Verifica e redireciona para a primeira tela acessível
      await redirecionar_usuario(modules);
   } else {
      const error = await response.json();
      alert(error.message);

      window.location.href = '/';
   }

   return false; // Impede a submissão padrão do formulário
}

// Obtem os modulos do sistema
async function obter_modulos() {
   const response = await fetch('/api/modulos');

   if(response.ok) {
      const data = await response.json();
      return data ? data.module : []
   } else {
      console.log('Erro ao carregar modulos');
      return [];
   }
}

// Quando o usuario fizer login vai redirecionar ele para o primeiro modulo que tem acesso, se não tiver, ele vai para um tela de erro 401
async function redirecionar_usuario(modules) {
   const modulos_disponiveis = await obter_modulos(); // Inserir os módulos disponíveis

   const primeiro_modulo_acessivel = modulos_disponiveis.find(module => modules.includes(module));

   if (primeiro_modulo_acessivel) {
      window.location.replace(`/${primeiro_modulo_acessivel}`);
   } else {
      // Se nenhum módulo estiver acessível, redirecione para a página de módulos não disponibilizados
      window.location.replace('/401-error');
      // Limpa o localStorage
      localStorage.clear();
   }
}

function deslogar(e) {
   // Limpar o localStorage
   localStorage.clear();
   window.location.replace('/');
}

// Abre as informações do usuario para edição
function info_usuarios(e) {
   // Navegue pelo DOM para acessar outras partes do HTML
   const parentRow = e.closest('tr'); // Acessar o element pai da div clicada
   const usernameElement = parentRow.querySelector('.text-truncate'); // Pega o nome do usuário

   // Pegando o nome do usuário
   const username = usernameElement.textContent.trim();

   console.log(username);
}

// Lista os usuarios do sistema
async function usuarios() {
   const response = await fetch('/api/usuarios');

   if (response.ok) {
      const data = await response.json();
      const usuarios = document.querySelector('.usuarios');

      data.forEach(username => {
         const duas_primeiras_letras = username.slice(0, 2);
         const html_usuarios = `<tr>
                                    <td class="sorting_1" colspan="2">
                                       <div class="d-flex justify-content-left align-items-center">
                                          <div class="avatar-wrapper">
                                             <div class="avatar me-2">
                                             <span class="avatar-initial rounded-circle" style="text-transform: uppercase; background-color: #ffcc005b !important; color: #2f74b5;">${duas_primeiras_letras}</span>
                                             </div>
                                          </div>
                                          <div class="d-flex flex-column">
                                             <span class="text-truncate fw-medium">${username}</span>
                                          </div>
                                       </div>
                                    </td>
                                    <td>
                                       <div class="d-inline-block" style="margin-left: 10px;">
                                          <a href="javascript:;" class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                             <i class="ti ti-dots-vertical"></i>
                                          </a>
                                          <div class="dropdown-menu dropdown-menu-end m-0">
                                             <a href="javascript:;" class="dropdown-item" onclick="info_usuarios(this)">Editar</a>
                                             <div class="dropdown-divider"></div>
                                             <a href="javascript:;" class="dropdown-item text-danger delete-record">Remover</a>
                                          </div>
                                       </div>
                                    </td>
                                 </tr>`


         usuarios.innerHTML += html_usuarios;
      });
   } else {
      console.log('Erro na requisição:', response.status)
   }
}

function cadastrar() {
   const usuarios = document.querySelector('.btn_usuarios');
   const cadastrar = document.querySelector('.btn_cadastrar');

   cadastrar.addEventListener('click', function (e) {
      e.preventDefault();

      // Remove os estilos do botão Usuarios
      usuarios.style.backgroundColor = 'transparent';
      usuarios.style.boxShadow = 'none';
      usuarios.style.color = '#5d596c';
      usuarios.classList.remove('active');

      // Adiciona os estilos no botão Cadastrar
      cadastrar.style.backgroundColor = '#2F74B5'
      cadastrar.style.color = '#FFF'
      cadastrar.classList.add('active');


   })
}


// Fecha o modal
document.addEventListener('DOMContentLoaded', function() {
   const modal = document.querySelector('#editUser');
   const modalContent = document.querySelector('.modal-edit-user');
   const closeButton = document.querySelector('.btn-close');
   const cancelarButton = document.querySelector('.btn-cancelar');

   // Adiciona o evento de clique fora do modal
   window.addEventListener('click', function(event) {
      if(event.target === modal) {
         modalContent.classList.remove('fade', 'show');
         modal.style.display = 'none'
      }
   });

   // Adiciona o evento de clique fora do modal
   closeButton.addEventListener('click', function() {
      modalContent.classList.remove('fade', 'show');
      modal.style.display = 'none'
   });

   // Adiciona o evento de clique fora do modal
   cancelarButton.addEventListener('click', function() {
      modalContent.classList.remove('fade', 'show');
      modal.style.display = 'none'
   });
})