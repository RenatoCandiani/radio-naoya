import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://ygifgplxganolpgolzii.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// Desabilita body parser pra receber raw body do Stripe
export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Processa eventos relevantes
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { radioSlug, plano } = session.metadata;

      if (radioSlug && plano) {
        await supabase
          .from('radios')
          .update({
            plano,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            updated_at: new Date().toISOString(),
          })
          .eq('slug', radioSlug);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      // Quando cancela, volta pro plano free
      const subscription = event.data.object;
      await supabase
        .from('radios')
        .update({ plano: 'free', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'customer.subscription.updated': {
      // Quando muda de plano
      const subscription = event.data.object;
      const priceId = subscription.items.data[0]?.price?.id;

      let novoPlano = 'free';
      if (priceId === process.env.STRIPE_PRICE_BASIC) novoPlano = 'basic';
      if (priceId === process.env.STRIPE_PRICE_PREMIUM) novoPlano = 'premium';

      await supabase
        .from('radios')
        .update({ plano: novoPlano, updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
  }

  return res.status(200).json({ received: true });
}
