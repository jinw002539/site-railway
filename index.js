const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com PostgreSQL - formato correto para Railway
const client = new Client({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
    ssl: { rejectUnauthorized: false }
});

// Conexão com banco
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
    });

// Rota principal para servir o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

// Health check OBRIGATÓRIO para Railway
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Servidor funcionando',
        timestamp: new Date().toISOString()
    });
});

// ✅ CORREÇÃO CRÍTICA - Railway precisa escutar em 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log(`📊 Porta: ${PORT}`);
    console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
});