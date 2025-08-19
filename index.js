const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new Client({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    ssl: { rejectUnauthorized: false }
});
client.connect();

app.post('/gravar', async(req, res) => {
    const { nome, idade } = req.body;
    try {
        await client.query('INSERT INTO pessoas (nome, idade) VALUES ($1,$2)', [nome, idade]);
        res.send("Gravado com sucesso!");
    } catch (e) {
        console.error(e);
        res.status(500).send("Erro ao gravar");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));