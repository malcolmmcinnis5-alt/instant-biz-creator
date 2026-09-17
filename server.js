const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. DIAGNOSTIC LOGS: This prints to your Render terminal immediately on boot
console.log("=== STRIPE ENVIRONMENT CHECK ===");
if (!process.env.STRIPE_SECRET_KEY) {
    console.log("❌ ERROR: STRIPE_SECRET_KEY is completely missing in Render Environment!");
} else {
    const key = process.env.STRIPE_SECRET_KEY;
    console.log(`✅ SUCCESS: Key found! Length: ${key.length} characters.`);
    console.log(`🔑 Key Type: ${key.startsWith('sk_live_') ? 'LIVE PRODUCTION MODE' : 'TEST MODE'}`);
}
console.log("=================================");

// 2. INITIALIZE STRIPE
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. CHECKOUT SESSION ENDPOINT
app.post('/create-checkout-session', async (req, res) => {
    const { priceId } = req.body;

    if (!priceId) {
        return res.status(400).json({ error: "Missing priceId in request body" });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId, // Accepts your \$6 or \$20 price ID dynamically
                    quantity: 1,
                },
            ],
            // Redirect URLs back to your web app
            success_url: 'https://vercel.app',
            cancel_url: 'https://vercel.app',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("❌ Stripe API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 5. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running cleanly on port ${PORT}`);
});
