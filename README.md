# Shop Board

Shop Board is a Node.js app for scraping product links (including IKEA) into a collaborative board workflow.

## Local run

```bash
cd "/Users/austinsteele/Documents/New project"
npm install
npm start
```

App runs at `http://localhost:3000`.

## Deploy to Render

This repo now includes a Render Blueprint at `render.yaml`.

### 1) Push this repo to GitHub

Render will deploy from your repo branch.

### 2) Create service from Blueprint

In Render:
1. New -> Blueprint
2. Select this repo
3. Confirm the `shop-board` web service

### 3) Set required environment variables

Set these in Render (or keep existing values if already configured):

- `AUTH_PROVIDER=supabase`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Optional but recommended for full feature parity:

- `ZYTE_API_KEY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `FEEDBACK_EMAIL_TO`
- `BOARD_ACTIVITY_EMAIL_FROM`

Defaults already configured in `render.yaml`:

- `NODE_VERSION=22`
- `DATA_DIR=/var/data/shopboard`
- `OPENAI_ITEM_NAME_MODEL=gpt-4.1-mini`
- `OPENAI_API_BASE=https://api.openai.com/v1`
- `OPENAI_ITEM_NAME_TIMEOUT_MS=6000`
- `FEEDBACK_EMAIL_FROM=ShopBoard Feedback <onboarding@resend.dev>`
- `BOARD_ACTIVITY_EMAIL_FROM=ShopBoard Updates <onboarding@resend.dev>`

### 4) Persistent disk

`render.yaml` mounts a persistent disk at `/var/data` so SQLite/app data persist across restarts and deploys.

### 5) Verify deployment

After deploy:

1. Open the Render URL.
2. Confirm `/` returns app HTML.
3. Add a test product link and verify extract works.
4. Check logs for startup line showing database path under `/var/data/shopboard`.

## Environment template

Use `.env.example` as the reference for local/hosted variable setup.
