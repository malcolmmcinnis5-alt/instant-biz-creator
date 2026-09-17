const express = require('express');
const cors = require('cors');
const path = require('path');

// 🔐 Auto-sanitizes keys and applies the modern Fetch client for Render network compatibility
const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim().replace(/['"‘“’”\s]/g, '');
const Stripe = require('stripe');
const stripe = new Stripe(stripeSecretKey, {
    httpClient: Stripe.createFetchHttpClient() // 🚀 FORCES COMPATIBILITY WITH RENDER'S FIREWALL
}); 

const app = express();

// Enable CORS so your frontend can talk to Render securely
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serves your index.html pricing layout automatically
app.use(express.static(__dirname)); 
app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Silences Stripe webhook errors
app.get('/webhook', (req, res) => { res.send('Webhook endpoint active.'); });
app.post('/webhook', (req, res) => { res.json({ received: true }); });

// Main checkout route for the \$6 and \$20 buttons
app.post('/create-checkout-session', async (req, res) => {
    const { planType } = req.body;
    let priceId = '';

    // 💰 YOUR STRIPE PRICE IDS DEFINED HERE
    if (planType === 'weekly') {
        priceId = 'price_1UGYMR7UjmmUoWdKxBnnpLgu'; // Your \$6 / 7 Days Price ID
    } else if (planType === 'monthly') {
        priceId = 'price_1UGYMR7UjmmUoWdKxBnnpLgu'; // Temporarily using the same ID so it doesn't crash
    } else {
        return res.status(400).json({ error: 'Invalid plan type selected.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: 'https://onrender.com',
            cancel_url: 'https://onrender.com',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Port binding rules for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
