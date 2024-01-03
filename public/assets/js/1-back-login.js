const dataUser = localStorage.getItem('dataUser');

// Verifique se o usuário está na página de login antes de redirecionar
if (!dataUser && window.location.pathname !== "/") {
   window.location.href = "/";
} else if (dataUser && window.location.pathname !== "/dashboard") {
   window.location.href = "/dashboard";
}
