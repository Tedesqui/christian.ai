// Importa a biblioteca do Stripe e a inicializa com a sua chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Detalhes do produto para a página de checkout
const productDetails = {
    "pt": { name: 'Acesso Semanal - IA Cristã', description: '7 dias de acesso para conversar com seu assistente de fé.' },
    "en": { name: 'Weekly Access - Christian AI', description: '7 days of access to chat with your faith assistant.' },
    "es": { name: 'Acceso Semanal - IA Cristiana', description: '7 días de acceso para chatear con tu asistente de fe.' }
};

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { langCode } = request.body || {};
        
        // Determina o idioma e a moeda
        const details = productDetails[langCode] || productDetails['pt'];
        const currency = langCode === 'pt' ? 'brl' : 'usd';
        const unitAmount = currency === 'brl' ? 1490 : 299; // R$ 14,90 ou $2.99 USD

        // URLs de sucesso e cancelamento
        const successUrl = `https://${request.headers.host}?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `https://${request.headers.host}`;

        const lineItem = {
            price_data: {
                currency: currency,
                product_data: {
                    name: details.name,
                    description: details.description,
                },
                unit_amount: unitAmount,
            },
            quantity: 1,
        };

        // Cria a sessão de checkout no Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [lineItem],
            mode: 'payment', // Pagamento único, não uma assinatura recorrente
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        // Retorna a URL de checkout para o frontend
        return response.status(200).json({ checkoutUrl: session.url });

    } catch (error) {
        console.error("Erro ao criar sessão de checkout no Stripe:", error);
        return response.status(500).json({
            error: "Ocorreu um erro interno no servidor.",
            details: error.message
        });
    }
}
