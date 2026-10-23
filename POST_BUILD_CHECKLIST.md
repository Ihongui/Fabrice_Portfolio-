# Post-build checklist

## Completed in this scaffold

- [x] English and French locale routing and language switch
- [x] Public home, philosophy, originality, CV, projects, in-progress, academics, references, contact, and privacy pages
- [x] AgriPrice GH project copy and anonymous survey callout
- [x] Seed script and Argon2id admin hash utility
- [x] Auth.js credentials login and protected admin pages
- [x] Bilingual content editor with input validation, admin action checks, audit records, and revalidation
- [x] Contact validation, honeypot, time trap, and Mongo-backed rate limit
- [x] CSP nonce, baseline security headers, and Netlify adapter config
- [x] Unit tests for form and NoSQL input validation
- [x] Playwright smoke checks for language switching, admin login protection, and CV PDF download
- [x] Netlify Blobs media upload with PDF/image signature and size validation
- [x] Private document approval emails, hashed access tokens, expiry, revocation, category filtering, download caps, and audit events
- [x] Admin file inventory, public file serving, private streaming, and file deletion
- [x] First-party page views, daily hashed visitors, Do Not Track support, top-page stats, and CV download counts

## Owner setup needed

- [ ] Set Atlas `MONGODB_URI` and run `npm run seed`
- [ ] Generate and set `AUTH_SECRET` and `ADMIN_PASSWORD_HASH`
- [ ] Set Resend API key and verified sender domain
- [ ] Configure Netlify Blobs for local development/deployment
- [ ] Provide a professional photo
- [ ] Replace hidden sample projects with real work
- [ ] Add real referee records and transcripts through the private access workflow
- [ ] Review the French copy
- [ ] Confirm the Statement of Originality before removing its draft marker
- [ ] Decide when AgriPrice GH is complete

## Remaining product work

- [ ] Model-specific editors for Education, Experience, Skills, and project records
- [ ] Uploaded CV source selector and history/restore
- [ ] Backup export/import validation
- [ ] Account lockout and optional TOTP
- [ ] Cloudflare Turnstile integration
- [ ] Open Graph image generation, complete metadata/hreflang, and JSON-LD
- [ ] Lighthouse and axe measurements against a configured deployment

No Lighthouse, axe, penetration, or deployment test results are claimed. Current local checks are listed in the handoff summary.
