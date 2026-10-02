# Uttaradit Procurement Hub

## Production source of truth

- Primary Hub: `https://uttaradit-procurement-hub.pages.dev`
- Source repository: `manoosaki65-rgb/uttaradit-procurement-hub`
- Cloudflare Pages project: `uttaradit-procurement-hub`
- Production branch: `cloudflare-migration`
- `main` is preview only. Do not switch the production branch to `main`.
- Cloudflare Pages auto-deploys each commit pushed to `cloudflare-migration`.

## Verified Cloudflare Pages build configuration

- Build command: `npm run build`
- Build output directory: `out`
- Root directory: repository root

These values are the current Cloudflare Pages project configuration and should not be changed unless a future migration explicitly requires it.

## Normal ChatGPT maintenance workflow

For future Hub changes, normal ChatGPT chat should use the connected GitHub and Cloudflare Uttaradit tools directly:

1. Read the current source from GitHub on `cloudflare-migration`.
2. Make only the requested source change and commit it to `cloudflare-migration`.
3. Let Cloudflare Pages auto-deploy that commit.
4. Read the Cloudflare Pages production deployment and confirm the commit hash and deployment stage.
5. If deployment fails, inspect the Cloudflare deployment logs and report/fix the actual error. Retry only when appropriate.

The Cloudflare Uttaradit connection is authorized with OAuth Background Access and Pages Read/Write, so routine Hub maintenance should not require creating or copying a new API token each time. If the OAuth authorization itself is revoked or expires, the account owner may need to authorize the connection again.

## Safety / architecture rules

- Do not delete, reset, migrate, or write to the existing D1 database while doing Hub-only work.
- Do not create a replacement Cloudflare Pages project for routine Hub changes.
- Netlify, Hatchable, and `chatgpt.site` are not the primary Hub.
- The existing `chatgpt.site` URLs used by the Hub for hero images are asset dependencies only. Keep those asset references until a separate asset migration is explicitly requested.
- Do not modify unrelated menus, source files, services, or data when making a targeted Hub change.
- Preserve production data and existing working systems unless an explicit migration/change is requested.

## Current provincial contract-number target

The Hub's provincial contract-number menu points to:

`https://uttaradit-contract-number.manoosaki65.workers.dev/`

This is the current Cloudflare system. Do not restore the old Hatchable target.
