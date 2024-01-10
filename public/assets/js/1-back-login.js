const dataUser = localStorage.getItem('dataUser');

// Verifique se o usuário está na página de login antes de redirecionar
if (!dataUser && window.location.pathname !== "/") {
   window.location.href = "/";
} else if (dataUser && window.location.pathname === "/") {
   // Redirecione para outra página se o usuário estiver logado e na página de login
   window.location.href = "/pedidos";
} else if (!dataUser && window.location.pathname === "/pedidos") {
   // Redirecione para a página de login se o usuário não estiver logado e na página de pedidos
   window.location.href = "/";
}
// Adicione outras condições conforme necessário para mais redirecionamentos
