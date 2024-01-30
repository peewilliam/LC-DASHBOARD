function loading(estilo) {
   const loading = document.querySelector('.lds-ring');

   const display = loading.style.display = estilo;

   return display;
}

function obter_cores_por_status(status) {
   switch (status) {
      case 'CONCLUIDO':
         return { cor: 'bg-label-success'};
      case 'DOCUMENTOS_ENTREGUES':
         return { cor: 'bg-label-warning'};
      case 'DEVOLUÇÃO_DE_VAZIO':
         return { cor: 'bg-label-secondary'};
      case 'CNTR_VAZIO_AGENDADO':
         return { cor: 'bg-label-info'};
      case 'CANCELADO':
         return { cor: 'bg-label-danger'};
      default:
         return { cor: 'bg-label-dark'};
   }
}

function formatar_data(dataString) {
   const data = new Date(dataString);
   const dia = String(data.getDate()).padStart(2, '0');
   const mes = String(data.getMonth() + 1).padStart(2, '0');
   const ano = data.getFullYear();
   const horas = String(data.getHours()).padStart(2, '0');
   const minutos = String(data.getMinutes()).padStart(2, '0');
   return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

// ========== CARDS ========== //

// Função para inserir os cards em cada status
async function cards(consulta, id, filtro_status) {
   const status = document.getElementById(id);
   const pedidos_por_status = consulta.filter(pedido => 
      (pedido.STATUS && pedido.STATUS.trim().toUpperCase() === filtro_status.toUpperCase()) || 
      (!pedido.STATUS && filtro_status.toUpperCase() === 'SEM_STATUS'),
   );

   // Remove todos os cards existentes
   status.innerHTML = '';

   let htmlContent = '';

   for (let i = 0; i < pedidos_por_status.length; i++) {
      const item = pedidos_por_status[i];
   
      const { cor } = obter_cores_por_status(item.STATUS ? item.STATUS.trim().toUpperCase() : null);
      const data_formatada = item.DATA_FOLLOW ? formatar_data(item.DATA_FOLLOW) : '';

      const inserir_data = data_formatada ? `<span class="kanban-text" style="font-size: 12px;">Último Follow Enviado: ${data_formatada}</span>` : '';
   
      htmlContent += `<main class="kanban-drag" data-nomovtra="${item.NOMOVTRA}" data-bs-toggle="modal" data-bs-target="#createApp" onclick="dados_modal(this)">
                        <div class="kanban-item" style="min-height: 160px;max-height: 160px; cursor: pointer;">
                           <div class="d-flex justify-content-between flex-wrap align-items-center mb-2 pb-1">
                              <div class="item-badges">
                                 <div class="badge rounded-pill ${cor}">Pedido ${item.NOMOVTRA}</div>
                              </div>
                           </div>
                           <span class="kanban-text" style="max-width: 100% !important;overflow-x: hidden;text-wrap: nowrap;text-overflow: ellipsis;" title="${item.CLIENTE}">${item.CLIENTE}</span>
                           <span class="kanban-text" style="max-width: 100% !important;overflow-x: hidden;text-wrap: nowrap;text-overflow: ellipsis;">${item.CONTAINER}</span>
                           <div class="d-flex justify-content-start align-items-center flex-wrap mt-2 pt-1">
                              ${inserir_data}
                           </div>
                        </div>
                     </main>`;
   }
   
   // Adiciona novos cards sem remover os existentes
   status.insertAdjacentHTML('beforeend', htmlContent);
}

async function atualizarEstiloExibicao(data) {
   await cards(data, 'concluido', 'CONCLUIDO');
   await cards(data, 'doc_entregues', 'DOCUMENTOS_ENTREGUES');
   await cards(data, 'devolucao_vazio', 'DEVOLUÇÃO_DE_VAZIO');
   await cards(data, 'cntr_agendado', 'CNTR_VAZIO_AGENDADO');
   await cards(data, 'sem_status', 'SEM_STATUS');
   await cards(data, 'cancelado', 'CANCELADO');
}

// ========== FIM CARDS ========== //




// ========== MODAL ========== //

// Aguarde até que o documento esteja completamente carregado
document.addEventListener("DOMContentLoaded", function () {
   // Obtenha uma referência ao modal
   const modal = document.getElementById('createApp');
 
   // Adicionado um ouvinte de evento ao modal para detectar quando ele for fechado
   modal.addEventListener('hidden.bs.modal', function () {
     // Obtenha uma referência ao elemento de acordeão e oculte-o
     const acordeao = document.getElementById('fleet1');
     acordeao.classList.remove('show'); // Remova a classe 'show' para ocultar o acordeão

     // Altere as classes do ícone do acordeão
     const acordeaoButton = document.querySelector('.accordion-button.shadow-none');
     acordeaoButton.classList.add('collapsed');
     acordeaoButton.setAttribute('aria-expanded', 'false');

     // Limpe o conteúdo dos elementos do modal
     const modal_nomovtra = document.getElementById('modal-nomovtra');
     const modal_cliente = document.getElementById('modal-cliente');
     const modal_coleta = document.getElementById('modal-coleta');
     const modal_entrega = document.getElementById('modal-entrega');
     const modal_remetente = document.getElementById('modal-remetente');
     const modal_destinatario = document.getElementById('modal-destinatario');
     const modal_end_coleta = document.getElementById('modal-end-coleta');
     const modal_end_entrega = document.getElementById('modal-end-entrega');
     const modal_end_remetente = document.getElementById('modal-end-remetente');
     const modal_end_destinatario = document.getElementById('modal-end-destinatario');
     const modal_follow = document.getElementById('modal-follow');
     const modal_receita = document.getElementById('modal-receita');
     const modal_despesa = document.getElementById('modal-despesa');
     const modal_lucro = document.getElementById('modal-lucro');
 
     modal_nomovtra.textContent = '------ ---';
     modal_cliente.textContent = '-------------------';
     modal_coleta.textContent = '------------';
     modal_entrega.textContent = '------------';
     modal_remetente.textContent = '------------';
     modal_destinatario.textContent = '------------';
     modal_end_coleta.textContent = '------------';
     modal_end_entrega.textContent = '------------';
     modal_end_remetente.textContent = '------------';
     modal_end_destinatario.textContent = '------------';
     modal_receita.textContent = 'R$ ---,---'
     modal_despesa.textContent = 'R$ ---,---'
     modal_lucro.textContent = 'R$ ---,---'
     modal_follow.innerHTML = ''; // Limpe o conteúdo da lista de follow-ups
   });
});

// Função que captura o clique no cards, para inserir as informações no modal
async function dados_modal(elemento_clicado) {
   loading('flex'); // Seta display flex até que tudo esteja carregado

   // Obtém o valor do atributo nomovtra do card clicado
   const nomovtra = elemento_clicado.getAttribute('data-nomovtra');

   // Faz a consulta apenas no nomovtra clicado
   const consulta_modal = await fetch(`/api/pedidos-modal/${nomovtra}`).then(response => response.json());

   // Insere dados do pedido no modal
   const modal_nomovtra = document.getElementById('modal-nomovtra');
   const modal_cliente = document.getElementById('modal-cliente');
   const modal_coleta = document.getElementById('modal-coleta');
   const modal_entrega = document.getElementById('modal-entrega');
   const modal_remetente = document.getElementById('modal-remetente');
   const modal_destinatario = document.getElementById('modal-destinatario');
   const modal_end_coleta = document.getElementById('modal-end-coleta');
   const modal_end_entrega = document.getElementById('modal-end-entrega');
   const modal_end_remetente = document.getElementById('modal-end-remetente');
   const modal_end_destinatario = document.getElementById('modal-end-destinatario');
   const modal_receita = document.getElementById('modal-receita');
   const modal_despesa = document.getElementById('modal-despesa');
   const modal_lucro = document.getElementById('modal-lucro');

   modal_nomovtra.textContent = `Pedido ${consulta_modal[0].NOMOVTRA}`
   modal_cliente.textContent = consulta_modal[0].CLIENTE
   modal_coleta.textContent = consulta_modal[0].COLETA
   modal_entrega.textContent = consulta_modal[0].ENTREGA
   modal_remetente.textContent = consulta_modal[0].REMETENTE
   modal_destinatario.textContent = consulta_modal[0].DESTINATARIO
   modal_end_coleta.textContent = `${consulta_modal[0].CID_COLETA} / ${consulta_modal[0].UF_COLETA}`
   modal_end_entrega.textContent = `${consulta_modal[0].CID_ENTREGA} / ${consulta_modal[0].UF_ENTREGA}`
   modal_end_remetente.textContent = `${consulta_modal[0].CID_REMETENTE} / ${consulta_modal[0].UF_REMETENTE}`
   modal_end_destinatario.textContent = `${consulta_modal[0].CID_DESTINATARIO} / ${consulta_modal[0].UF_DESTINATARIO}`
   modal_receita.textContent = `${parseFloat(consulta_modal[0].TOTALFRETE).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`;
   modal_despesa.textContent = `-${parseFloat(consulta_modal[0].VLRMOT).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`;
   modal_lucro.textContent = `${parseFloat(consulta_modal[0].TOTALFRETE - consulta_modal[0].VLRMOT).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`
   // FIM Insere dados do pedido no modal

   const modal_follow = document.getElementById('modal-follow');
   modal_follow.innerHTML = '';

   
   // Insere Follow Up
   consulta_modal.forEach(element => {
      const data_formatada = formatar_data(element.DATA_FOLLOW);

      if (element.OBS_FOLLOW != null) {
         modal_follow.innerHTML += `<li class="timeline-item ms-1 ps-4 border-left-dashed">
                                       <span class="timeline-indicator-advanced timeline-indicator-primary border-0 shadow-none">
                                          <i class="ti ti-circle-check" style="background: none !important;"></i>
                                       </span>
                                       <div class="timeline-event ps-0 pb-0">
                                          <div class="timeline-header">
                                          <small class="text-primary text-uppercase fw-medium">${element.STATUS_FOLLOW}</small>
                                          </div>
                                          <h6 class="mb-1">${(element.OBS_FOLLOW).toString('utf-8')}</h6>
                                          <p class="text-muted mb-0">${data_formatada}</p>
                                       </div>
                                    </li>`
      }
   });
   // FIM Insere Follow Up

   loading('none'); // Seta display none assim que tudo carregar
}

// Atribua a função ao objeto window para torná-la global
window.dados_modal = dados_modal;

// ========== FIM MODAL ========== //




// ========== PESQUISA ========== //

async function realizarPesquisa() {
   const termoPesquisa = document.getElementById('inputPesquisar').value.toUpperCase();

   if (termoPesquisa.length >= 3) {
      loading('flex'); // Seta display flex até que tudo esteja carregado
      const response = await fetch(`/api/pedidos?search=${termoPesquisa}`).then(response => response.json());
      await atualizarEstiloExibicao(response.data);
      loading('none'); // Seta display none assim que tudo carregar

   } else if (termoPesquisa.length == 0){
      loading('flex'); // Seta display flex até que tudo esteja carregado
      const response = await fetch('/api/pedidos').then(response => response.json());
      await atualizarEstiloExibicao(response.data);
      loading('none'); // Seta display none assim que tudo carregar
   }
}

// Adicione um event listener ao campo de pesquisa
document.getElementById('inputPesquisar').addEventListener('keyup', function(event) {
   const value = document.getElementById('inputPesquisar').value;
   if (event.keyCode == 13 || value.length === 0) {
      realizarPesquisa();
   }
});

// ========== FIM PESQUISA ========== //




async function main() {
   try {
      loading('flex'); // Seta display flex até que tudo esteja carregado

      const response = await fetch('/api/pedidos').then(response => response.json());
      await atualizarEstiloExibicao(response.data);

      loading('none'); // Seta display none assim que tudo carregar
   } catch (error) {
      console.error('Erro ao obter dados da API:', error);
   }
}

await main();