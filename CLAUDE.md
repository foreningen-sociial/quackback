# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repo is

`foreningen-sociial/quackback` — a fork of the open-source feedback/roadmap/
changelog platform [`QuackbackIO/quackback`](https://github.com/QuackbackIO/quackback),
self-hosted for Socii at `forslag.socii.dk`. **Read `FORK.md` before making
any change here** — it documents the branch structure (`main` → `socii` →
`theme`, plus short-lived feature/fix branches PR'd into `main`), the
workflow for pulling in upstream updates, and the deploy process. This
CLAUDE.md assumes you've read it.

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
- **`main` is this fork's own trunk, not an upstream mirror.** That changed
  partway through this fork's life — `main` used to be a pure, untouched
  mirror of `upstream/main`. It no longer is: fixes get merged into it via
  ordinary GitHub PRs *within this fork* (e.g. `fix-pagination-guard` →
  `main`, PR #1). Don't assume `main` matches `QuackbackIO/quackback` — check
  `FORK.md`'s Workflow section before relying on that.
- **Don't commit directly to `main`.** Branch off it, do the work, open a PR
  back into it (base branch `main`, in this fork) so it goes through review
  like anything else, then merge and delete the branch.
- **Keep Socii-only changes off short-lived feature/fix branches.** Anything
  deployment-specific (docker-compose overrides, ops config) belongs on
  `socii`/`theme`, never mixed into a branch meant to merge into `main` (or,
  down the line, to be offered upstream) — keep those diffs minimal and
  reviewable on their own terms.
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
  (`apps/web/src/components/ui/time-ago.tsx`), not in the locale file. This
  kind of app-wide fix is a good candidate for its own small branch merged
  the same way `fix-pagination-guard` was — see `i18n-da` for the actual
  commit.
- **When translating/editing `da.json`**, preserve `{placeholder}` tokens
  and ICU `{count, plural, one {…} other {…}}` blocks exactly — only the
  literal text inside changes. If asked to rename a term (e.g. "roadmap" →
  "udviklingsplan"), grep for *every* occurrence of that concept across the
  catalog and update them consistently — a term translated one way in the
  nav and another way in an error message reads as a bug, not a choice.
- **React Query cache patchers: check for key-prefix collisions, not just
  falsy guards.** A `setQueriesData({ queryKey: someKeys.lists() }, updater)`
  call matches *every* cached query whose key starts with that prefix — not
  just the one you have in mind. `inboxKeys.facetCounts()` is deliberately
  nested under `inboxKeys.lists()` (so invalidating the list also refreshes
  counts), which meant `updatePostInLists()`'s broad `setQueriesData` also
  matched the facet-counts entry — a plain, non-paginated object — and ran
  `old.pages.map(...)` on it. `if (!old) return old` is not enough; the real
  guard needs to confirm the matched entry is actually the shape you expect
  (e.g. `Array.isArray(old.pages)`), since "truthy" and "the shape I'm
  assuming" are different claims. This class of bug is invisible to a
  straightforward grep for missing null-checks — it only shows up once you
  trace which OTHER queries share a key prefix with the one you're patching.
