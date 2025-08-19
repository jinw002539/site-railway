const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com PostgreSQL usando DATABASE_URL do Railway
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Conexão e criação de tabela
client.connect()
    .then(() => {
        console.log('✅ Conectado ao PostgreSQL');
        return client.query(`
      CREATE TABLE IF NOT EXISTS pessoas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        idade INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    })
    .then(() => console.log('✅ Tabela verificada/criada'))
    .catch(err => {
        console.error('❌ Erro na conexão:', err);
        process.exit(1);
    });

app.post('/gravar', async(req, res) => {
    const { nome, idade } = req.body;
    try {
        await client.query('INSERT INTO pessoas (nome, idade) VALUES ($1, $2)', [nome, idade]);
        res.send("Gravado com sucesso!");
    } catch (e) {
        console.error(e);
        res.status(500).send("Erro ao gravar");
    }
});

// Health check endpoint OBRIGATÓRIO
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ CORRIJA A LINHA CRÍTICA - deve escutar em 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});