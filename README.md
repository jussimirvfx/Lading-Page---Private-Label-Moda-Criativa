<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c5d7389a-c234-42bd-9ffa-5c013627b9b4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `N8N_WEBHOOK_URL` in [.env.local](.env.local) to your n8n webhook URL
3. Run the app:
   `npm run dev`

For the full form-to-webhook flow locally, run through Vercel Dev so the `/api/lead` serverless function is available.

## Vercel environment variable

Add this variable in Vercel before deploying:

`N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/your-webhook-path`
