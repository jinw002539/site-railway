const express = require('express');
const path = require('path');
const { Client } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Conexão com PostgreSQL do Render
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Conectar e criar tabela
client.connect()
    .then(() => {
        console.log('✅ Conectado ao PostgreSQL do Render');
        return client.query(`
      CREATE TABLE IF NOT EXISTS pessoas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        idade INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    })
    .then(() => console.log('✅ Tabela pronta'))
    .catch(err => console.error('❌ Erro DB:', err));

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', database: 'Connected' });
});

app.post('/gravar', async(req, res) => {
    const { nome, idade } = req.body;
    try {
        await client.query('INSERT INTO pessoas (nome, idade) VALUES ($1, $2)', [nome, idade]);
        res.send("✅ Gravado no banco com sucesso!");
    } catch (e) {
        console.error('Erro ao gravar:', e);
        res.status(500).send("❌ Erro ao gravar");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});