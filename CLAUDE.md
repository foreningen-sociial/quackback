# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repo is

`foreningen-sociial/quackback` — a fork of the open-source feedback/roadmap/
changelog platform [`QuackbackIO/quackback`](https://github.com/QuackbackIO/quackback),
self-hosted for Socii at `roadmap.socii.dk`. **Read `FORK.md` before making
any change here** — it documents the branch structure (`main` → `i18n-da` →
`socii` → `theme`), the rebase workflow for pulling in upstream updates, and
the deploy process. This CLAUDE.md assumes you've read it.

Everything else — architecture, stack (TanStack Start + Bun + Postgres),
conventions — is upstream Quackback's own; there is no Socii-specific fork
of that knowledge to maintain separately. Read the actual source when you
need it.

## Working conventions specific to this fork

- **Git identity**: commit author email must be `mogensfrom@gmail.com`, not
  whatever a global git config defaults to. Set it repo-locally
  (`git config user.email mogensfrom@gmail.com`) in any fresh clone before
  committing — this is a Socii-specific requirement, not this machine's
  general default.
- **Never commit to `main`** except a fast-forward merge from
  `upstream/main`. If you're about to add a commit and you're on `main`,
  stop — you almost certainly want `i18n-da`, `socii`, or `theme`.
- **`i18n-da` stays upstream-PR-clean.** Anything Socii-specific (deploy
  config, branding source changes if the admin UI ever isn't enough) goes on
  `socii`/`theme`, never on `i18n-da` — that branch's whole purpose is being
  mergeable into `QuackbackIO/quackback` with a minimal, reviewable diff.
- **Branding/theme is data, not code.** Colors, fonts, and the logo are
  configured through the app's own Settings → Portal admin UI and persisted
  in Postgres (`settings.branding_config`/`custom_css`, logo/favicon S3
  keys) — don't hand-patch Tailwind/CSS source for a branding tweak; use the
  admin UI (or its underlying API/DB row, if scripting it) instead. This is
  precisely why `theme` has stayed commit-identical to `socii`: no source
  diff was needed for the reskin.
- **A locale/component/source change needs an image rebuild to reach
  production** — the deployed container isn't the stock `ghcr.io` image.
  `FORK.md`'s "Deploying a change" section has the exact steps. Don't forget
  to bump `docker-compose.local.yml`'s tag and commit that alongside the
  source change, or the next `git pull` on the server won't tell anyone the
  running image is now stale.
- **Localizing something app-wide, not just Danish**: check whether the bug
  is generic before assuming it's a `da.json` gap. Example: the "x days ago"
  timestamps were rendering in English on *every* non-English locale
  upstream ships (de/fr/es/ar/ru/pt-br/zh-cn/zh-tw too), not just Danish —
  the fix belonged in the shared `TimeAgo` component
  (`apps/web/src/components/ui/time-ago.tsx`), not in the locale file, and
  is exactly the kind of fix `i18n-da` exists to carry back upstream.
- **When translating/editing `da.json`**, preserve `{placeholder}` tokens
  and ICU `{count, plural, one {…} other {…}}` blocks exactly — only the
  literal text inside changes. If asked to rename a term (e.g. "roadmap" →
  "udviklingsplan"), grep for *every* occurrence of that concept across the
  catalog and update them consistently — a term translated one way in the
  nav and another way in an error message reads as a bug, not a choice.
