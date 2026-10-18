# Command-number: D1 deployment, 19 October 2026

Production remains https://uttaradit-procurement-hub.pages.dev/command-number in the existing `uttaradit-procurement-hub` Pages project, GitHub repository and `cloudflare-migration` branch. The existing `MEETING_DB` binding and `command_numbers` table remain authoritative for the web list. No database, Master or account was created. `/posting` source is unchanged.

## Completed backlog repair

The five already issued commands 10913–10917/2569, dated 18/10/2569, subject แต่งตั้งคณะกรรมการ, were missing from D1. Inserted only these five with `ON CONFLICT(id) DO NOTHING`; readback confirms one visible, available record each. After the additive schema upgrade, total rows remain 463 (458 visible, 5 previously hidden). No provincial number was issued during this work.

## Application and API

- Manual range input no longer requires clicking the provincial booking button. Supports 1–30 records, validates real Buddhist calendar dates and expected count, inserts missing rows only, reads them back before confirming success.
- Explicit number arrays preserve gaps in Extension results. Retry retains the exact batch and never opens the provincial site.
- Existing rows, subjects, assignees, states, hidden rows and dates are not reset by repeated import. Hidden/date conflicts return 409.
- Search supports numbers, subjects, assignees, `10913/2569`, and `10913-10917/2569`; no old 500-row truncation.
- Reservation uses a conditional SQL update on available state and revision. Only the existing verified principal may claim in their own name; only its owner may mark the reservation used. Concurrent attempts cannot both succeed.
- Additive migration adds reservation timestamps, owner ID, revision and Master sync metadata to the existing table, plus a unique number/year index. No existing rows were deleted.

## Authentication limitation: production is read-only

Inspection found no Hub staff session/middleware for this API. The Cloudflare Access API reports Access is not enabled. Links to other applications and `/posting` access codes are not verified staff identities for command-number.

Per the user's instruction, no login, accounts or new session mechanism is created. `command-auth.js` accepts only a principal already verified by server-side Hub middleware (`context.data.hubUser`). No such middleware is currently connected, so `/api/command-numbers?action=session` returns `readOnly:true`; POST/PATCH return 401 without changes. UI save/retry/reservation buttons remain disabled. Request bodies, headers and chosen names cannot bypass this check. Connecting the actual existing identity provider is still required before enabling writes on production.

The form and authorized mutation logic are tested; this is not a claim that users can currently save or reserve through production without their existing identity connection.

## Google Master limitation

The exact linked existing file ID is `1iAHRf2Wj2T6r03325nZyfuqg6gFqzOxG`, metadata reports `ออกเลขจังหวัด.xls` (Excel, not native Google Sheets). There is no command-number write adapter configured in Pages; Google Drive file-content read subsequently failed with a closed connector transport. No Master was replaced, converted or created. The code does not treat D1 persistence as proof of Google Master synchronization.

Master synchronization metadata is explicit. The optional adapter must return readback of the same file and matching rows/revisions before `masterVerified:true`; it has not been configured or live-tested.

## Validation

Ten in-memory SQLite/API tests cover thirty-row import, reload/readback, duplicate retries, preserving used rows, same-number concurrent claims, role/owner validation, unauthenticated rejection, date/count checks, gapped results and search beyond 500 records. TypeScript transpilation reports no syntax errors. The existing Cloudflare build command runs these tests before building/publishing. Extension tests are separate and do not issue real numbers.

Live validation must confirm the original URL renders, the backlog search returns exactly five rows after refresh, anonymous writes stay blocked, and counts of pre-existing rows stay intact. No synthetic thirty-number batch is inserted into production to test the form.
