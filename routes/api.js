require('dotenv').config();
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../connect/firebird');
const fs = require('fs');

const usersData = JSON.parse(fs.readFileSync('./server/usersData.json', 'utf-8'));

router.get('/pedidos', async (req, res, next) => {
  const draw = req.query.draw;

  // Verificar se a propriedade search existe
  const search = req.query.search || '';

  let count = 30; // Default 30 cards por status
  if (search) {
    count = 9999999999; // Se tiver pesquisar, trás qualquer coisa do banco
  }

  const result = await executeQuery(`
    SELECT
      PED.NOMOVTRA,
      CLI.NOMCLI AS CLIENTE,
      COALESCE(PED.CONTAINER, 'CARGA SOLTA') AS CONTAINER,
      CASE PED.NOSTATUSFRE
        WHEN 1 THEN 'CONCLUIDO'
        WHEN 2 THEN 'CANCELADO'
        WHEN null THEN 'SEM_STATUS'
        WHEN 3 THEN 'DOCUMENTOS_ENTREGUES'
        WHEN 4 THEN 'DEVOLUÇÃO_DE_VAZIO'
        WHEN 5 THEN 'CNTR_VAZIO_AGENDADO'
      END AS STATUS,
      FLW.DATA AS DATA_FOLLOW
    FROM
      TABMOVTRA PED
    LEFT OUTER JOIN
      TABCLI CLI ON CLI.NOCLI = PED.NOCLI
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
      (
        SELECT COUNT(*)
        FROM TABMOVTRA
        WHERE NOSTATUSFRE = PED.NOSTATUSFRE
          AND NOMOVTRA >= PED.NOMOVTRA
      ) <= ${count}
    ${search ? `AND (PED.NOMOVTRA LIKE '%${search}%' OR CLI.NOMCLI LIKE '%${search}%' OR PED.CONTAINER LIKE '%${search}%')` : ''}
    ORDER BY
      PED.NOMOVTRA DESC
  `);

  res.status(200).json({
    draw: draw,
    recordsTotal: result.length, // O total de registros no conjunto de dados (sem filtros)
    recordsFiltered: result.length, // O total de registros após a aplicação de filtros
    data: result,
  });
});

router.get('/pedidos-modal/:nomovtra', async (req, res, next) => {
  const { nomovtra } = req.params;

  try {
    const result = await executeQuery(`
      SELECT
        PED.NOMOVTRA,
        CLI.NOMCLI AS CLIENTE,

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
  } catch (error) {
    console.error('Erro na consulta SQL:', error);
    res.status(500).json({ error: 'Erro na consulta SQL' });
  }
})

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

router.get('/usuarios', async (req, res) => {
  const draw = req.query.draw;

  // Verificar se a propriedade search existe
  const search = req.query.search || '';

  const filtrar_usuarios = usersData.filter(user => {
    // Remove o usuário superuser
    return (
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.module.some(module => module.toLowerCase().includes(search.toLowerCase()))
    ) && user.id !== 1;
  });

  res.json({
    draw: draw,
    recordsTotal: usersData.length, // O total de registros no conjunto de dados (sem filtros)
    recordsFiltered: filtrar_usuarios.length, // O total de registros após a aplicação de filtros
    data: filtrar_usuarios,
  });
});

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