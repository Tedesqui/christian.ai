/*
 * FICHEIRO: /api/ask-christian-ai-azure.js
 *
 * DESCRIÇÃO:
 * Este é o endpoint do backend que recebe a pergunta do frontend,
 * adiciona o prompt de sistema para definir a persona da IA,
 * e comunica de forma segura com a API do Azure OpenAI.
 *
 * COMO CONFIGURAR PARA AZURE:
 * 1. Crie um recurso do Azure OpenAI no portal do Azure.
 * 2. No Azure AI Studio, faça o deploy de um modelo. Por exemplo, para usar o modelo mais recente,
 * escolha "gpt-4o". Anote o "Nome do deployment" que você definir (ex: "meu-chat-gpt4o").
 * 3. Na sua plataforma de alojamento (Vercel, Netlify, Azure App Service, etc.), 
 * configure as seguintes variáveis de ambiente:
 * * - AZURE_OPENAI_ENDPOINT: O endpoint do seu recurso (ex: https://seu-recurso.openai.azure.com/).
 * - AZURE_OPENAI_API_KEY: A chave de API do seu recurso do Azure OpenAI.
 * - AZURE_OPENAI_DEPLOYMENT_NAME: O nome exato do seu deployment do modelo. É aqui que você
 * define qual modelo usar (ex: "meu-chat-gpt4o" para usar o GPT-4o).
 * - AZURE_OPENAI_API_VERSION: A versão da API que deseja usar (ex: "2024-02-01").
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

        // Recupera as variáveis de ambiente específicas do Azure
        const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
        // O nome do deployment define qual modelo do Azure AI será usado (ex: gpt-4o, gpt-4, etc.)
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

        if (!azureEndpoint || !azureApiKey || !deploymentName || !apiVersion) {
            console.error("Variáveis de ambiente do Azure não estão configuradas corretamente.");
            return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
        }

        // Constrói a URL da API para o Azure OpenAI
        const apiUrl = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

        // Este é o "prompt de sistema" que define a personalidade e o conhecimento da IA.
        const systemPrompt = `
            Você é um conselheiro cristão compassivo, sábio e erudito. 
            As suas respostas devem ser sempre baseadas nos ensinamentos da Bíblia e na teologia cristã. 
            Ofereça orientação, conforto e sabedoria, citando versículos bíblicos relevantes (com o livro, capítulo e versículo) sempre que apropriado.
            Mantenha um tom de esperança, amor, humildade e compreensão. 
            Não emita opiniões pessoais, mas sim reflita fielmente a perspectiva cristã.
            Comece sempre as suas respostas com uma saudação calorosa como "Paz seja consigo," ou "Amado(a) irmão(ã) em Cristo,".
        `;

        // O payload para o Azure não precisa do campo "model", pois ele já está na URL
        const payload = {
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: question
                }
            ],
            // Você pode adicionar outros parâmetros aqui, como temperatura, etc.
            // temperature: 0.7,
            // max_tokens: 800
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // O Azure usa 'api-key' no cabeçalho em vez de 'Authorization'
                'api-key': azureApiKey
            },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error("Erro da API do Azure OpenAI:", errorBody);
            throw new Error(errorBody.error?.message || 'A API do Azure OpenAI não conseguiu processar o pedido.');
        }

        const responseData = await apiResponse.json();
        const answer = responseData.choices[0].message.content;

        res.status(200).json({ answer: answer });

    } catch (error) {
        console.error('Erro no endpoint:', error.message);
        res.status(500).json({ error: 'Falha ao obter a resposta da IA.' });
    }
}
