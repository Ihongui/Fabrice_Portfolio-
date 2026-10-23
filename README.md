# Fabrice Ihongui Portfolio

Bilingual (English/French) portfolio built with Next.js App Router, TypeScript, next-intl, MongoDB/Mongoose, Auth.js credentials, and Netlify deployment support.

## Local setup

1. Install Node.js 20 or later and MongoDB Atlas access.
2. Copy `.env.example` to `.env.local` and fill in `MONGODB_URI`, `AUTH_SECRET`, and the admin credentials. `ADMIN_EMAIL` defaults to Fabrice's public contact email. Generate a password hash with `npm run admin:hash`.
3. Install dependencies with `npm install`.
4. Seed initial portfolio content with `npm run seed`.
5. Start the site using `npm run dev`, then open `http://localhost:3000/en`. The CMS is at `/admin`.

## MongoDB Atlas

Create a free M0 cluster, create a database user with a unique strong password, and allow the Netlify function egress addresses in Atlas Network Access. Atlas does not provide fixed egress IPs for every plan; if using `0.0.0.0/0`, use a strong database user password and keep application permissions limited to the portfolio database. Store the connection URI only in Netlify environment variables or `.env.local`.

## Admin account

There is no public registration. Run `npm run admin:hash`, use the resulting Argon2id hash as `ADMIN_PASSWORD_HASH`, and set `ADMIN_EMAIL`. The admin interface is protected by Auth.js middleware and rechecks the signed-in account inside content mutation actions.

## Netlify deployment

Connect the repository to Netlify. The included `netlify.toml` uses `npm run build` and the official `@netlify/plugin-nextjs` adapter. Configure `MONGODB_URI`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `EMAIL_FROM` in Site configuration → Environment variables. Give server secrets both Functions and Builds scope and apply them to the Production deploy context. Set the MongoDB URI database path to `/portfolio` so the app reads the records created by `npm run seed`. Generate the secret with `npx auth secret`; generate the password hash with `npm run admin:hash` in a terminal, then paste the hash into Netlify. Redeploy after changing variables. Leave `NEXT_PUBLIC_SITE_URL` pointed to the provided `*.netlify.app` address until a custom domain is ready. File uploads use the Netlify Blobs stores `portfolio-public` and `portfolio-private`; configure Netlify Blobs for local development with `netlify dev` and in the deployed site. Access approval emails require a verified Resend sender.

## Available checks

- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`

## Current scope

The scaffold includes bilingual public pages, a bilingual content editor backed by a generic content collection, a structured CV preview and PDF route, contact form validation/rate limiting/inbox, private access requests with expiring, revocable download links, admin file uploads to Netlify Blobs, analytics, contact inbox, audit events, and initial seed records. Remaining work for the owner is listed in `POST_BUILD_CHECKLIST.md`.


