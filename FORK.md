# This fork

`foreningen-sociial/quackback` is a fork of [`QuackbackIO/quackback`](https://github.com/QuackbackIO/quackback),
maintained for Socii's self-hosted feedback/roadmap/changelog instance. This
file documents the branch structure and workflow — nothing here is upstream
Quackback documentation (see `README.md`/`CONTRIBUTING.md` for that).

## Remotes

- `origin` → this fork. Push freely.
- `upstream` → `QuackbackIO/quackback`. **Fetch-only** — its push URL should
  be set to `DISABLED` (`git remote set-url --push upstream DISABLED`) as a
  guard against accidentally pushing here to the real upstream project.

## Branches

```
upstream/main (QuackbackIO/quackback, tracked but never merged into wholesale)
      ⇣ periodic rebase/merge, by hand, when we choose to pull something in
main ──────────────────────────────────────────────► (this fork's OWN integration
  │                                                     branch — receives PRs made
  │                                                     WITHIN this fork; diverges
  │                                                     from upstream by design)
  └── socii ────────────────────────────────────────► (+ Socii ops config, DEPLOYED)
        └── theme ──────────────────────────────────► (+ Socii visual reskin)

short-lived feature/fix branches (e.g. i18n-da, fix-pagination-guard):
  branch off main, PR back into THIS FORK'S main (not upstream), then
  get cherry-picked or rebased into socii/theme for deployment.
```

- **`main`** is **this fork's own integration branch**, not a mirror of
  upstream. This changed from the original design: `main` started out as a
  pure, untouched mirror of `upstream/main` (so pulling in upstream updates
  was always a trivial fast-forward), but we decided to merge fixes and
  features via ordinary GitHub PRs *within this fork* instead of sending
  them upstream — so `main` now permanently carries commits `QuackbackIO/quackback`
  doesn't have (e.g. the pagination-guard fixes merged via PR #1). Treat it
  as "our own trunk," not as something that should stay fast-forwardable
  from `upstream/main` — it won't, and that's intentional.

  Consequence: pulling in upstream updates is no longer a simple
  `git merge --ff-only upstream/main` (see Workflow below) — it's now a real
  merge/rebase of two histories that have diverged, done by hand, whenever we
  actively choose to pull something in.

- **`socii`** — `main` plus deployment-only changes that will never go
  anywhere else, upstream or otherwise:
  - `docker-compose.prod.yml`: binds the app's published port to `127.0.0.1`
    only (nginx on the host terminates TLS and reverse-proxies in).
  - `docker-compose.local.yml`: override file pinning the `app` service to a
    locally-built image tag instead of the upstream `ghcr.io` image (needed
    for as long as this fork carries any changes not yet in an official
    upstream release — which, with `main` as our own trunk, is indefinite).

  **This is what's actually deployed.**

- **`theme`** — `socii` plus the Socii.dk visual reskin (colors, fonts,
  logo). At the time of writing this is commit-identical to `socii`: the
  reskin was applied entirely through Quackback's own admin branding UI
  (Settings → Portal), which stores theme config as *data* in Postgres
  (`settings.branding_config`, `settings.custom_css`, logo/favicon S3 keys),
  not as code — so no source changes were needed for it, and none are
  expected unless the branding UI's built-in customization isn't enough for
  something and a source-level change becomes necessary. If/when that
  happens, those commits belong here.

- **Short-lived feature/fix branches** (`i18n-da`, `fix-pagination-guard`,
  and whatever comes next) — branch off `main`, do the work, open a PR
  *within this fork* (`foreningen-sociial/quackback`, base branch `main`) so
  it goes through the same review/merge UI as any other change, then delete
  the branch once merged. Cherry-pick or rebase the same commits into
  `socii`/`theme` to actually deploy them (`main` merging doesn't deploy
  anything by itself — see "Deploying a change" below).

  As of this writing: `fix-pagination-guard` has been merged into `main` via
  PR #1. `i18n-da` (the Danish locale) is still open — same process, still
  pending.

## Workflow: pulling in upstream updates

Since `main` is no longer a mirror, this is a deliberate, occasional action —
not something to run reflexively. Do it when there's a specific upstream fix
or feature worth having, or before starting substantial new work on `theme`
(a short gap since the last sync is much cheaper to reconcile than a long one):

```bash
git fetch upstream
git checkout main
git merge upstream/main        # or: git rebase upstream/main, if you'd rather
                                # replay our commits on top — either is fine
                                # now that main isn't required to fast-forward
# resolve any conflicts
git push origin main:main

git checkout socii
git rebase --onto main <old-main-tip> socii
git push --force-with-lease origin socii:socii

git checkout theme
git rebase --onto socii <old-socii-tip> theme
git push --force-with-lease origin theme:theme
```

The `--onto` rebases for `socii`/`theme` are deliberate: a plain
`git rebase main` while on `socii` re-diffs against the merge-base of *old*
`socii` and *new* `main`, which re-plays commits that are already
incorporated and produces spurious conflicts. `--onto` tells git exactly
which commits are unique to the branch being rebased.

## Deploying a change

Branding/theme *config* changes (colors, fonts, logo) go through the running
app's own admin UI — no deploy needed, no image rebuild, takes effect
immediately.

Anything else (locale catalog edits, component/source changes) needs an
image rebuild, since the deployed container doesn't run the stock upstream
image:

```bash
# on the server, in the socii checkout
git pull   # or fetch + reset --hard origin/socii after a rebase
docker build -t quackback-local:<new-tag> -f apps/web/Dockerfile .
# bump docker-compose.local.yml to the new tag, commit it
docker compose -f docker-compose.prod.yml -f docker-compose.local.yml up -d --remove-orphans
```

Build a new image under a new tag rather than overwriting the previous one
in place — keeps the previous, known-good image around to roll back to
without needing a rebuild.

## Where this runs

Landing box `204.168.196.134`, `/srv/sites/quackback` (this repo, checked
out on `socii`), fronted by nginx + Let's Encrypt at `forslag.socii.dk`
(moved from `roadmap.socii.dk` — the old domain's vhost and cert were fully
removed, not redirected). Co-located on the same box (unrelated to
Quackback): a Ghost blog and an OpenProject instance for
`foreningen-sociial.dk`.
