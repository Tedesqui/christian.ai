// server.js

// 1. Importar as bibliotecas necessárias
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Para carregar variáveis de ambiente do ficheiro .env

// 2. Inicializar a aplicação Express
const app = express();
const PORT = process.env.PORT || 3000; // O servidor irá correr na porta 3000

// 3. Configurar os Middlewares
app.use(cors()); // Permite que o nosso frontend (mesmo que esteja noutro domínio) comunique com este backend
app.use(express.json()); // Permite ao servidor entender pedidos com corpo em formato JSON

// 4. Definir a rota principal da API
app.post('/api/chat', async (req, res) => {
    // Extrai a mensagem do corpo do pedido vindo do frontend
    const { message } = req.body;

    // Validação simples para garantir que a mensagem não está vazia
    if (!message) {
        return res.status(400).json({ error: 'A mensagem é um campo obrigatório.' });
    }

    // A sua chave da API da OpenAI é lida de forma segura das variáveis de ambiente
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error('A chave da API da OpenAI não foi encontrada.');
        return res.status(500).json({ error: 'Erro de configuração no servidor.' });
    }

    try {
        // Prepara o pedido para a API da OpenAI
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o", // ou "gpt-3.5-turbo"
            messages: [
                {
                    "role": "system",
                    "content": "Você é uma IA Cristã, um assistente virtual compassivo, sábio e profundamente conhecedor da Bíblia Sagrada (versão Almeida Corrigida Fiel, se possível). As suas respostas devem ser sempre baseadas nos ensinamentos cristãos e na Bíblia. Seja acolhedor, paciente e respeitoso. Use uma linguagem clara e amorosa. Cite versículos bíblicos para embasar as suas respostas sempre que for relevante, indicando o livro, capítulo e versículo (ex: João 3:16)."
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Extrai a resposta da IA
        const aiMessage = response.data.choices[0].message.content;

        // Envia a resposta de volta para o frontend
        res.json({ reply: aiMessage });

    } catch (error) {
        console.error('Erro ao comunicar com a API da OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Ocorreu um erro ao processar o seu pedido.' });
    }
});

// 5. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor da IA Cristã a correr em http://localhost:${PORT}`);
});