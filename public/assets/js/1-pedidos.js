function loading(estilo) {
   const loading = document.querySelector('.lds-ring');

   const display = loading.style.display = estilo;

   return display;
}

function cor_por_status(consulta, cor) {
   const colors = [];

   for (let i = 0; i < consulta.length; i++) {
       // Use a cor passada como argumento em vez de buscar em consulta[i].COLOR
       const cores = cor;

      // Mapeamento de cores nomeadas para valores RGBA
      const colorMap = {
         clBlack: '#000000',
         clMaroon: '#800000',
         clGreen: '#008000',
         clOlive: '#008000',
         clNavy: '#000080',
         clPurple: '#800080',
         clTeal: '#008080',
         clGray: '#808080',
         clSilver: '#C0C0C0',
         clRed: '#FF0000',
         clLime: '#00FF00',
         clYellow: '#ffbb00',
         clBlue: '#0000FF',
         clFuchsia: '#FF00FF',
         clAqua: '#00FFFF',
         clWhite: '#FFFFFF',
         clMoneyGreen: '#C0DCC0',
         clSkyBlue: '#87CEEB',
         clCream: '#FFFDD0',
         clMedGray: '#A4A0A0',
         clNone: '#000000',
         clActiveBorder: '#B4B4B4',
         clActiveCaption: '#99B4D1',
         clAppWorkSpace: '#ABABAB',
         clBackground: '#000000',
         clBtnFace: '#F0F0F0',
         clBtnHighlight: '#FFFFFF',
         clBtnShadow: '#A0A0A0',
         clBtnText: '#000000',
         clCaptionText: '#000000',
         clDefault: '#000000',
         clGradientActiveCaption: '#B9D1EA',
         clGradientInactiveCaption: '#D7E4F2',
         clGrayText: '#6D6D6D',
         clHighlight: '#0078D7',
         clHighlightText: '#FFFFFF',
         clHotLight: '#0066CC',
         clInactiveBorder: '#F4F7FC',
         clInactiveCaption: '#BFCDDB',
         clInactiveCaptionText: '#000000',
         clInfoBk: '#FFFFE1',
         clInfoText: '#000000',
         clMenu: '#F0F0F0',
         clMenuBar: '#F0F0F0',
         clMenuHighlight: '#3399FF',
         clMenuText: '#000000',
         clScrollBar: '#C8C8C8',
         cl3DDkShadow: '#696969',
         cl3DLight: '#E3E3E3',
         clWindow: '#FFFFFF',
         clWindowFrame: '#646464',
         clWindowText: '#000000',
      };
       
      // Obtém o valor RGBA correspondente da cor mapeada
      const cor_sem_opacidade = hex(colorMap[cores], '');
      const cor_com_opacidade = hex(colorMap[cores], '22');
      colors.push({
         backgroundColor: cor_com_opacidade,
         textColor: cor_sem_opacidade
      });
   }

   return colors;
}

// Função para obter o formato RGBA a partir de uma cor e opacidade
function hex(hexValue, opacity) {
   if (!hexValue) {
     return `#000000${opacity}`; // Retorna preto se a cor não for encontrada
   }
 
   return `${hexValue}${opacity}`;
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
async function status_frete(consulta) {
   const kanban_container = document.querySelector('.kanban-container');

   let htmlContent = '';

   for (let i = 0; i < consulta.length; i++) {
      const status = consulta[i].NOMSTATUSFRE.replace(/\s/g, '').toLowerCase();
      const nomeStatus = consulta[i].NOMSTATUSFRE.charAt(0).toUpperCase() + consulta[i].NOMSTATUSFRE.slice(1).toLowerCase();

      htmlContent += `
         <div data-id="board-in-progress" data-order="1" class="kanban-board" style="min-width: 254px; margin-left: 15px; margin-right: 15px;">
               <header class="kanban-board-header" style="display: flex; flex-direction: column; align-items: flex-start;">
                  <div class="kanban-title-board">${nomeStatus}</div>
                  <div id="${status}" style="display: flex; flex-direction: column-reverse;"></div>
               </header>
         </div>
      `;
   }

   kanban_container.innerHTML = htmlContent;
}

// Função para inserir os cards em cada status
async function cards(consulta, status_html, cor) {
   const status = document.getElementById(status_html);

   // Remove todos os cards existentes
   status.innerHTML = '';

   let htmlContent = '';

   // Obtém as informações de cor para cada status
   const cores = cor_por_status(consulta, cor);

   for (let i = 0; i < consulta.length; i++) {
      const item = consulta[i];

      const all_string = JSON.stringify(item)

      const { backgroundColor, textColor } = cores[i];
      const data_formatada = item.DATA_FOLLOW ? formatar_data(item.DATA_FOLLOW) : '';

      const inserir_data = data_formatada ? `<span class="kanban-text" style="font-size: 12px;">Último Follow Enviado: ${data_formatada}</span>` : '';

      htmlContent += `<main class="kanban-drag" data-nomovtra="${item.NOMOVTRA}" data-bs-toggle="modal" data-bs-target="#createApp" onclick="dados_modal(this)">
                        <div class="kanban-item" style="min-height: 160px;max-height: 160px; cursor: pointer;">
                           <span style="display: none;">${all_string}</span>
                           <div class="d-flex justify-content-between flex-wrap align-items-center mb-2 pb-1">
                              <div class="item-badges" style="background-color: ${backgroundColor}; border-radius: 4px !important;">
                                 <div class="badge rounded-pill" style="color: ${textColor}">Pedido ${item.NOMOVTRA}</div>
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
     const modal_follow = document.getElementById('acordeao_modal_follow');
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
     modal_receita ? modal_receita.textContent = 'R$ ---,---' : '';
     modal_despesa ? modal_despesa.textContent = 'R$ ---,---'  : '';
     modal_lucro ?  modal_lucro.textContent = 'R$ ---,---'  : '';
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
   modal_receita ? modal_receita.textContent = `${parseFloat(consulta_modal[0].TOTALREC).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}` : '';
   modal_despesa ? modal_despesa.textContent = `-${parseFloat(consulta_modal[0].TOTALPG).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}` : '';
   modal_lucro ? modal_lucro.textContent = `${parseFloat(consulta_modal[0].TOTALREC - consulta_modal[0].TOTALPG).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`  : ''
   // FIM Insere dados do pedido no modal

   const acordeao_modal_carga = document.getElementById('acordeao_modal_carga');
   const acordeao_modal_follow = document.getElementById('acordeao_modal_follow');
   acordeao_modal_carga.innerHTML = '';
   acordeao_modal_follow.innerHTML = '';
   
   acordeao_modal_carga.innerHTML += `<li class="row timeline-item ms-1 ps-3" style="display: flex; border-left: none !important;">
                                          <div class="col-12 col-lg-6 px-3">
                                             <div class="timeline-event ps-3 pb-0">
                                                <div class="timeline-header">
                                                   <small class="text-primary text-uppercase fw-medium">CAVALO: <span style="color: var(--bs-heading-color);">${consulta_modal[0].PLACACAV}</span></small>
                                                </div>
                                                <div class="timeline-header">
                                                   <small class="text-primary text-uppercase fw-medium">CARRETA 1: <span style="color: var(--bs-heading-color);">${consulta_modal[0].PLACACAR}</span></small>
                                                </div>
                                                <div class="timeline-header">
                                                   <small class="text-primary text-uppercase fw-medium">CARRETA 2: <span style="color: var(--bs-heading-color);">${consulta_modal[0].PLACACAR2}</span></small>
                                                </div>
                                             </div>
                                          </div>

                                          <div class="col-12 col-lg-6 px-3">
                                             <div class="timeline-event ps-3 pb-0">
                                                <div class="timeline-header">
                                                   <small class="text-primary text-uppercase fw-medium">CONTRATO FRETE: <span style="color: var(--bs-heading-color);">${consulta_modal[0].NOTAC}</span></small>
                                                </div>
                                                <div class="timeline-header">
                                                   <small class="text-primary text-uppercase fw-medium">MOTORISTA: <span style="color: var(--bs-heading-color);">${consulta_modal[0].MOTORISTA}</span></small>
                                                </div>
                                                <div class="timeline-header">
                                                   <small class="text-primary text-uppercase fw-medium">PROPRIETÁRIO: <span style="color: var(--bs-heading-color);">${consulta_modal[0].PROPRIETARIO}</span></small>
                                                </div>
                                             </div>
                                          </div>
                                       </li>`

   // Insere Follow Up
   consulta_modal.forEach(element => {
      const data_formatada = formatar_data(element.DATA_FOLLOW);

      if (element.OBS_FOLLOW != null) {
         acordeao_modal_follow.innerHTML += `<li class="timeline-item ms-1 ps-4 border-left-dashed">
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
function search(e){
   var termoPesquisa = e.value.toLowerCase(); // Obtém o valor do input em minúsculas
   // Itera sobre os itens da lista e mostra/oculta com base no termo de pesquisa
   var listaItems = document.querySelectorAll('#corpo-pedidos main');
   listaItems.forEach(function(item) {
       var textoItem = item.querySelector('.kanban-item').textContent.toLowerCase();

       // Verifica se o texto do item contém o termo de pesquisa
       if (textoItem.includes(termoPesquisa)) {
           item.style.display = 'block'; // Mostra o item
       } else {
           item.style.display = 'none'; // Oculta o item
       }
   });
}
// ========== FIM PESQUISA ========== //



// Função principal
async function main() {
   try {
      loading('flex'); // Seta display flex até que tudo esteja carregado
      const status = await fetch('/api/status').then(response => response.json());
      const cardsData = await fetch('/api/pedidos').then(response => response.json());

      await status_frete(status); // Insere os status

      // Inserir cards nos respectivos status
      for (let i = 0; i < status.length; i++) {
         const status_atual = status[i].NOMSTATUSFRE.replace(/\s/g, '').toLowerCase();
         const corParaStatus = status[i].COLOR; // Adiciona isso para obter a cor correspondente
         const cardsParaStatus = cardsData.filter(card => card.NOMSTATUSFRE === status[i].NOMSTATUSFRE);
         await cards(cardsParaStatus, status_atual, corParaStatus); // Passa a cor correspondente para a função cards
      }
      
      loading('none'); // Seta display none assim que tudo carregar
   } catch (error) {
      console.error('Erro ao obter dados da API:', error);
   }
}

main();