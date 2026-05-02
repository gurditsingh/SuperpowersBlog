# Superpowers Blog Redesign Design

Date: 2026-05-02
Project: SuperpowersBlog
Goal: Redesign the existing static GitHub Pages site so it looks polished, uses left-side navigation, works well on mobile, and explains Superpowers spec-driven development as the primary subject.

## 1. Problem Statement
The current site is functionally complete but visually basic and too centered on the Databricks example. The redesigned site must feel like a credible technical console for Superpowers, while making the Superpowers lifecycle, skills, artifacts, and quality gates easier to understand.

## 2. Primary Design Direction
Use a **Superpowers Lifecycle Console** visual direction:

- Professional data-platform feel without presenting the site as a Databricks tutorial.
- Fixed left navigation on desktop.
- Mobile hamburger drawer navigation.
- Superpowers-first content hierarchy.
- Databricks used only as a recurring example, such as "build an ingestion pipeline."

The design should be attractive, modern, and technical. It should not use generic purple gradients or decorative filler.

## 3. Verified Superpowers Lifecycle
The site must use the verified Superpowers lifecycle as the main structure:

1. Brainstorm / Design
2. Specification
3. Workspace Isolation
4. Implementation Planning
5. Execution
6. Test-Driven Development
7. Systematic Debugging
8. Code Review
9. Verification
10. Branch Completion

This lifecycle replaces the earlier Phase 0-9 framing. Page labels, navigation, homepage lifecycle graphics, simulation copy, and artifacts framing must use this structure.

## 4. Content Strategy
The site is about Superpowers and spec-driven development for coding agents.

Each lifecycle stage page should explain:

1. What the stage does
2. Which Superpowers skill or skills apply
3. What artifact, decision, or evidence the stage produces
4. What failure mode the stage prevents
5. A small practical example using an ingestion pipeline

Databricks concepts may appear in examples only. For example:

- Brainstorming example: "Need to build an ingestion pipeline."
- Specification example: define expected bronze-to-silver behavior.
- TDD example: write a failing schema validation test first.
- Verification example: run fresh tests before claiming the pipeline is complete.

No page should read as a Databricks product tutorial.

## 5. Navigation Design
### Desktop
- Use a fixed left sidebar around 280px wide.
- Sidebar includes:
  - site title
  - primary links: Overview, Playground, Sample Spec Package
  - 10 lifecycle stage links in order
  - active page indicator
- Main content sits to the right of the sidebar.
- Skip links and `main-content` landmarks must continue to work.

### Mobile
- Use a compact top bar with site title and hamburger button.
- Hamburger opens a left drawer.
- Drawer overlays the page with a dismissible backdrop.
- Links must be large enough for touch.
- Body should not horizontally scroll.

All links and assets must remain GitHub Pages-safe relative paths.

## 6. Visual System
Use a professional console-like style:

- Deep ink text
- White and near-white content surfaces
- Teal accents for lifecycle progress and active states
- Controlled orange highlights for caution, quality gates, and feedback loops
- Blue-gray borders and muted backgrounds
- Sharp panels with 6px-8px radius
- Clear focus states
- Responsive grids that collapse cleanly on mobile

Typography should feel technical and readable. CDN fonts or icons are allowed if they work on GitHub Pages and degrade gracefully.

## 7. Page-Level Requirements
### Overview Page
The homepage must present:

- Superpowers value proposition
- Why spec-driven development matters for coding agents
- Hybrid lifecycle graphic:
  - linear path from Brainstorm / Design to Branch Completion
  - feedback loops from Systematic Debugging, Code Review, and Verification back to Specification or Planning
- CTA to Sample Spec Package
- CTA to Playground

### Lifecycle Pages
Each lifecycle page must use the new structure:

- stage heading and summary
- skill mapping
- artifact/evidence output
- failure mode prevented
- ingestion pipeline example
- links to related lifecycle stages where useful

### Playground
The playground becomes a Superpowers lifecycle walkthrough:

- Inputs describe a software task, using ingestion pipeline as the default example.
- Stepper follows the 10 verified lifecycle stages.
- Generated views should be framed as Superpowers outputs, not Databricks architecture outputs.
- Existing deterministic behavior should remain.

### Sample Spec Package
The artifacts page becomes a Superpowers-created sample package:

- Databricks ingestion pipeline is the sample project.
- The page emphasizes how Superpowers creates and validates artifacts.
- Artifact sections should connect back to lifecycle stages.

## 8. Technical Constraints
- Static GitHub Pages site only.
- Plain HTML/CSS/JS remains acceptable.
- CDN fonts/icons are allowed, but the site must remain usable if the CDN fails.
- No backend.
- No live AI API.
- Preserve existing tests and add tests for:
  - left-navigation links
  - mobile drawer controls in markup/rendering
  - lifecycle stage labels
  - Superpowers-first content language
  - no root-relative URLs

## 9. Acceptance Criteria
1. All navigation is left-side on desktop.
2. Mobile navigation uses a hamburger drawer.
3. The site uses the 10 verified Superpowers lifecycle stages.
4. Databricks is used only as an example, not the main site identity.
5. Overview page explains Superpowers, spec-driven development, and lifecycle feedback loops.
6. Lifecycle pages follow the required content structure.
7. Playground and artifacts pages are reframed around Superpowers outputs.
8. Site remains responsive on mobile and desktop.
9. Existing functional tests pass.
10. New tests prove the redesign requirements.

## 10. Risks and Mitigations
1. Risk: The redesign becomes visually attractive but content remains confusing.
   - Mitigation: Treat the lifecycle structure as the content backbone and test for required labels/content.
2. Risk: Left navigation hurts mobile usability.
   - Mitigation: Use a drawer pattern and test that controls exist across pages.
3. Risk: Databricks example overwhelms Superpowers messaging.
   - Mitigation: Rewrite page copy so every Databricks mention supports a Superpowers concept.
4. Risk: Large CSS rewrite causes regressions.
   - Mitigation: Keep layout classes reusable and preserve existing path/navigation tests.
