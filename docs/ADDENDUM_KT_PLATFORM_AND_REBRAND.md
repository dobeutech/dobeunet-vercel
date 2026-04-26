# Addendum: Platform Migration, Brand Evolution & CI/CD Overhaul

**To:** KT
**From:** Engineering (Jeremy / automated authoring)
**Date:** April 26, 2026
**Status:** Draft — pending your sign-off
**Scope:** `dobeutech/digital-wharf-dynamics` (dobeu.net)
**Branch:** `claude/migrate-netlify-to-vercel-iGkgt`

---

## 1. Why this addendum exists

We are consolidating three in-flight workstreams — the Netlify → Vercel migration, the v2.0 brand reboot (previously reverted in PR #85), and the CI/CD modernization — into a single coordinated release. This document is the brief I need you to sign off on before I push code. It supersedes the relevant sections of `DOBEU_STANDARDS.md` §2 (Build & Deployment) and §3 (Visual Design) and the Netlify-specific guidance in `NETLIFY_DEPLOYMENT.md` (which will be deleted on merge).

Total surface area: ~18 serverless functions, ~50 markdown docs, the Tailwind/CSS token layer, the GitHub Actions pipeline, and a handful of `src/` call-sites. No database migrations.

---

## 2. Phase 1 — Vercel becomes the production center

**What changes:**

- Add `vercel.json` (Vite framework preset, SPA rewrites, the `/es` and `/fr` lang rewrites, and every header from `netlify.toml` ported verbatim — CSP, HSTS, X-Frame-Options, asset cache-control, no-cache for HTML).
- Migrate all 18 handlers in `netlify/functions/*.ts` to `api/*.ts` using `@vercel/node` types (added to `devDependencies` in the same PR). Shared helpers (`_http.ts`, `_auth0.ts`, `_supabase.ts`) refactored once; per-function changes are mechanical (signature swap from `Handler` to `(req, res)`).
- Drop the `@netlify/functions` dependency. Delete `netlify.toml`, `netlify/`, `NETLIFY_DEPLOYMENT.md`, and Netlify language across ~20 docs and 6 source files.
- Vercel project bootstrap via `npx vercel link/deploy` using the `VERCEL_PAT` already present in our deployment environment. No Vercel UI clicks required from you.
- **Mandatory secret rotation, not transfer.** A scan during planning surfaced an exposed Netlify PAT committed in `NETLIFY_DEPLOYMENT.md` (line 14). All production secrets — Supabase service keys, Auth0 client secrets, Typeform, Stripe, Twilio, Intercom, Datadog, PostHog, and the Netlify PAT itself — will be rotated at the source provider before being seeded into the Vercel project. Rotation is a Phase 1 acceptance criterion; we do not pull existing values for parity. Anon/publishable keys (Supabase anon, Stripe publishable) are safe to reuse.

**Risk:** low. The function logic does not change; only the request/response shape adapter. CSP and security headers are preserved 1:1.

**Cutover:** DNS for `dobeu.net` flips after the first successful production deploy + smoke check. Netlify project remains warm for 7 days as rollback.

---

## 3. Phase 2 — Full brand evolution (your call drives this)

You asked for the "entire thing" rather than a tokenization of the existing kit. I want to be explicit about what that means and what I need from you.

**The current published kit** (`src/components/brand/sections/ColorSection.tsx`) is a high-saturation tech palette: Electric Lemon (#FACC15), Void Black, Stark White, Azure Tech (#3B82F6), Neon Rose (#EC4899), Deep Violet (#A855F7), Graphite, Muted Metal. The site only uses Lemon + a stray Tech Blue. The reverted v2.0 attempt (commit `2413575`) swapped the entire palette to indigo-on-navy with peach accents; it was reverted because it had no anchor in any documented kit.

**My recommended direction** — call it **Dobeu v3 "Harbor"** — and the rationale:

| Token | Light | Dark | Role |
|---|---|---|---|
| `--brand-deep` | `#0B1220` (near-black navy) | `#0B1220` | Primary surface, foundational |
| `--brand-signal` | `#FACC15` (Lemon, retained) | `#FDD835` | Primary CTA, single accent of color |
| `--brand-tide` | `#1F6FEB` (oceanic blue) | `#3B82F6` | Links, info, secondary CTA |
| `--brand-coral` | `#FF6B6B` | `#FF8A8A` | Destructive, urgency, "popular" badges |
| `--brand-mist` | `#F5F7FA` | `#1A2233` | Card / panel surface |
| `--brand-fog` | `#6B7280` | `#9AA3B2` | Muted text |
| `--brand-line` | `#E4E7EB` | `#27303F` | Borders, dividers |

Why this direction:
- **Retains Lemon** (recognizable equity carries forward; analytics show Lemon CTA conversion lifted last quarter).
- **Replaces** the Rose/Violet/Azure trio (which were declared but never used) with a tighter, more enterprise-credible blue + coral system. Two accents, not four — easier to enforce.
- **Narrative fit**: "Dobeu" → "do, be, you" → harbor/dock metaphor (also matches the repo name `digital-wharf-dynamics`). Justifies a serif display face paired with Inter for body copy.
- **Accessibility**: every pairing in the table above clears WCAG AA at body size. Lemon stays as fill/CTA only — never as text on white.

**Layout/system pass that ships with v3:**
- 8px grid enforced via Tailwind spacing scale audit.
- `EnhancedHero.tsx`: re-thought as a single-column statement with a Lemon underline accent and a left-aligned mark — drops the gradient text experiment from v2.
- `GlassmorphicHeader.tsx`: replaced with an opaque-on-scroll header (glassmorphism is a known a11y/performance liability per Lighthouse).
- `Pricing.tsx`: card system anchored on `--brand-mist` with a Coral "popular" badge and a Lemon CTA.
- `Footer.tsx`: deep-navy with Fog text; Lemon-only link hovers.
- BrandKit page (`src/pages/BrandKit.tsx`) becomes the canonical reference and reads tokens from CSS vars so swatches can never drift from production.

**What I need from you on Phase 2 (blocking):**

1. **Greenlight Harbor**, or counter-propose a direction. If you have a Figma file for an alternate palette, link it.
2. **Display typeface**: I'm proposing **Fraunces** (serif) for H1/H2, **Inter** for everything else. Approve, or specify alternates.
3. **Logo**: current Lemon-on-Black mark works against Harbor. Confirm we are *not* re-doing the logo this round.
4. **Tone of voice**: any updates to the v1 copy guidelines in `VoiceToneSection.tsx`? If yes, I'll need new microcopy from you for Hero and Pricing.

---

## 4. Phase 3 — CI/CD overhaul

Replace `ci.yml` with a single `pipeline.yml`:

- **Concurrency-keyed**, cancel-in-progress on the same ref.
- Parallel: `lint`, `type-check`, `unit-test` (with coverage upload), `build` (artifact uploaded).
- Sequenced after build: `e2e` (Playwright headless), `lighthouse-ci` (enforces `DOBEU_STANDARDS.md` §1 thresholds — perf ≥90, a11y ≥95, SEO ≥95), `bundle-size` (`size-limit`: 200KB gz initial JS, 1MB total page).
- All required for merge to `main`.

Additions:

- `vercel-deploy.yml` — preview on every PR (URL commented on the PR), production on `main` push, gated on `pipeline.yml` success. Smoke check `curl`s the live URL and asserts CSP + HSTS headers present.
- `dependabot.yml` — weekly npm + Actions updates.
- Husky pre-push: `type-check` added.
- Existing `security-scan.yml` (npm audit + gitleaks + CodeQL), `backup.yml`, `datadog-ci.yml` are kept untouched.

---

## 5. Phase 4 — Launch + feedback

After production deploy I will run automated post-launch checks: `WebFetch` against the live URL to verify titles/OG/sitemap/robots, `curl -I` for header verification, headless Playwright scripts for the contact form, Typeform, Intercom widget, mobile viewport, console-error count, and `@axe-core/playwright` for an a11y sweep. Findings land in `LAUNCH_REPORT.md` for your review.

**Honest limitation:** I cannot drive a real browser session from this environment, so the human-eyes pass is yours (or we install a Chrome MCP — a 30-minute setup if you want me to do real navigation in future cycles).

---

## 6. Decisions I need from you, in priority order

1. [ ] **Approve Harbor palette + Fraunces type pairing** (or counter-propose). *Blocks Phase 2 PR.*
2. [ ] **Confirm logo is out of scope** for this release.
3. [ ] **Confirm PR strategy**: I'm planning **three sequential PRs** (Phase 1, then 2, then 3) so reviewers can isolate concerns. Let me know if you want them combined.
4. [ ] **Approve the production secret rotation + env-var seeding** plan for Vercel (I'll list every secret to be rotated and confirm with you before any Vercel-side change).

---

## 7. Timeline once you approve

- Day 0 (approval): Phase 1 PR opened (Vercel migration). ~6 hr review window.
- Day 1: Phase 1 merged, production cutover, DNS swing.
- Day 2–3: Phase 2 PR opened (Harbor), screenshots in PR description for your visual review.
- Day 4: Phase 3 PR opened (CI/CD).
- Day 5: All merged, `LAUNCH_REPORT.md` delivered.

Netlify project decommissioned Day 12 (7-day rollback window after DNS swing).

---

**Reply with approvals on §6, and I'll start Phase 1 immediately.**
