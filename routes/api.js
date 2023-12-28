const express = require('express');
const router = express.Router();
const { executeQuery } = require('../connect/firebird');



router.get('/get', async (req, res, next) => {
  const result = await executeQuery('SELECT * FROM tabmovtra');
  
     res.status(200).json(result)
});




module.exports = router;