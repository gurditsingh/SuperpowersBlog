# SuperpowersBlog

Interactive blog project for Superpowers spec-driven development.

## Purpose

A static GitHub Pages site that explains Superpowers spec-driven development for coding agents. Databricks appears as a sample ingestion-pipeline project used to illustrate each Superpowers lifecycle stage.

## Local Verification

Run the static-site regression checks before publishing:

```sh
node --test tests/nav.test.js
node --test tests/content.test.js
node --test tests/simulation.test.js
```

## Local Preview

Run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html`.

## GitHub Pages Publishing

1. Push this branch and merge it to `main` when verification passes.
2. In the repository settings, configure GitHub Pages to publish from the branch root.
3. Keep all links and assets relative with safe forms such as `./...`, `../...`, or bare relative paths like `assets/...`; do not use root-relative paths like `href="/..."` or `src="/..."`.
