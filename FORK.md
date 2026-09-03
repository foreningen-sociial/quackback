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
main ──────────────────────────────────────────────► (pure upstream mirror)
  └── i18n-da ──────────────────────────────────────► (Danish locale, PR-bound)
        └── socii ────────────────────────────────► (+ Socii ops config, DEPLOYED)
              └── theme ──────────────────────────► (+ Socii visual reskin)
```

- **`main`** — kept as an exact mirror of upstream `main`. Never gets local
  commits directly; only fast-forwarded from `upstream/main`. This is the
  base every other branch eventually rebases onto.

- **`i18n-da`** — the Danish (`da`) locale: the full UI string catalog
  translation (`apps/web/src/locales/da.json`) plus the small set of source
  changes needed to register it (`SUPPORTED_LOCALES` in
  `apps/web/src/lib/shared/i18n.ts`, `WIDGET_LOCALE_LABELS`, the four
  help-center locale-picker components) and the `TimeAgo` component fix that
  makes relative timestamps ("2 days ago") respect the active locale instead
  of always rendering English (fixes this for every non-English locale
  upstream ships, not just Danish).

  This branch is meant to be **PR'd back to `QuackbackIO/quackback`**
  eventually — kept deliberately free of anything Socii-specific so the diff
  stays clean and mergeable. Rebase it onto `upstream/main` periodically
  (see Workflow below) rather than letting it drift, since conflicts get
  harder to resolve the longer it goes unrebased.

- **`socii`** — `i18n-da` plus deployment-only changes that will never go
  upstream:
  - `docker-compose.prod.yml`: binds the app's published port to `127.0.0.1`
    only (nginx on the host terminates TLS and reverse-proxies in).
  - `docker-compose.local.yml`: override file pinning the `app` service to a
    locally-built image tag instead of the upstream `ghcr.io` image, needed
    until `i18n-da` lands upstream and ships in an official release.

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

## Workflow: pulling in upstream updates

Do this periodically, and always before starting new work on `theme` (a short
branch is much cheaper to rebase than one with weeks of accumulated commits):

```bash
git fetch upstream
git checkout main && git merge --ff-only upstream/main && git push origin main:main

git checkout i18n-da
git rebase upstream/main            # resolve any conflicts
git push --force-with-lease origin i18n-da:i18n-da

git checkout socii
git rebase --onto i18n-da <old-i18n-da-tip> socii
git push --force-with-lease origin socii:socii

git checkout theme
git rebase --onto socii <old-socii-tip> theme
git push --force-with-lease origin theme:theme
```

The `--onto` rebases (rather than plain `git rebase <branch>`) are
deliberate: a plain `git rebase i18n-da` while on `socii` re-diffs against
the merge-base of *old* `socii` and *new* `i18n-da`, which re-plays commits
that are already incorporated and produces spurious conflicts. `--onto`
tells git exactly which commits are unique to the branch being rebased.

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
out on `socii`), fronted by nginx + Let's Encrypt at `roadmap.socii.dk`.
Co-located on the same box (unrelated to Quackback): a Ghost blog and an
OpenProject instance for `foreningen-sociial.dk`.
