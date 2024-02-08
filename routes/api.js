require('dotenv').config();
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../connect/firebird');
const fs = require('fs');
const path = require('path');

// const usersData = JSON.parse(fs.readFileSync('./server/usersData.json', 'utf-8'));
const filePath = path.join(__dirname, 'server', 'usersData.json');
const usersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const data = new Date;
const ano = data.getFullYear();

router.get('/status', async (req, res, next) => {
  const result = await executeQuery(`
    SELECT
      CAST(NOMSTATUSFRE AS VARCHAR(8191) CHARACTER SET ISO8859_1) AS NOMSTATUSFRE,
      COLOR
    FROM
      TABSTATUSFRE
    WHERE
      NOSTATUSFRE NOT IN (1 /*CONCLUIDO*/)
  `);
    
  res.json(result)
});

router.get('/pedidos', async (req, res, next) => {

  const result = await executeQuery(`
    SELECT
      PED.NOMOVTRA,
      CLI.NOMCLI AS CLIENTE,
      COALESCE(PED.CONTAINER, 'CARGA SOLTA') AS CONTAINER,
      CAST(STF.NOMSTATUSFRE AS VARCHAR(8191) CHARACTER SET ISO8859_1) AS NOMSTATUSFRE,
      FLW.DATA AS DATA_FOLLOW,

      COL.NOMCLI AS COLETA,
      CCOL.NOMCID AS CID_COLETA,
      CCOL.UFCID AS UF_COLETA,

      DEST.NOMCLI AS DESTINATARIO,
      CDEST.NOMCID AS CID_DESTINATARIO,
      CDEST.UFCID AS UF_DESTINATARIO,

      DISTR.NOMCLI AS ENTREGA,
      CDISTR.NOMCID AS CID_ENTREGA,
      CDISTR.UFCID AS UF_ENTREGA,

      REM.NOMCLI AS REMETENTE,
      CREM.NOMCID AS CID_REMETENTE,
      CREM.UFCID AS UF_REMETENTE,

      PED.TOTALFRETE,
      PED.VLRMOT
    FROM
      TABMOVTRA PED
    LEFT OUTER JOIN
      TABCLI CLI ON CLI.NOCLI = PED.NOCLI
    LEFT OUTER JOIN
      TABCLI COL ON COL.NOCLI = PED.NOTERM_COL
    LEFT OUTER JOIN
      TABCLI DEST ON DEST.NOCLI = PED.NOCLI_DEST
    LEFT OUTER JOIN
      TABCLI DISTR ON DISTR.NOCLI = PED.NOTERM_DEST
    LEFT OUTER JOIN
      TABCLI REM ON REM.NOCLI = PED.NOCLI_REM
    LEFT OUTER JOIN
      TABCID CCOL ON CCOL.NOCID = COL.NOCID
    LEFT OUTER JOIN
      TABCID CDEST ON CDEST.NOCID = DEST.NOCID
    LEFT OUTER JOIN
      TABCID CDISTR ON CDISTR.NOCID = DISTR.NOCID
    LEFT OUTER JOIN
      TABCID CREM ON CREM.NOCID = REM.NOCID
    LEFT OUTER JOIN
      TABSTATUSFRE STF ON STF.NOSTATUSFRE = PED.NOSTATUSFRE
    LEFT OUTER JOIN (
      SELECT
        FLW.NOMOVTRA,
        MAX(FLW.DATA) AS DATA
      FROM
        TABFALLOW FLW
      GROUP BY
        FLW.NOMOVTRA
    ) FLW ON FLW.NOMOVTRA = PED.NOMOVTRA
    WHERE
      STF.NOSTATUSFRE NOT IN (1 /*CONCLUIDO*/)
      AND EXTRACT(YEAR FROM PED.DATAINCLUSAO) = ${ano}
    ORDER BY
      PED.NOMOVTRA DESC
  `)

  res.json(result)

});

router.get('/pedidos-modal/:nomovtra', async (req, res, next) => {
  const { nomovtra } = req.params;

  const result = await executeQuery(`
    SELECT
      PED.NOMOVTRA,
      CLI.NOMCLI AS CLIENTE,

      COALESCE(MOT.NOMCLI, '') AS MOTORISTA,
      COALESCE(PROP.NOMCLI, '') AS PROPRIETARIO,
      COALESCE(PED.PLACACAV, '') AS PLACACAV,
      COALESCE(PED.PLACACAR, '') AS PLACACAR,
      COALESCE(PED.PLACACAR2, '') AS PLACACAR2,
      COALESCE(PED.NOTAC, '') AS NOTAC,

      COL.NOMCLI AS COLETA,
      CCOL.NOMCID AS CID_COLETA,
      CCOL.UFCID AS UF_COLETA,

      DEST.NOMCLI AS DESTINATARIO,
      CDEST.NOMCID AS CID_DESTINATARIO,
      CDEST.UFCID AS UF_DESTINATARIO,

      DISTR.NOMCLI AS ENTREGA,
      CDISTR.NOMCID AS CID_ENTREGA,
      CDISTR.UFCID AS UF_ENTREGA,

      REM.NOMCLI AS REMETENTE,
      CREM.NOMCID AS CID_REMETENTE,
      CREM.UFCID AS UF_REMETENTE,
      

      FLW.DATA AS DATA_FOLLOW,
      FLW.STATUS AS STATUS_FOLLOW,
      CAST(FLW.OBS AS VARCHAR(8191) CHARACTER SET ISO8859_1) AS OBS_FOLLOW,

      PED.TOTALFRETE,
      PED.VLRMOT

    FROM
      TABMOVTRA PED
    LEFT OUTER JOIN
      TABCLI CLI ON CLI.NOCLI = PED.NOCLI
    LEFT OUTER JOIN
      TABCLI MOT ON MOT.NOCLI = PED.NOMOT
    LEFT OUTER JOIN
      TABCLI PROP ON PROP.NOCLI = PED.NOPROP
    LEFT OUTER JOIN
      TABCLI COL ON COL.NOCLI = PED.NOTERM_COL
    LEFT OUTER JOIN
      TABCLI DEST ON DEST.NOCLI = PED.NOCLI_DEST
    LEFT OUTER JOIN
      TABCLI DISTR ON DISTR.NOCLI = PED.NOTERM_DEST
    LEFT OUTER JOIN
      TABCLI REM ON REM.NOCLI = PED.NOCLI_REM
    LEFT OUTER JOIN
      TABCID CCOL ON CCOL.NOCID = COL.NOCID
    LEFT OUTER JOIN
      TABCID CDEST ON CDEST.NOCID = DEST.NOCID
    LEFT OUTER JOIN
      TABCID CDISTR ON CDISTR.NOCID = DISTR.NOCID
    LEFT OUTER JOIN
      TABCID CREM ON CREM.NOCID = REM.NOCID
    LEFT OUTER JOIN
      TABFALLOW FLW ON FLW.NOMOVTRA = PED.NOMOVTRA
    WHERE
      PED.NOMOVTRA = ${nomovtra}
  `);

  res.json(result);
});

router.get('/faturamento-pedidos', async (req, res, next) => {

  const result = await executeQuery(`
    SELECT
      VPF.NOMOVTRA,
      CAST(VPF.NOMCLI AS VARCHAR(8191) CHARACTER SET ISO8859_1) AS NOMCLI,
      VPF.TOTALPG,
      VPF.TOTALPAGO,
      VPF.DATAPGTO,

      VPF.TOTALREC,
      VPF.TOTALRECEBIDO,
      VPF.DATACONC,

      COALESCE(CCOL.NOMCID, 'SEM ENDEREÇO DE COLETA') AS CID_COLETA,
      COALESCE(' - ' || CCOL.UFCID, '') AS UF_COLETA,
  
      COALESCE(CDISTR.NOMCID, 'SEM ENDEREÇO DE ENTREGA') AS CID_ENTREGA,
      COALESCE(' - ' || CDISTR.UFCID, '') AS UF_ENTREGA
    FROM
        V_PEDIDO_FINANCEIRO VPF
    LEFT OUTER JOIN
        TABMOVTRA PED ON PED.NOMOVTRA = VPF.NOMOVTRA
    LEFT OUTER JOIN
        TABCLI COL ON COL.NOCLI = PED.NOTERM_COL
    LEFT OUTER JOIN
        TABCID CCOL ON CCOL.NOCID = COL.NOCID
    LEFT OUTER JOIN
        TABCLI DISTR ON DISTR.NOCLI = PED.NOTERM_DEST
    LEFT OUTER JOIN
        TABCID CDISTR ON CDISTR.NOCID = DISTR.NOCID
  `);
  
  res.status(200).json(result);
});

router.post('/login', async (req, res, next) => {
  const { name, password } = req.body;

  // Verifique as credenciais (substitua por um método mais seguro na prática)
  const user = usersData.find(user => user.username === name && user.password === password);

  if (user) {
    // Envie o token para o cliente
    res.json({ modules: user.module });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
    
});

router.get('/modulos', (req, res) => {
  // Pega os modulos disponiveis no usuario superuser, porque nele tem todos os modulos
  const modulos = usersData.find(user => user.username === 'superuser');
  res.json(modulos);

})

router.get('/usuarios', (req, res) => {
  // Pega os modulos disponiveis no usuario superuser, porque nele tem todos os modulos
  const usuarios = usersData
  .filter(user => user.id !== 1) // Não puxa o superuser

  res.json(usuarios);
})

router.post('/atualizar-usuario/:id', (req, res) => {
  const { id } = req.params; // Obtenha o ID da URL
  const { username, password, module } = req.body;

  // Encontrar e atualizar usuario no array
  const usuario_para_atualizar = usersData.find(user => user.id === parseInt(id));
  if (usuario_para_atualizar) {
    usuario_para_atualizar.username = username;
    usuario_para_atualizar.password = password;
    usuario_para_atualizar.module = module;

    // Atualizar o arquivo JSON no disco
    fs.writeFileSync('./server/usersData.json', JSON.stringify(usersData, null, 2));

    res.status(200).json({ message: 'Usuário atualizado com sucesso' });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
})

router.delete('/excluir-usuario/:id', (req, res) => {
  const { id } = req.params;

  // Encontrar o indice do usuario do array
  const index = usersData.findIndex(user => user.id === parseInt(id));

  if (index !== -1) {
    // Remove o usuário do array
    usersData.splice(index, 1);

    // Atualiza o arquivo JSON no disco
    fs.writeFileSync('./server/usersData.json', JSON.stringify(usersData, null, 2));
    
    res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }

})

router.post('/inserir-usuario', (req, res) => {
  const { username, password, module } = req.body;

  // Obter o ultimo ID existente e gerar um novo ID
  const maiorId = Math.max(...usersData.map(user => user.id), 0);
  const novoId = maiorId + 1;

  // Criar novo usuario
  const novoUsuario = {
    id: novoId,
    username,
    password,
    module
  };

  // Adicionar o novo usuário ao array
  usersData.push(novoUsuario);

  // Atualiza o arquivo JSON no disco
  fs.writeFileSync('./server/usersData.json', JSON.stringify(usersData, null, 2));

  res.status(201).json({ message: 'Usuário inserido com sucesso', novoUsuario });
})


module.exports = router;