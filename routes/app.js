const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require('fs');
// const { executeQuery } = require('../connect/mysql');

router.get('/', async (req, res, next) => {
    // Se a rota raiz for acessada, carregue a página home
    const pagePath = path.join(__dirname, '../', 'public/pages/index.html');

    if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
    } else {
        res.status(404).sendFile(path.join(__dirname, '../', 'public/pages/404-error.html'));
    }
});


router.get('/:path(*)', async (req, res, next) => {
    const fullPath = req.params.path || '';
    const segments = fullPath.split('/').filter(Boolean);
    const isDirectory = fullPath.endsWith('/'); // Verifica se a URL termina com barra

    if (segments.length === 0) {
        res.status(404).sendFile(path.join(__dirname, '../', 'public/pages/404-error.html'));
        return;
    }

    const fileName = isDirectory ? 'index' : segments.pop();
    const folderPath = path.join(...segments);

    let pagePath = path.join(__dirname, '../', 'public/pages', folderPath, `${fileName}.html`);

    if (fs.existsSync(pagePath)) {

        res.sendFile(pagePath);
    } else {
        res.status(404).sendFile(path.join(__dirname, '../', 'public/pages/404-error.html'));
    }
});







module.exports = router;