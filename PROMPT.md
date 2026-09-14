# Build prompt

Create a single-page, cinematic WebGL homepage for **Simples**（簡單行銷）, a Taipei marketing consultancy that works with AI and systems thinking. The page is a night walk up to the company's headquarters: a cyberpunk corporate tower on a wet plaza, rendered live in Three.js. It should feel like an editorial art book moving through a live 3D world, not a conventional product landing page — and every word on it should be the company's own services and story.

## Experience

- Use a fixed full-viewport Three.js canvas as the environmental layer.
- Build the plaza, the flight of stairs, a stepped three-tier tower of lit curtain wall, a neon gate, light pillars, avenue trees, a coral moon, a skyline of towers with lit windows, fog, rain, drifting data motes and falling leaves procedurally.
- Hang the company's signs on the tower as canvas-text planes: the vertical Chinese name in coral, the Latin wordmark in cyan, the tagline over the lobby. Let them buzz and drop frames like real neon; put a blinking aviation beacon on the spire.
- Drive one continuous camera path from page scroll. Each section should feel like a new composed shot rather than a hard scene replacement.
- Post-process with bloom, chromatic aberration, scan lines, film grain, vignette, violet shadows and coral highlights.
- Keep the palette violet-black, cold white, cyan neon `#22E6FF` and coral `#E5745C`.

## Layout and content

- Structure the page as hero, philosophy, work, services, creative engine, contact, and a manifesto footer — seven camera stops.
- Hero: the tagline 「讓每個好點子都可以落地。」, a one-line positioning statement, a four-item chapter index, a live preview window, a HUD with Taipei coordinates and the local time, and the giant wordmark standing in the grass in front of the tower.
- Philosophy: the meaning of the name, three tenets, four figures (founded, markets, client revenue, industries), and the six principles as a ticker.
- Work: three photographic case cards on cloth-simulated plates plus a ruled list of the public cases with verifiable numbers.
- Services: five services as an atlas of plates (who it is for, what you get) and the three engagement models.
- Creative engine, presented as the studio's own product: a 5-angle × 3-version production matrix that lights up cell by cell, the CPA/ROAS figures, six capabilities (brand system first, angles × versions, all formats, 48 hours, feedback loop, ownership), a six-step process, no prices.
- Contact: the 30-minute conversation, its three steps, and one call to action; the title set vertically in Chinese.
- Use large Chinese display type (Noto Sans TC), an Orbitron wordmark, JetBrains Mono technical labels, chapter numbers, fine rules and generous negative space.
- Layer alpha-preserving cut-outs at the foot of the active viewport; they arrive at full opacity, stay pinned while their section is active, then blur away on the handoff.

## Motion

- Reveal Chinese headings character by character, breaking lines only at punctuation; reveal supporting elements individually.
- Give each heading one brief chromatic split as it lands.
- Slow, precise section transitions, subtle parallax, eased camera interpolation.
- Let the navigation, chapter rail, cards and foreground layers respond to the active section.
- Include reduced-motion behavior that preserves the complete reading experience.

## Interaction and quality

- Custom cursor on fine pointers, cloth-simulated case cards that respond to the pointer, hover states that warm the scene's lights.
- Responsive down to phone width; the vertical title becomes horizontal, grids collapse, the near plane thins out.
- Adaptive resolution and a low-quality path for weak GPUs; a complete static fallback when WebGL is unavailable.
- No build step, no framework, one HTML document plus a vendored Three.js and web fonts.
