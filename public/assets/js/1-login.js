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