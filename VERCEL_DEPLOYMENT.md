# Vercel Deployment Guide

This project is deployed on **Vercel**. Static assets are served from the `dist/` build output and all serverless functionality lives in the `api/` directory as Vercel API Routes.

---

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- The [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

---

## Local development

```bash
# Install dependencies
npm install

# Start the Vite dev server AND the API routes together
vercel dev
```

`vercel dev` starts Vite on port 3000 and the API routes under `/api/*` — matching the production layout exactly. The SPA's `fetch("/api/...")` calls work without any proxy configuration.

> **Tip:** On first run `vercel dev` will prompt you to link the project. Choose "Link to existing project" if it already exists in your Vercel dashboard, or "Create a new project" to set one up.

---

## Required environment variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables** (or via `vercel env add`).

### Auth0

| Variable                 | Description                                                 |
| ------------------------ | ----------------------------------------------------------- |
| `AUTH0_DOMAIN`           | Your Auth0 tenant domain, e.g. `your-tenant.us.auth0.com`   |
| `AUTH0_AUDIENCE`         | API audience, e.g. `https://api.dobeu.net`                  |
| `AUTH0_CLAIMS_NAMESPACE` | Optional custom claims namespace (used for role extraction) |

### Supabase

| Variable                    | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `SUPABASE_URL`              | Supabase project URL                                |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (never expose this to the browser) |

### Frontend (prefixed with `VITE_` — exposed to the browser bundle)

| Variable                        | Description                               |
| ------------------------------- | ----------------------------------------- |
| `VITE_AUTH0_DOMAIN`             | Auth0 domain (same as `AUTH0_DOMAIN`)     |
| `VITE_AUTH0_CLIENT_ID`          | Auth0 SPA client ID                       |
| `VITE_AUTH0_AUDIENCE`           | Auth0 audience (same as `AUTH0_AUDIENCE`) |
| `VITE_SUPABASE_URL`             | Supabase project URL                      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key                  |
| `VITE_POSTHOG_KEY`              | PostHog project API key                   |
| `VITE_POSTHOG_HOST`             | PostHog host URL                          |

### Stripe

| Variable            | Description                                        |
| ------------------- | -------------------------------------------------- |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |

### Twilio (SMS verification)

| Variable              | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `TWILIO_ACCOUNT_SID`  | Twilio Account SID                                        |
| `TWILIO_AUTH_TOKEN`   | Twilio Auth Token                                         |
| `TWILIO_PHONE_NUMBER` | Twilio sender number in E.164 format, e.g. `+15551234567` |

---

## Deploying

### First deploy

```bash
vercel
```

Follow the prompts to link or create the project. Vercel will detect the `vercel.json` config automatically.

### Production deploy

```bash
vercel --prod
```

Or push to the branch connected to your Vercel project — Vercel will auto-deploy on every push.

---

## Project structure

```
/
├── api/                    # Vercel API Routes (serverless functions)
│   ├── _helpers/           # Shared utilities (auth, http, supabase)
│   │   ├── auth0.ts        # JWT verification
│   │   ├── http.ts         # Response helpers
│   │   └── supabase.ts     # Supabase client singleton
│   ├── admin-users.ts
│   ├── audit-logs.ts
│   ├── ccpa-request.ts
│   ├── check-phone-verification.ts
│   ├── contact-submissions.ts
│   ├── create-checkout.ts
│   ├── files.ts
│   ├── news.ts
│   ├── newsletter-subscribe.ts
│   ├── newsletter.ts
│   ├── project-tasks.ts
│   ├── projects.ts
│   ├── send-sms-verification.ts
│   ├── services.ts
│   └── verify-sms-code.ts
├── dist/                   # Vite build output (generated, not committed)
├── src/                    # React SPA source
└── vercel.json             # Vercel config (build, rewrites, headers)
```

---

## `vercel.json` overview

- **`buildCommand`**: `npm run build` (runs sitemap generation + Vite)
- **`outputDirectory`**: `dist`
- **Rewrites**: all paths not starting with `/api` are served `index.html` (SPA routing). `/es/*` and `/fr/*` pass a `lang` query param for i18n.
- **Headers**: security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and immutable cache headers for static assets.

---

## Rollback

In the Vercel dashboard go to **Deployments**, find the last good deployment, and click **Promote to Production**.

---

## Troubleshooting

| Symptom                   | Fix                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------- |
| API route returns 404     | Confirm the file exists in `api/` and exports a `default` function                      |
| Auth errors in API routes | Verify `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` env vars are set for the correct environment |
| Supabase errors           | Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set                          |
| SPA page refresh 404      | The rewrite in `vercel.json` handles this — ensure the file is present                  |
| Stripe checkout fails     | Confirm `STRIPE_SECRET_KEY` is set; use `sk_test_` for testing                          |
