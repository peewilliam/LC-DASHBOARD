require('dotenv').config();
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../connect/firebird');
const fs = require('fs');

const usersData = JSON.parse(fs.readFileSync('./server/usersData.json', 'utf-8'));

router.get('/get', async (req, res, next) => {
  const result = await executeQuery('SELECT * FROM tabmovtra');
  
     res.status(200).json(result)
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
    // .map(user => user.username) // Vai apresentar todos os demais
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