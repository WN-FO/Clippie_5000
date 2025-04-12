# Stripe Webhook Setup Instructions
1. Install Stripe CLI
2. Login with your Stripe account: stripe login
3. Run: stripe listen --forward-to localhost:3000/api/webhook
4. Copy the webhook signing secret and update STRIPE_WEBHOOK_SECRET in env.local
