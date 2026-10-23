# Admin guide

## Sign in

Open `/admin/login`, then sign in with the email in `ADMIN_EMAIL` and the password whose Argon2id hash is in `ADMIN_PASSWORD_HASH`. There is no public sign-up.

## Edit content

Open `/admin/content`, select a key or choose **New item**, then edit the English and French copy, order, visibility, and structured JSON. For projects, use `status` (`completed` or `in_progress`), `featured`, `stack`, `liveUrl`, `problem`, `approach`, and `outcome`. Save to publish; hidden items stay out of the public site.

## Manage files

Open `/admin/files`. Upload PDF files up to 5 MB or PNG, JPG and WEBP images up to 3 MB. Choose **Public** for portfolio media, **On approved request** for academic or reference records, and **Private** for files visible only to the admin. Public files have stable, cacheable links. On request files are delivered through expiring links. File deletion removes the stored object and its database record.

Netlify Blobs stores are named `portfolio-public` and `portfolio-private`. Use `netlify dev` for local Blobs support and configure Netlify Blobs on the deployed site. Resend must have a verified sender configured for approval email delivery.

## Review access requests

Open `/admin/requests`. Review the visitor, organization, reason, and requested categories. Approve only the categories you want to share and choose a 7, 14, or 30 day expiry. The emailed link contains a random token; the database stores only its SHA-256 hash. Each link allows up to 10 file downloads, and each download consumes one use. Revoke an approved link at any time. Denied requests cannot use a link.

## Contact messages and analytics

Use **Contact messages** to review messages saved in Atlas. The dashboard shows first-party page views and CV downloads. Reply using the sender’s email link and mark messages read after handling them.

## English and French

Write naturally in each language. The English and French fields are independent, so changes to one language do not overwrite the other.
