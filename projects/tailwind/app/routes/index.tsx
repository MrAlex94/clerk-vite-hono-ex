import { clerkMiddleware } from '@hono/clerk-auth';
import { createRoute } from 'honox/factory'
const Stripe = require("stripe");

function createStripeClient(apiKey: string) {
  return new Stripe(apiKey, {
    appInfo: { // For sample support and debugging, not required for production:
      name: "stripe-samples/stripe-node-cloudflare-worker-template",
      version: "0.0.1",
      url: "https://github.com/stripe-samples"
    }
  });
}

export default createRoute(clerkMiddleware(), async (c) => {
  const stripe = createStripeClient(c.env?.STRIPE_API_KEY as string);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });
  return c.redirect(session.url, 303);
})
