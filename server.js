const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- ADDED THIS LINE
// Replace with your real Stripe Secret Key from ://stripe.com
const stripe = require('stripe')('your_stripe_secret_key_here'); 

const app = express();

// Enable CORS so your frontend can talk to Render securely
app.use(cors({ origin: '*' }));
app.use(express.json());

// 🌟 ADDED THESE TWO LINES TO SHOW YOUR index.html PAGE
app.use(express.static(__dirname)); 
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// Main checkout route
app.post('/create-checkout-session', async (req, res) => {
    const { planType } = req.body;
    let priceId = '';

    if (planType === 'weekly') {
        priceId = 'price_weekly_7days_id_here'; 
    } else if (planType === 'monthly') {
        priceId = 'price_monthly_id_here';      
    } else {
        return res.status(400).json({ error: 'Invalid plan type selected.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: 'https://instant-biz-creator.onrender.com',
            cancel_url: 'https://instant-biz-creator.onrender.com',
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

