# About Author Page Design

## Goal
Add an `About` page to the static Superpowers blog that introduces the author as a Data Architect / Technology Architect while keeping the site centered on Superpowers spec-driven development.

The page should establish credibility for readers of the blog without turning the site into a full resume or consulting landing page.

## Scope

### In Scope
- Add a new root-level `about.html` page.
- Add `About` to the Primary section of the left navigation menu.
- Present an executive-concise author profile.
- Include a GitHub profile or project-work CTA.
- Reuse the existing static HTML/CSS/JS architecture and visual system.
- Preserve GitHub Pages compatibility with relative links and no build step.
- Add regression tests for navigation, page existence, content, and path safety.

### Out of Scope
- Full resume/CV page.
- Contact form.
- Email or LinkedIn exposure unless added later by explicit request.
- New backend, build tooling, analytics, or external dependencies.
- Changing the Superpowers lifecycle content or Databricks sample pages.

## Content Strategy
The About page should read as an author profile for the Superpowers blog.

Primary positioning:
- Data Architect / Technology Architect.
- 12 years of experience.
- Enterprise data engineering, cloud migration, and modern data platform design.
- Experience with ETL frameworks, lakehouse solutions, cloud-native data pipelines, migration strategies, big data ecosystems, and open table formats.
- AI Engineering included as a current capability area.

The page should mention Databricks as one platform within the author's broader architecture background, not as the main subject of the site.

## Page Structure

### Hero
- Kicker: `About the Author`.
- Title: concise architect-focused heading.
- Goal paragraph: summarize the author's role and connection to practical spec-driven delivery.

### Profile Summary
A short paragraph covering:
- 12 years of enterprise data and architecture experience.
- Data engineering and cloud migration.
- Modern data platforms and scalable ETL.
- Practical focus on reliable, governed, production-ready delivery.

### Capability Grid
Show the high-level experience points as scan-friendly cards or chips:
- Data Architecture & Platform Design
- Cloud Data Engineering
- ETL Modernization
- Big Data & PySpark
- Databricks & Lakehouse
- Data Migration
- Data Quality & Validation
- Orchestration & Operations
- Database & SQL Expertise
- AI Engineering

### Platform Experience
Include a concise platform list:
- AWS
- Databricks
- Snowflake
- Oracle
- SQL Server
- Big data ecosystems
- Open table formats

### GitHub CTA
Add a small CTA section that sends readers to GitHub/project work.

The initial implementation will link to `https://github.com/gurditsingh`, derived from the existing repository owner.

## Navigation
`About` must appear in the Primary section of the left menu panel with Home, Artifacts, and Simulation.

Expected navigation order:
1. Home
2. About
3. Artifacts
4. Simulation
5. Lifecycle pages

The current page should receive `aria-current="page"` when `about.html` is active.

## Visual Design
The page should reuse the existing Lifecycle Console visual system:
- Same left sidebar and mobile drawer behavior.
- Same content width, card language, typography, and responsive grid patterns.
- Use existing CSS components where possible.
- Add only small reusable CSS utilities if the current components cannot express the profile/capability layout cleanly.

## Accessibility
- Include skip link and `main-content` landmark.
- Use semantic headings in order.
- Ensure CTA is a real link with clear text.
- Preserve keyboard navigation and mobile drawer behavior.
- Avoid icon-only or color-only meaning.

## GitHub Pages Compatibility
- Use root-relative-to-page links such as `assets/styles.css`, `assets/app.js`, and `./about.html` where appropriate.
- Do not use absolute root paths such as `/assets/...`.
- No build step or package dependency.

## Testing
Add or update tests to verify:
- `about.html` exists.
- `about.html` includes the shared navigation root, skip link, `main-content`, stylesheet, and script.
- `assets/data/site.json` includes `About` in the Primary page group/order.
- Generated navigation includes About and marks it current on `about.html`.
- The page content includes the architect profile, 12 years of experience, key capability areas, platform list, and GitHub CTA.
- Existing relative path safety tests cover the new page.

## Success Criteria
- About page is visible from the Primary section of the left menu.
- Page content is concise and credibility-focused.
- Site remains Superpowers-first.
- All static-site tests pass.
- `node --check assets/app.js` and `git diff --check` pass.
