function loading(estilo) {
   const loading = document.querySelector('.lds-ring');

   const display = loading.style.display = estilo;

   return display;
}

async function pagos(consulta_faturamento_pedido) {
   const soma_TOTALPAGO = consulta_faturamento_pedido.reduce((acumulador, elemento_atual) => {
      return acumulador + elemento_atual.TOTALPAGO
   }, 0);

   
   const text_pagos = document.getElementById('text-pagos');
   text_pagos.textContent = `-${parseFloat(soma_TOTALPAGO).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`;
}

async function recebidos(consulta_faturamento_pedido) {
   const soma_TOTALRECEBIDO = consulta_faturamento_pedido.reduce((acumulador, elemento_atual) => {
      return acumulador + elemento_atual.TOTALRECEBIDO
   }, 0);

   const text_pagos = document.getElementById('text-recebidos');
   text_pagos.textContent = `${parseFloat(soma_TOTALRECEBIDO).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`;
}

async function efetivo(consulta_faturamento_pedido) {
   // Total recebimento
   const soma_TOTALRECEBIDO = consulta_faturamento_pedido.reduce((acumulador, elemento_atual) => {
      return acumulador + elemento_atual.TOTALRECEBIDO
   }, 0);

   // Total pagamento
   const soma_TOTALPAGO = consulta_faturamento_pedido.reduce((acumulador, elemento_atual) => {
      return acumulador + elemento_atual.TOTALPAGO
   }, 0);

   const efetivo = soma_TOTALRECEBIDO - soma_TOTALPAGO
   
   const text_efetivo = document.getElementById('text-efetivo');
   text_efetivo.textContent = `${parseFloat(efetivo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`;
}

async function estimado(consulta_faturamento_pedido) {
   // Total recebimento
   const soma_TOTALREC = consulta_faturamento_pedido.reduce((acumulador, elemento_atual) => {
      return acumulador + elemento_atual.TOTALREC
   }, 0);

   // Total pagamento
   const soma_TOTALPG = consulta_faturamento_pedido.reduce((acumulador, elemento_atual) => {
      return acumulador + elemento_atual.TOTALPG
   }, 0);

   const estimado = soma_TOTALREC - soma_TOTALPG;
   
   const text_estimado = document.getElementById('text-estimado');
   text_estimado.textContent = `${parseFloat(estimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`;
}

// Objeto para armazenar os resultados por cliente
async function calcular_total_por_cliente(consulta_faturamento_pedido) {
   const resultados_por_cliente = {};

   consulta_faturamento_pedido.forEach(item => {
       const cliente = item.NOMCLI;
       const recebimento = item.TOTALRECEBIDO;
       const pagamento = item.TOTALPAGO;
       const lucro = recebimento - pagamento;

       // Verificar se o cliente já existe no objeto resultados_por_cliente
       if (resultados_por_cliente[cliente]) {
           // Se existir, acumular os valores
           resultados_por_cliente[cliente].totalRecebido += recebimento;
           resultados_por_cliente[cliente].totalPago += pagamento;
           resultados_por_cliente[cliente].lucro += lucro;
       } else {
           // Se não existir, criar um novo objeto para o cliente
           resultados_por_cliente[cliente] = {
               cliente: cliente,
               totalRecebido: recebimento,
               totalPago: pagamento,
               lucro: lucro
           };
       }
   });

   // Converter o objeto em um array de objetos
   const resultados = Object.values(resultados_por_cliente);

   // Inicializar o DataTable
   var table = $('#datatable_lucro_por_cliente').DataTable({
       "data": resultados,
       "columns": [
           { "data": "cliente" },
           { 
               "data": "totalRecebido",
               "className": "recebimento",
               "render": function (data, type, row) {
                   return `<span class="badge rounded bg-label-success" style="text-align: center;">${data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>`;
               }
           },
           { 
               "data": "totalPago",
               "className": "pagamento",
               "render": function (data, type, row) {
                   return `<span class="badge rounded bg-label-danger" style="text-align: center;">${data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>`;
               }
           },
           { 
               "data": "lucro",
               "className": "lucro",
               "render": function (data, type, row) {
                   return `<span class="badge rounded bg-label-primary" style="text-align: center;">${data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>`;
               }
           }
       ],
       "language": {
           url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json' // Tradução para o português do Brasil
       },
       "order": [[3, 'desc']]
   });
}


async function calcular_lucro_por_rota(consulta_faturamento_pedido) {
   const resultados_por_rota = {};

   consulta_faturamento_pedido.forEach(item => {
      const origem = `${item.CID_COLETA}${item.UF_COLETA}`;
      const destino = `${item.CID_ENTREGA}${item.UF_ENTREGA}`;
      const recebimento = item.TOTALRECEBIDO;
      const pagamento = item.TOTALPAGO;
      const lucro = recebimento - pagamento;

      // Verificar se a rota já existe no objeto resultados_por_rota
      if (resultados_por_rota[origem] && resultados_por_rota[origem][destino]) {
         // Se existir, acumular os valores
         resultados_por_rota[origem][destino].totalRecebido += recebimento;
         resultados_por_rota[origem][destino].totalPago += pagamento;
         resultados_por_rota[origem][destino].lucro += lucro;
      } else {
         // Se não existir, criar um novo objeto para a rota
         resultados_por_rota[origem] = resultados_por_rota[origem] || {};
         resultados_por_rota[origem][destino] = {
            origem: origem,
            destino: destino,
            totalRecebido: recebimento,
            totalPago: pagamento,
            lucro: lucro
         };
      }
   });

   // Converter o objeto em um array de objetos
   const resultados = Object.values(resultados_por_rota).flatMap(destinos => Object.values(destinos));

   // Inicializar o DataTable
   var table = $('#datatable_lucro_por_rota').DataTable({
       "data": resultados,
       "columns": [
           { "data": "origem" },
           { "data": "destino" },
           { 
               "data": "totalRecebido",
               "className": "recebimento",
               "render": function (data, type, row) {
                   return `<span class="badge rounded bg-label-success" style="text-align: center;">${data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>`;
               }
           },
           { 
               "data": "totalPago",
               "className": "pagamento",
               "render": function (data, type, row) {
                   return `<span class="badge rounded bg-label-danger" style="text-align: center;">${data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>`;
               }
           },
           { 
               "data": "lucro",
               "className": "lucro",
               "render": function (data, type, row) {
                   return `<span class="badge rounded bg-label-primary" style="text-align: center;">${data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>`;
               }
           }
       ],
       "language": {
           url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json' // Tradução para o português do Brasil
       },
       "order": [[4, 'desc']]
   });
}


// Função principal
async function main() {
   try {
      loading('flex'); // Seta display flex até que tudo esteja carregado
      const consulta_faturamento_pedido = await fetch('/api/faturamento-pedidos').then(response => response.json());

      await pagos(consulta_faturamento_pedido);
      await recebidos(consulta_faturamento_pedido);
      await efetivo(consulta_faturamento_pedido);
      await estimado(consulta_faturamento_pedido);
      await calcular_total_por_cliente(consulta_faturamento_pedido);
      await calcular_lucro_por_rota(consulta_faturamento_pedido);
      
      loading('none'); // Seta display none assim que tudo carregar
   } catch (error) {
      console.error('Erro ao obter dados da API:', error);
   }
}

main();