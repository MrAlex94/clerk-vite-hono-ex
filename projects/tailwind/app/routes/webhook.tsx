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


export const POST = createRoute(async (context) => {
    const stripe = createStripeClient(context.env?.STRIPE_API_KEY as string);
    const signature = context.req.raw.headers.get("stripe-signature");
    try {
        if (!signature) {
            return context.text("", 400);
        }
        const body = await context.req.text();
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            context.env?.STRIPE_WEBHOOK_SECRET,
            undefined,
            Stripe.createSubtleCryptoProvider()
        );
        switch(event.type) {
            case "payment_intent.created": {
                console.log(event.data.object)
                break
            }
            default:
                break
        }
        return context.text("", 200);
      } catch (err) {
        const errorMessage = `⚠️  Webhook signature verification failed. ${err instanceof Error ? err.message : "Internal server error"}`
        console.log(errorMessage);
        return context.text(errorMessage, 400);
      }
})
