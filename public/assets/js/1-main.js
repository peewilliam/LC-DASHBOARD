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

// Função deslogar
function deslogar(e) {
   // Limpar o localStorage
   localStorage.clear();
   window.location.replace('/');
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

// Executa algumas funções ao carregar a página
window.addEventListener('load', function () {
   checkModules();
   inserir_nome();
});