# Decisions

- The workspace initially contained only `PORTFOLIO_BUILD_PROMPT.md`, with no application source, assets, dependencies, or Git history. This project is a new scaffold, not an incremental repair of the previous build.
- The prompt's supplied email is used as the public contact and suggested admin email: `ihonguifabrice1@gmail.com`.
- AgriPrice GH is seeded as `in_progress`, with placeholder case-study fields and two hidden sample projects.
- References and the academic plan start without fabricated reference/course records. The public academic page includes only the supplied University of Ghana degree.
- Locale URLs always include `/en` or `/fr`; the root redirects to `/en`.
- A generic bilingual `Content` record supports initial edits in one editor to keep the first scaffold maintainable. It does not replace all requested model-specific CMS controls.
- MongoDB and email credentials are kept in environment variables. Deployment and seed steps need the owner to supply Atlas and Resend credentials.
- The CSP is generated per request with a nonce in middleware so Next scripts do not require `unsafe-eval`. Inline styles remain allowed for inline style attributes used by the React layout.
- The specified commit-per-phase workflow cannot be fulfilled because this folder is not a Git repository.
