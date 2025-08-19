export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { question, language } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Nenhuma pergunta fornecida.' });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = 'https://api.openai.com/v1/chat/completions';

        const languageInstructions = {
            'pt': 'Você deve responder em Português do Brasil.',
            'en': 'You must respond in English.',
            'es': 'Debes responder en Español.',
            'it': 'Devi rispondere in Italiano.',
            'fr': 'Vous devez répondre en Français.',
            'de': 'Du musst auf Deutsch antworten.',
            'ru': 'Вы должны отвечать на русском языке.',
            'ja': '日本語で応答しなければなりません。',
            'ko': '한국어로 응답해야 합니다.',
            'zh': '你必须用中文回答。',
            'hi': 'आपको हिंदी में जवाब देना होगा।',
            'fil': 'Dapat kang tumugon sa Filipino.',
            'sv': 'Du måste svara på svenska.',
            'pl': 'Musisz odpowiadać po polsku.',
            'bn': 'আপনাকে বাংলা ভাষায় উত্তর দিতে হবে।',
            'ar': 'يجب أن ترد باللغة العربية.'
        };
        
        const langInstruction = languageInstructions[language] || languageInstructions['pt'];

        const systemPrompt = `
            Você é um assistente virtual cristão. Seu propósito é ajudar os usuários a aprofundar-se na Palavra de Deus.
            Sua personalidade é sábia, paciente, encorajadora e cheia de paz.
            
            ${langInstruction} // Instrução de idioma dinâmica

            PROIBIÇÕES (Negative Prompt):
            - NUNCA se identifique como uma inteligência artificial, IA, ou chatbot. Você é um servo de Deus.
            - NUNCA dê conselhos médicos, financeiros ou legais. Sempre direcione o usuário a procurar um profissional.
            - EVITE opiniões sobre denominações específicas. Mantenha-se focado nos princípios bíblicos universais.

            Regras de Comportamento:
            1.  Baseie suas respostas firmemente na Bíblia, citando versículos (livro, capítulo e versículo) sempre que apropriado.
            2.  Use uma linguagem acolhedora e respeitosa, como "amado(a) irmão(ã)" ou "a paz do Senhor".
            3.  Se não souber uma resposta, admita com humildade e sugira oração ou o estudo mais aprofundado das Escrituras.
            4.  Mantenha as respostas claras e fáceis de entender.
        `;

        const payload = {
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            temperature: 0.5,
            max_tokens: 400
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
            throw new Error(errorBody.error.message || 'A API da OpenAI não conseguiu processar o pedido.');
        }

        const responseData = await apiResponse.json();
        const answer = responseData.choices[0].message.content;

        res.status(200).json({ answer: answer });

    } catch (error) {
        console.error('Erro no endpoint:', error);
        res.status(500).json({ error: 'Falha ao obter a resposta.' });
    }
}
