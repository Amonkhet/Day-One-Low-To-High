# Day One — HCI Visual Report

An English-language interactive visual report covering Low-Fi, Wireframe, Initial Hi-Fi, usability evaluation and design recommendations, and final interface designs.

## Local development

Requires Node.js and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm run build
npm run preview
```

## Project structure

- `src/chapters/`: report sections and content
- `src/motion.js`: scroll animations and interactions
- `src/style.css`: layout and presentation
- `src/findings.js`: research findings and severity
- `public/assets/`: supplied design screenshots
- `asset-map.md`: asset provenance and scene mapping

Built with HTML, CSS, JavaScript, Vite and GSAP ScrollTrigger. Narrow viewports and reduced-motion preferences have reading-oriented fallbacks.

## Research and assets

Research summaries derive from the supplied Usability Evaluation Report. Findings, participant counts and severity ratings are distinct from proposed refinements. No follow-up validation is claimed. Source design assets remain unchanged.

Integration placeholders are provided for the other team members’ chapters. The repository does not include the original evaluation PDF, dependency installation, build output or historical preview screenshots.

## Sharing

Uploading this project to GitHub stores the source; it does not automatically publish a live website. Deployment can be configured separately.
