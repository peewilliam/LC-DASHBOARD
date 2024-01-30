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



// Fecth para puxar a consulta da rota/banco
function Thefetch(url, method, options = {}) { // Função Thefetch com 3 parâmetros: url, method e options (este último com valor padrão de objeto vazio)
   return new Promise((resolve, reject) => { // Retorna uma nova Promise com duas funções de callback: resolve e reject
     fetch(url, { // Chama a função fetch com a url passada como parâmetro e um objeto contendo o método e um objeto headers com o tipo de conteúdo
       method: method, // Método HTTP passado como parâmetro
       headers: {'Content-Type': 'application/json'}, // Tipo de conteúdo: JSON
       ...options // Opções adicionais passadas como objeto no terceiro parâmetro (se existirem)
     })
       .then(response => response.json()) // Se a Promise for resolvida, transforma a resposta em JSON
       .then(data => resolve(data)) // Se a conversão para JSON for bem sucedida, chama a função de callback resolve com os dados
       .catch(error => reject(error)); // Se ocorrer algum erro, chama a função de callback reject com o erro
   });
}