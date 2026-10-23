# Build Prompt: Fabrice Ihongui — Bilingual Portfolio with Admin CMS

You are a senior full-stack engineer. Build a production-ready, bilingual (English/French) personal portfolio website with a built-in admin CMS, so the owner can edit everything from a browser without touching code. Work in phases, commit after each phase, run lint/type-check/tests before moving on, and finish with a deployment guide. Ask me only if something is truly blocking; otherwise make the sensible choice and note it in `DECISIONS.md`.

---

## 1. Owner and context

- **Owner:** Fabrice Ihongui — BSc Information Technology (expected Oct 2026), University of Ghana, Accra.
- **Email (use this one):** ihonguifabrice1@gmail.com. The old university address on the CV is obsolete.
- **Purpose:** an academic and professional portfolio for employers and recruiters. It must cover these sections:
  1. Statement of Originality
  2. Work Philosophy
  3. Resume / CV
  4. Work Samples
  5. Works in Progress
  6. Academic Plan of Study
  7. References
  8. Contact
- The owner is **not a developer**. Every piece of content must be editable in the admin UI, and the owner must be able to add, edit, reorder, hide and delete items in every section.

## 2. Stack (fixed by the owner)

- **Framework:** Next.js (latest stable, App Router, TypeScript strict, Server Components and Server Actions where they fit).
- **Database:** MongoDB Atlas (cluster "Cluster0", free tier) via **Mongoose**.
- **Hosting:** Netlify (use the current official Next.js support/adapter). Initial URL is the free `*.netlify.app` subdomain; make adding a custom domain later a config-only change (`NEXT_PUBLIC_SITE_URL`).
- **Styling:** Tailwind CSS + a small set of accessible primitives (Radix UI or shadcn/ui). Motion via Framer Motion, respecting `prefers-reduced-motion`.
- **i18n:** `next-intl` with locale routing (`/en/...`, `/fr/...`), a visible language toggle, `hreflang` tags, and a locale-aware sitemap.
- **Validation:** Zod on every input, shared between client forms and server.
- **Auth:** Auth.js (NextAuth v5) Credentials provider, single admin account.
- **Files:** Netlify has no persistent disk. Use **Netlify Blobs** for uploads (CV PDFs, images, certificates, transcript). Public files are served through a route handler with caching; private files are only served by an authorized route handler. Abstract storage behind a `storage` interface so it can be swapped later.
- **Email:** Resend (free tier) for the contact form and access-request notifications.
- **PDF generation:** `@react-pdf/renderer` (no headless Chrome, which is too heavy for Netlify functions).
- **Testing:** Vitest for unit tests; Playwright for a few end-to-end smoke tests (public pages, language toggle, admin login, CV download).

## 3. Security requirements (treat as non-negotiable)

The owner asked for "default protection against SQL injection". MongoDB is NoSQL, so the equivalent threat is **NoSQL/operator injection**. Implement all of the following:

- Validate and **coerce every input to expected primitive types with Zod** before it reaches Mongoose; reject objects containing keys starting with `$` or containing `.`. Enable Mongoose `strict`, `sanitizeFilter: true`, and never build queries from raw request objects.
- Passwords hashed with **argon2id** (or bcrypt cost ≥ 12). The admin is seeded from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`); there is no public sign-up. Provide a script `npm run admin:hash` to generate the hash.
- Session cookies: `httpOnly`, `secure`, `sameSite=lax`. CSRF protection on all mutations. Admin routes protected in middleware **and** re-checked inside every Server Action and route handler (never rely on middleware alone).
- **Rate limiting** (Mongo-backed or Netlify-compatible) on login, contact form, and access requests. Account lockout/backoff after repeated failed logins. Optional TOTP two-factor for the admin (implement if time allows, behind a setting).
- Security headers via `next.config`/Netlify `_headers`: strict CSP (nonce-based), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.
- Upload safety: allow-list MIME types and extensions (PDF, PNG, JPG, WEBP), verify magic bytes, size limits (PDF ≤ 5 MB, images ≤ 3 MB), randomized file names, no SVG uploads.
- Rich text (if used) is sanitized server-side (`sanitize-html` or DOMPurify on the server) before saving and before rendering.
- Secrets only in env vars; commit `.env.example`; add `.gitignore` entries. No secrets in client bundles.
- Contact form: honeypot field + time-trap + rate limit (add Cloudflare Turnstile as an optional env-toggled feature).
- Audit log (collection) of admin actions: who, what, when.

## 4. Data model (Mongoose)

All user-facing text fields are bilingual: `{ en: string, fr: string }`. If `fr` is empty, fall back to `en` and show a small "Translation pending" badge in the admin (not on the public site).

Common fields on content documents: `_id`, `visible` (bool), `order` (number), `createdAt`, `updatedAt`.

- **SiteSettings** (singleton): site title, tagline, hero text, owner name, public email, optional phone, optional location, social links (GitHub, LinkedIn, other), profile photo, theme default, default locale, analytics on/off, SEO defaults (title template, description, OG image), and **privacy toggles** that decide whether phone and street address appear publicly (default: hidden).
- **SectionConfig**: key, title (bilingual), visible, order, intro text. Lets the owner hide, rename and reorder whole sections, and add **custom sections** (title + rich content blocks).
- **Profile / About:** headline, summary (bilingual), languages spoken with levels, hobbies.
- **Education:** institution, qualification, field, start, end/expected, location, description, grade (optional).
- **Experience:** role, organization, location, start, end, current (bool), bullet points (bilingual list).
- **Skill:** name, category (e.g. Networking & Security, Programming, Management, Soft skills), level (optional), order.
- **Project (Work Sample):** slug, title, summary, long description (rich text), role, tech stack tags, status (`completed` / `in_progress`), dates, cover image, gallery, links (live, GitHub, report/PDF), featured (bool), plus **case-study fields**: problem, approach, outcome. Projects with status `in_progress` automatically populate **Works in Progress**.
- **Course (Academic Plan of Study):** code, name, level, semester, credits, grade (optional), status (`completed` / `current` / `planned`). Public view shows courses and plan; grades are optional per course (admin can hide grades globally).
- **Document:** title, type (`cv`, `transcript`, `certificate`, `diploma`, `award`, `other`), file reference, visibility (`public` / `on_request` / `private`), issuer, date, description.
- **Reference:** name, title, organization, relationship, email, phone, optional testimonial quote; contact details are **never public**; visibility defaults to `on_request`.
- **CVDocument:** see section 6.
- **AccessRequest:** visitor name, email, organization, reason, which items requested, status (`pending` / `approved` / `denied`), token hash, expiry, timestamps.
- **ContactMessage:** name, email, subject, message, read flag, spam score.
- **PageView** (analytics): path, locale, referrer host, country (from Netlify geo header if available), daily-rotating hashed visitor id, timestamp. No cookies, no raw IPs.
- **AuditLog**, **RateLimit** (TTL index).

Create indexes appropriately (unique slug, TTL on rate-limit and expired tokens).

## 5. Public site: pages and behavior

Locale-prefixed routes, server-rendered with ISR/on-demand revalidation. **When the admin saves anything, call `revalidateTag`/`revalidatePath` so visitors see changes immediately** without a redeploy.

- `/` — Hero (name, tagline, photo, CTA buttons: *View work*, *Download CV*, *Contact*), short about, featured projects, skills highlights, latest works in progress, quick links to each section. Sections respect `SectionConfig` visibility and order.
- `/philosophy` — Work Philosophy.
- `/originality` — Statement of Originality (also shown as a compact notice in the footer).
- `/cv` — On-page CV rendered from structured data (education, experience, skills, languages), with **Download PDF** and **Print** buttons.
- `/projects` and `/projects/[slug]` — filter by tag/status; case-study layout; AgriPrice GH featured.
- `/in-progress` — works in progress with status, progress notes and target dates.
- `/academics` — plan of study: timeline or table of completed, current and planned courses.
- `/references` — shows names, roles and testimonials where allowed; contact details behind **Request access**.
- `/contact` — validated form, social links, email.
- `/request-access` flow (modal or page) used for transcript, references and any `on_request` document.
- Custom 404, `robots.txt`, `sitemap.xml`, JSON-LD `Person` schema, Open Graph images per page (generated with `next/og`), RSS not needed.
- **Accessibility:** WCAG 2.2 AA, semantic landmarks, keyboard navigation, visible focus, alt text, sufficient contrast even on glass surfaces. Target Lighthouse ≥ 95 on all four categories.
- **Performance:** `next/image`, font subsetting (`next/font`), no layout shift, minimal client JS.

## 6. CV system (upload and download, both)

The owner wants both options. Implement:

1. **Structured CV (default source).** Built from Education, Experience, Skills, Languages and Profile data. Admin can choose which items appear on the CV (a per-item "Include in CV" toggle) and pick a template (provide two: *Sidebar* matching the existing navy sidebar look, and *Clean single-column*). The PDF is generated on demand by a route handler at `/api/cv/[locale]` and is **always fresh**: no stale cached file after an edit. English and French versions are produced from the bilingual fields.
2. **Uploaded PDF.** Admin can upload their own PDF per language. A single setting, **"Active CV source"** (`generated` or `uploaded`), controls what visitors download. Keep up to 10 previous uploaded versions in a history list with restore.
3. `/cv` shows an inline preview (embedded PDF viewer or rendered HTML) plus the download button; the header also has a download button.
4. Track CV downloads (count only) in analytics.

## 7. Request-access workflow (privacy)

The owner chose to keep transcript and referee contacts hidden behind a request.

- Visitor submits name, email, organization, reason, and ticks what they want.
- Owner gets an email and sees it in **Admin → Requests**; can **Approve** (choose which items and expiry, default 14 days) or **Deny**.
- On approval the visitor gets an email with a **single-use or limited-use signed link** (random 32-byte token, store only the hash). The link opens a page showing the approved items; files are streamed through an authorized route and never exposed as public URLs.
- Owner can revoke a link at any time.

## 8. Admin CMS (`/admin`, English UI with an EN/FR content tab on every bilingual field)

- Login page, session timeout, logout everywhere.
- **Dashboard:** counts (visits last 7/30 days, top pages, CV downloads, unread messages, pending access requests), plus a "content health" checklist (missing French translations, no photo, no featured project).
- **Editors for every model above**, each with: list view with search, drag-and-drop reordering, show/hide toggle, duplicate, delete with confirmation, and a form with inline validation. Bilingual fields display EN and FR side by side, with an optional "Copy EN → FR" helper.
- **Rich text:** TipTap (or similar) with a minimal toolbar (bold, italic, lists, links, headings). Store as sanitized HTML or JSON.
- **Media library:** upload, preview, rename, alt text, delete; images are resized/optimized on upload.
- **Draft/Preview:** items can be saved as draft; "Preview as visitor" mode with a banner.
- **Section manager:** reorder/rename/hide sections; add custom sections.
- **Settings:** site info, theme default, SEO, privacy toggles, analytics on/off, change password, optional 2FA.
- **Backup:** "Export all content as JSON" and "Import JSON" (validated with Zod) so the owner can restore.
- Everything must work well on a phone.

## 9. Design direction: "Apple ice glass"

An Apple-style liquid-glass aesthetic with an icy palette.

- **Palette:** frosted whites, pale ice blues and silver-greys on light mode; deep navy-to-ink backgrounds with soft cyan/ice-blue glows on dark mode (nod to the navy CV). One accent colour (ice cyan, around `#7DD3FC`/`#38BDF8`) used sparingly. Define everything as CSS variables/design tokens so the owner can later change the theme in settings.
- **Surfaces:** translucent glass cards (`backdrop-filter: blur(20–30px) saturate(150%)`), 1px inner highlight borders, soft layered shadows, large radii (20–28px), subtle noise/grain, gradient "ice" light blobs drifting slowly in the background (CSS/canvas, paused for reduced motion). Provide a solid-colour fallback when `backdrop-filter` is unsupported and ensure text contrast stays ≥ 4.5:1.
- **Typography:** SF-like feel using **Inter** (or Geist) with tight tracking on large headings, generous whitespace, big confident hero type.
- **Motion:** gentle spring animations, parallax-lite on the hero, scroll reveal, hover lift on cards, shared-element transitions between project cards and case studies where practical. Everything respects reduced motion.
- **Layout:** sticky floating glass navbar with language switch (EN | FR), theme toggle (light / dark / system), and a CV download button. Mobile: bottom sheet-style menu.
- **Components to craft:** hero, glass cards, skill chips, vertical timeline (education/experience), project grid with filter pills, case-study page, stat tiles, accordion, toast notifications, skeleton loaders, polished empty states.
- Include a professional photo slot with a graceful placeholder (initials avatar) until the owner uploads one.

## 10. Seed data (from the owner's CV, with corrections)

Create `npm run seed` (idempotent) that fills the database. Fix the CV typos: **"Phyton" → "Python"**, **"Cameroun" → "Cameroon"** (keep the French wording appropriate in the `fr` field), and use the **new email**.

- **Name:** Fabrice Ihongui · **Location:** Accra, Ghana · **Nationality/flag:** Cameroon (show as "Cameroonian" only if the owner enables it).
- **Links:** GitHub `github.com/Ihongui` · LinkedIn `linkedin.com/in/fabrice-ihongui-21ab122b7`.
- **Profile text:** "Strategically minded professional in technology management, known for high productivity and efficient task completion. Skilled in cloud computing, cybersecurity, and project management. Excels at leadership, communication, and problem-solving to navigate complex challenges and drive team success." (Provide a French translation.)
- **Education:**
  - Bachelor of Science in Information Technology — University of Ghana, Accra (graduating Oct 2026)
  - Système et Réseau (SR) — L'Institut Africain d'Informatique (I.A.I.), Yaoundé (Oct 2018 – Oct 2020)
  - English Language — Language Wealth International, Tema (Jan 2022 – Aug 2022)
- **Experience:**
  - **Assistant IT Manager**, Solutec Ghana, Accra (Feb 2024 – May 2024): trained staff on new/updated technologies; maintained IT equipment and supplies inventory; performed regular maintenance checks on laptops, desktops and printers; implemented security measures to protect sensitive data from unauthorized access; installed and configured software to meet user requirements.
  - **Intern Lecturer**, L'Institut Africain d'Informatique (I.A.I.), Yaoundé, Cameroon (Jun 2020 – Oct 2020): organized exams and planned revision week; operated machinery and tools safely and efficiently; developed lectures for different learning styles; collaborated with other lecturers on course content and teaching policies; created a positive learning environment by engaging all students in class.
- **Skills:** Network troubleshooting, Project management, Information security, Analytical skills, Adaptability, Business development support, Network security, Team collaboration, Programming (Python, JavaScript, HTML5, CSS3, C#, .NET), Leadership, Communication, Problem-solving.
- **Languages:** French, English, Spanish (leave proficiency levels blank for the owner to fill in).
- **Hobbies:** Football, Music, Video editing.
- **Featured project — AgriPrice GH** (status: in progress or completed per owner's choice; default `in_progress` until the owner changes it):
  - Title: *AgriPrice GH: Smart Market Price Comparison Platform for Ghanaian Farmers*
  - Final-year project, University of Ghana (Department of Computer Science). A platform that lets farmers compare crop prices across markets, available through a **web app, SMS and USSD**. Uses price data from Ghana's Ministry of Food and Agriculture (MoFA SRID). Stack: React, Node.js/Express, MongoDB Atlas, Africa's Talking (SMS/USSD).
  - Live link: https://agripricegh.netlify.app/ (add a "Live demo" button; fetch an Open Graph screenshot if available, otherwise leave the cover for the owner to upload).
  - **Survey note (display as a callout on the project page, bilingual):** "Your feedback will be used only for academic purposes as part of this project and will be reported anonymously; your name will not be linked to your responses in the final report."
  - Leave the problem/approach/outcome fields with short placeholder text for the owner to complete.
- Create two **placeholder sample projects**, hidden by default, so the owner can see the editor in use.
- Create empty-but-visible sections for References and Academic Plan with a friendly "Coming soon" state (no fake data).
- `SectionConfig` defaults to the order listed in section 1.

## 11. Draft copy to seed (owner will edit)

Seed these as editable content, bilingual.

**Work Philosophy (EN):**
"I believe technology creates value only when it solves a real problem for real people. My approach combines careful analysis, secure and reliable engineering, and clear communication. Having worked across IT support, teaching and project coordination, I have learned that good systems depend as much on people and process as on code. I aim to build practical, secure solutions, keep learning every day, share what I know, and take ownership of the results. In the industry I hope to enter, I want to contribute to technology that is accessible, dependable and useful to communities, especially in Africa."

**Philosophie de travail (FR):**
« Je crois que la technologie ne crée de la valeur que lorsqu'elle résout un problème réel pour des personnes réelles. Mon approche allie analyse rigoureuse, ingénierie sûre et fiable, et communication claire. Ayant travaillé dans le support informatique, l'enseignement et la coordination de projets, j'ai appris que de bons systèmes reposent autant sur les personnes et les processus que sur le code. Je cherche à concevoir des solutions pratiques et sécurisées, à apprendre chaque jour, à partager mes connaissances et à assumer la responsabilité des résultats. Dans le secteur que je souhaite rejoindre, je veux contribuer à une technologie accessible, fiable et utile aux communautés, en particulier en Afrique. »

**Statement of Originality (EN):**
"I, Fabrice Ihongui, declare that the materials in this portfolio are my own work, or, where work was done in a group, that my individual contribution is clearly identified. Third-party material is credited. Some content, including project documents, references and academic records, is confidential. Please do not copy, reproduce or distribute any part of this portfolio without my written permission."

**Déclaration d'originalité (FR):**
« Je soussigné, Fabrice Ihongui, déclare que les documents présentés dans ce portfolio sont mon travail personnel ou, lorsqu'il s'agit d'un travail de groupe, que ma contribution individuelle y est clairement indiquée. Les éléments provenant de tiers sont cités. Certains contenus, notamment les documents de projet, les références et les relevés académiques, sont confidentiels. Merci de ne copier, reproduire ou diffuser aucune partie de ce portfolio sans mon autorisation écrite. »

Mark both as "Draft — review me" in the admin until the owner confirms.

## 12. Analytics

Lightweight, privacy-friendly, first-party: page views, unique visitors per day (hashed, rotating), top pages, referrers, country, CV downloads. Show charts in the admin dashboard. Respect Do Not Track. No cookie banner needed because no cookies are set for visitors; state this in a short privacy notice page (`/privacy`, bilingual).

## 13. Project structure and engineering standards

- Clear folders: `app/[locale]/(public)`, `app/(admin)/admin`, `app/api`, `components`, `lib` (db, auth, storage, validation, i18n, pdf), `models`, `scripts` (seed, admin:hash), `messages/en.json` and `fr.json`, `tests`.
- Cached Mongo connection helper suitable for serverless (reuse across invocations; avoid connection storms on Atlas free tier).
- ESLint + Prettier + Husky/lint-staged; GitHub Actions CI (type-check, lint, unit tests, build).
- Environment variables documented in `.env.example`: `MONGODB_URI`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `NETLIFY_BLOBS` settings, optional Turnstile keys.
- Error boundaries, structured logging, friendly error pages.

## 14. Deliverables

1. Complete working code in the repo, with `README.md` containing: local setup, how to create the Atlas cluster user and IP allow-list (Netlify needs `0.0.0.0/0` on the free tier, so also enforce a strong DB password), how to generate the admin password hash, how to seed, and how to deploy on Netlify (`netlify.toml`, env vars, build command).
2. `ADMIN_GUIDE.md` written for a non-developer, step by step with the exact menu names: how to edit each section, upload/replace the CV, switch CV source, approve access requests, add a project, export a backup. Include a short French/English content-editing tip.
3. `DECISIONS.md` listing assumptions and trade-offs.
4. A post-build checklist: Lighthouse and axe results, security checklist (headers, rate limits, injection tests), and what I still need to provide (photo, real projects, references, transcript, French review).

## 15. Phases (commit after each)

1. Project scaffold, tooling, design tokens, i18n routing, Mongo connection, CI.
2. Models, Zod schemas, seed script, auth and middleware, security headers.
3. Admin CMS (all editors, media library, section manager, settings, backup).
4. Public pages and the glass design system, SEO, accessibility.
5. CV system (structured PDF, upload, active-source switch, history).
6. Request-access workflow, contact form, email.
7. Analytics and dashboard.
8. Tests, performance and security pass, docs, Netlify deployment config.

Start with Phase 1 now. After each phase, summarize what was done and what the owner should check, then continue.
