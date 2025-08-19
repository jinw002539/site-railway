const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// REMOVA o dotenv - não é necessário no Railway
// require('dotenv').config();

// Use DATABASE_URL que o Railway fornece automaticamente
const client = new Client({
    connectionString: process.env.DATABASE_URL || {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
    },
    ssl: {
        rejectUnauthorized: false
    }
});

// Conexão com tratamento de erro melhorado
client.connect()
    .then(() => {
        console.log('Conectado ao PostgreSQL com sucesso!');

        // Criar tabela se não existir
        return client.query(`
      CREATE TABLE IF NOT EXISTS pessoas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        idade INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    })
    .then(() => {
        console.log('Tabela "pessoas" verificada/criada');
    })
    .catch(err => {
        console.error('Erro na conexão com o banco:', err);
        process.exit(1); // Encerra o app se não conectar
    });

app.post('/gravar', async(req, res) => {
    const { nome, idade } = req.body;

    // Validação básica
    if (!nome || !idade) {
        return res.status(400).send("Nome e idade são obrigatórios");
    }

    try {
        await client.query('INSERT INTO pessoas (nome, idade) VALUES ($1, $2)', [nome, parseInt(idade)]);
        res.send("Gravado com sucesso!");
    } catch (e) {
        console.error('Erro ao gravar:', e);
        res.status(500).send("Erro ao gravar no banco de dados");
    }
});

// Rota adicional para verificar saúde da aplicação
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        database: 'Connected',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Variáveis disponíveis:`, Object.keys(process.env).filter(key => key.includes('PG') || key.includes('DATABASE')));
});