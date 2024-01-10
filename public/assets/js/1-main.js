// Inserir nome do usuário logado
function inserir_nome() {
   const user_name = localStorage.getItem('dataUser');
   const nome_html = document.querySelector('.nome_html');

   nome_html.textContent = user_name;
}

inserir_nome()

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

window.addEventListener('load', checkModules);



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
      redirecionar_usuario(modules);
   } else {
      const error = await response.json();
      alert(error.message);

      window.location.href = '/';
   }

   return false; // Impede a submissão padrão do formulário
}

function redirecionar_usuario(modules) {
   const modulos_disponiveis = ["pedidos", "financeiro"]; // Inserir os modulos disponiveis

   const primeiro_modulo_acessivel = modulos_disponiveis.find(module => modules.includes(module));

   if (primeiro_modulo_acessivel) {
      window.location.href = `${primeiro_modulo_acessivel}`;
   } else {
      // Se nenhum módulo estiver acessivel, redirecione para a pagina de modulos nao disponibilizados
      window.location.href = 'sem-modulo'
   }
}