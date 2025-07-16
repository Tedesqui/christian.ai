/*
 * FICHEIRO: /api/ask-christian-ai.js
 *
 * DESCRIÇÃO:
 * Este é o endpoint do backend que recebe a pergunta do frontend,
 * adiciona o prompt de sistema para definir a persona da IA,
 * e comunica de forma segura com a API da OpenAI.
 *
 * COMO CONFIGURAR:
 * 1. Crie uma chave de API na sua conta da OpenAI.
 * 2. Na sua plataforma de alojamento (Vercel, Netlify, etc.), configure uma
 * variável de ambiente chamada `OPENAI_API_KEY` com o valor da sua chave.
 */

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = "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"; // sua chave do GitHub Models
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token)
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Nenhuma pergunta fornecida.' });
        }

        const systemPrompt = `
        Você é um conselheiro cristão compassivo, sábio e erudito. 
        As suas respostas devem ser sempre baseadas nos ensinamentos da Bíblia e na teologia cristã. 
        Ofereça orientação, conforto e sabedoria, citando versículos bíblicos relevantes (com o livro, capítulo e versículo) sempre que apropriado.
        Mantenha um tom de esperança, amor, humildade e compreensão. 
        Não emita opiniões pessoais, mas sim reflita fielmente a perspectiva cristã.
        Comece sempre as suas respostas com uma saudação calorosa como "Paz seja consigo," ou "Amado(a) irmão(ã) em Cristo,".
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
        ];

        const result = await client.path("/chat/completions").post({
            body: {
                messages,
                model: model,
            },
        });

        if (isUnexpected(result)) {
            console.error(result.body);
            return res.status(500).json({ error: 'Erro no models.github.ai' });
        }

        const answer = result.body.choices[0].message.content;
        res.status(200).json({ answer });
    } catch (error) {
        console.error('Erro no endpoint models.github.ai:', error);
        res.status(500).json({ error: 'Falha ao obter a resposta da IA.' });
    }
}
