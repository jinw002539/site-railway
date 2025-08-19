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

// ✅ ROTA TEMPORÁRIA PARA VER DADOS - ADICIONE ESTE CÓDIGO
app.get('/admin/dados', async(req, res) => {
    try {
        const result = await client.query('SELECT * FROM pessoas ORDER BY created_at DESC');

        // Formata os dados bonitos para HTML
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Dados Cadastrados</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    tr:hover { background-color: #f5f5f5; }
                </style>
            </head>
            <body>
                <h1>📊 Dados Cadastrados</h1>
                <p>Total: <strong>${result.rowCount}</strong> registros</p>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Idade</th>
                        <th>Data de Criação</th>
                    </tr>
        `;

        result.rows.forEach(row => {
            html += `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.nome}</td>
                    <td>${row.idade}</td>
                    <td>${new Date(row.created_at).toLocaleString('pt-BR')}</td>
                </tr>
            `;
        });

        html += `
                </table>
                <br>
                <a href="/">⬅️ Voltar para o formulário</a>
            </body>
            </html>
        `;

        res.send(html);

    } catch (e) {
        console.error(e);
        res.status(500).send('Erro ao buscar dados: ' + e.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});