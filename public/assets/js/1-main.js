// Verifica os modulos, se o usuario tiver acesso da display block, senao remove a div
function checkModules() {
   const modules = JSON.parse(localStorage.getItem('modules'));

   if (modules) {
      document.querySelectorAll('[module]').forEach(div => {
      const moduleNumber = parseInt(div.getAttribute('module'));
         if(!modules.includes(moduleNumber)) {
            div.remove()
         } else {
            div.style.display = 'block'
         }
      })
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

      // Redirecione para a página principal (ou qualquer outra página que você deseja)
      window.location.href = 'dashboard';
   } else {
      const error = await response.json();
      alert(error.message);

      window.location.href = '/';
   }

   return false; // Impede a submissão padrão do formulário
}
