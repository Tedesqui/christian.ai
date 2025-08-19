const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const productDetails = {
    "pt": { name: 'Acesso Semanal - IA Cristã', description: '7 dias de acesso para conversar com seu assistente de fé.' },
    "en": { name: 'Weekly Access - Christian AI', description: '7 days of access to chat with your faith assistant.' },
    "es": { name: 'Acceso Semanal - IA Cristiana', description: '7 días de acceso para chatear con tu asistente de fe.' },
    "it": { name: 'Accesso Settimanale - IA Cristiana', description: '7 giorni di accesso per chattare con il tuo assistente di fede.' },
    "fr": { name: 'Accès Hebdomadaire - IA Chrétienne', description: "7 jours d'accès pour discuter avec votre assistant de foi." },
    "de": { name: 'Wöchentlicher Zugang - Christliche KI', description: '7 Tage Zugang zum Chat mit Ihrem Glaubensassistenten.' },
    "ru": { name: 'Недельный доступ - Христианский ИИ', description: '7 дней доступа для общения с вашим помощником по вере.' },
    "ja": { name: '週間アクセス - キリスト教AI', description: '信仰アシスタントとチャットするための7日間のアクセス。' },
    "ko": { name: '주간 액세스 - 기독교 AI', description: '신앙 도우미와 채팅할 수 있는 7일간의 액세스.' },
    "zh": { name: '每周访问 - 基督教AI', description: '与您的信仰助手聊天的7天访问权限。' },
    "hi": { name: 'साप्ताहिक पहुंच - ईसाई एआई', description: 'अपने आस्था सहायक के साथ चैट करने के लिए 7 दिनों की पहुंच।' },
    "fil": { name: 'Lingguhang Access - Christian AI', description: '7 araw na access para makipag-chat sa iyong faith assistant.' },
    "sv": { name: 'Veckovis Åtkomst - Kristen AI', description: '7 dagars åtkomst för att chatta med din trosassistent.' },
    "pl": { name: 'Dostęp Tygodniowy - Chrześcijańska AI', description: '7 dni dostępu do czatu z asystentem wiary.' },
    "bn": { name: 'সাপ্তাহিক অ্যাক্সেস - খ্রিস্টান এআই', description: 'আপনার বিশ্বাস সহকারীর সাথে চ্যাট করার জন্য ৭ দিনের অ্যাক্সেস।' },
    "ar": { name: 'وصول أسبوعي - الذكاء الاصطناعي المسيحي', description: 'وصول لمدة 7 أيام للدردشة مع مساعدك الإيماني.' }
};

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { langCode } = request.body || {};
        const lang = productDetails[langCode] ? langCode : 'pt';

        const details = productDetails[lang];
        const currency = lang === 'pt' ? 'brl' : (lang === 'fr' || lang === 'de' || lang === 'it' ? 'eur' : 'usd');
        const unitAmount = lang === 'pt' ? 1490 : (currency === 'eur' ? 299 : 299); // R$14,90, €2,99, or $2.99

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

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [lineItem],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return response.status(200).json({ checkoutUrl: session.url });

    } catch (error) {
        console.error("Erro ao criar sessão de checkout no Stripe:", error);
        return response.status(500).json({
            error: "Ocorreu um erro interno no servidor.",
            details: error.message
        });
    }
}
