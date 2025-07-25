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

export default async function handler(req, res) {
    // Apenas permite pedidos POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Nenhuma pergunta fornecida.' });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = 'https://api.openai.com/v1/chat/completions';

        // Este é o "prompt de sistema" que define a personalidade e o conhecimento da IA.
        const systemPrompt = `
            Você é um conselheiro cristão compassivo, sábio e erudito. 
            As suas respostas devem ser sempre baseadas nos ensinamentos da Bíblia e na teologia cristã. 
            Ofereça orientação, conforto e sabedoria, citando versículos bíblicos relevantes (com o livro, capítulo e versículo) sempre que apropriado.
            Mantenha um tom de esperança, amor, humildade e compreensão. 
            Não emita opiniões pessoais, mas sim reflita fielmente a perspectiva cristã.
            Comece sempre as suas respostas com uma saudação calorosa como "Paz seja consigo," ou "Amado(a) irmão(ã) em Cristo,".
        `;

        const payload = {
            model: "gpt-4o", // Pode usar "gpt-3.5-turbo" para uma opção mais económica
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: question
                }
            ]
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error("Erro da API da OpenAI:", errorBody);
            throw new Error(errorBody.error.message || 'A API da OpenAI não conseguiu processar o pedido.');
        }

        const responseData = await apiResponse.json();
        const answer = responseData.choices[0].message.content;

        res.status(200).json({ answer: answer });

    } catch (error) {
        console.error('Erro no endpoint de correção:', error);
        res.status(500).json({ error: 'Falha ao obter a resposta da IA.' });
    }
}
