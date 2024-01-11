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

module.exports = router;