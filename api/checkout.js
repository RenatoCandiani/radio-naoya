import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Preços por plano (serão criados no Stripe)
const PLANO_PRECOS = {
  basic: process.env.STRIPE_PRICE_BASIC,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plano, radioSlug, email } = req.body;

  if (!plano || !PLANO_PRECOS[plano]) {
    return res.status(400).json({ error: 'Plano inválido' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: PLANO_PRECOS[plano],
          quantity: 1,
        },
      ],
      metadata: {
        radioSlug,
        plano,
      },
      success_url: `${req.headers.origin}?radio=${radioSlug}&upgrade=success`,
      cancel_url: `${req.headers.origin}?radio=${radioSlug}&upgrade=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
