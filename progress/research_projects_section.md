# Research: Projects section in the Stitch mockup

- **Source:** `/tmp/opencode/stitch/screen.html` (72,028 bytes, 847 lines, UTF-8, Spanish content, light theme)
- **Thumbnail:** `/tmp/opencode/stitch/screen.png` (161x512 JPEG, only useful to confirm vertical order)
- **Nature:** static Tailwind-CDN mockup. Tailwind is compiled in the browser via `https://cdn.tailwindcss.com`; the projects section itself is **100% static HTML** (no images, no data arrays, no client-side rendering).

## 1. Example projects (4 cards: 1 flagship + 3 grid cards)

There are **no cover image URLs or background images**. Every "preview" is a hand-built HTML/CSS dark terminal panel (slate-900 / `#0f172a` surfaces with mono text). Links are placeholders: GitHub -> `https://github.com`, live -> `https://example.com`.

### 1.1 Synapse (flagship featured card)

- **Title:** `Synapse`
- **Description:** `Copiloto IA para desarrolladores con análisis semántico de Git y AST en tiempo real.`
- **Tech tags:** `Next.js`, `TypeScript`, `Tailwind`, `Claude API` (highlighted: `bg-primary/10 border-primary/25 text-primary`), `Tree-sitter AST`
- **Links:** source `https://github.com` (`title="Source Code"`, icon `code`) + live `https://example.com` (`title="Live Deployment"`, icon `arrow_outward`)
- **Status / badges:**
  - Pill `Arquitectura Destacada` with pulsing dot (`w-1.5 h-1.5 rounded-full bg-primary animate-pulse`)
  - Mono label `v1.4.2 Producción`
- **Preview panel (right half, `bg-[#0f172a]/95`, `h-64 md:h-72`):** window dots (rose/amber/emerald), filename `synapse-daemon.worker.ts`, badge `claude-3.5-sonnet:stream`, terminal line `> analyzing context: 14 pull requests & 38 diff hunks`, highlighted row `OPTIMIZED` + `Re-indexed 1,840 AST tokens in 42ms (latency -38%)`, gradient progress bar (`w-4/5`), footer `Clúster de Agentes Activo` / `99.98% precisión semántica`.

### 1.2 Aether Cloud

- **Title:** `Aether Cloud`
- **Description:** `Sincronización de estado en tiempo real en el edge con latencia global < 10ms.`
- **Tech tags:** `Go`, `Rust`, `WebSockets`, `Redis`
- **Links:** `https://github.com` (Source Code) + `https://example.com` (Live Deployment)
- **Preview panel (`h-44`):** node `edge-cluster-iad1` with emerald dot, badge `p99: 4.8ms`, three circular nodes `Clients`/`Mesh`/`Redis` (`sensors`, `hub`, `storage` icons) joined by gradient lines, footer `140k msg/s` / `Go / Rust`.
- **No status pill / version badge.**

### 1.3 Kortex Editor

- **Title:** `Kortex Editor`
- **Description:** `Editor colaborativo local-first impulsado por CRDTs y WebAssembly.`
- **Tech tags:** `React`, `Wasm`, `CRDTs`, `Canvas`
- **Links:** `https://github.com` (Source Code) + `https://example.com` (Live Deployment)
- **Preview panel (`h-44`):** doc tab `architecture.md`, badge `CRDT`, avatar stack `AV` `EM` `JR`, lines `# Topology Architecture`, `> Node CRDT reconciliation`, `Wasm rustc 1.78` (with pulsing caret), footer `Offline first` / `60 FPS sync`.
- **No status pill / version badge.**

### 1.4 Vanguard CLI

- **Title:** `Vanguard CLI`
- **Description:** `Herramienta CLI para auditorías de código y análisis de PRs con embeddings locales.`
- **Tech tags:** `Node.js`, `Rust CLI`, `Embeddings`, `Actions`
- **Links:** `https://github.com` (Source Code) + `https://example.com` (Live Deployment)
- **Preview panel (`h-44`):** header `vanguard @ audit` + `v2.4.0`, lines `$ vanguard review --strict`, `✔ AST parsed (48 files)`, `✔ Auth boundary safe`, `⚡ Changelog generated`, footer `24k downloads/mo` / `Zero deps`.
- **No status pill / version badge.**

## 2. Exact section markup

```html
<section
  class="py-24 scroll-mt-24 border-b border-indigo-200/35 animate-fade-in-up animation-delay-100"
  id="projects"
>
  <div class="flex flex-col gap-14">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <!-- header -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span
            class="font-label-sm text-label-sm tracking-[0.18em] text-primary uppercase font-medium"
            >Proyectos Seleccionados</span
          >
          <span class="h-px w-12 bg-primary/40"></span>
        </div>
        <h2
          class="font-headline-lg text-headline-lg text-slate-900 font-normal tracking-tight"
        >
          Proyectos con
          <span class="font-serif italic font-normal text-primary">visión</span>
        </h2>
      </div>
      <p
        class="font-body-md text-body-md text-slate-600 max-w-md font-light leading-relaxed"
      >
        Software escalable, arquitecturas cloud y soluciones de IA en
        producción.
      </p>
    </div>
    <div class="flex flex-col gap-8">
      <!-- cards wrapper -->
      <div
        class="flex flex-col rounded-2xl backdrop-blur-xl bg-white/45 border border-white/70 shadow-xl glass-card-hover p-7 md:p-8 group cursor-default"
      >
        ... featured ...
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ... 3 cards ...
      </div>
    </div>
  </div>
</section>
```

**Repeated card pattern (projects 2-4), exact class string:**

```
flex flex-col justify-between rounded-2xl backdrop-blur-lg bg-white/40 hover:bg-white/60 border border-white/60 hover:border-indigo-400/50 shadow-md glass-card-hover p-6 group cursor-default
```

Inside each card: preview panel (`relative w-full h-44 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3.5 overflow-hidden ...`) then `div.flex.flex-col.gap-2` with title row (`h3.font-headline-sm.font-serif` + link icons) and description (`p.font-body-md...font-light`), then a tag row:

```
flex flex-wrap items-center gap-1.5 pt-4 mt-4 border-t border-slate-200/50
```

with tag pill pattern:

```
font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-slate-700 hover:border-indigo-300 transition-colors
```

Featured card structure: `grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`, left = `lg:col-span-6` (meta/title/description/tags), right = `lg:col-span-6` preview. The featured tags use `px-3 py-1` and `shadow-sm` instead of `px-2.5 py-0.5`.

**Dynamically injected markup:** none. No `innerHTML`, `createElement`, `insertAdjacentHTML`, `data-project`, or template rendering. The only scripts are Tailwind CDN, the Tailwind config, the full-page WebGL shader background, and a toast/contact-form handler.

Icons come from Google's `Material Symbols Outlined` font: `code` x4, `arrow_outward` x4, `sensors`, `hub`, `storage`, `terminal`.

## 3. CSS that styles the section

No CSS variables (`--*`) and no `:root` tokens: colors/fonts are defined in the Tailwind config as literal hex values.

**Custom rule (the only project-specific glass CSS):**

```css
.glass-card-hover {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.62);
  border-color: rgba(129, 140, 248, 0.55);
  box-shadow:
    0 20px 42px -8px rgba(79, 70, 229, 0.14),
    0 0 24px -2px rgba(99, 102, 241, 0.16);
  transform: translateY(-3px);
}
```

`.glass-chromatic` is also defined (`background: rgba(255,255,255,0.42); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.65); box-shadow: 0 16px 38px 0 rgba(79,70,229,0.06), 0 2px 8px 0 rgba(15,23,42,0.03)`) but it is **not used by the projects section** (only defined once in the stylesheet).

**Entry animations used by the section:**

```css
@keyframes fadeInSlideUp {
  0% {
    opacity: 0;
    transform: translateY(18px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInSlideUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animation-delay-100 {
  animation-delay: 100ms;
}
/* reduced-motion override exists for all animations */
```

**Tailwind config tokens relevant to the section:**

```js
colors: { primary: "#3525cd", "primary-container": "#4f46e5", "on-surface": "#0b1c30", ... }
borderRadius: { lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", full: "9999px" }
fontFamily: {
  "headline-lg": ["Newsreader","serif"], "headline-md": ["Newsreader","serif"],
  "headline-sm": ["Newsreader","serif"], "body-md": ["Plus Jakarta Sans","Inter","sans-serif"],
  "label-sm": ["Plus Jakarta Sans","Inter","sans-serif"], ...
}
fontSize: {
  "headline-lg": ["2.5rem",  { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "400" }],
  "headline-md": ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.02em",  fontWeight: "400" }],
  "headline-sm": ["1.25rem", { lineHeight: "1.35", letterSpacing: "-0.015em", fontWeight: "500" }],
  "body-md":     ["0.875rem",{ lineHeight: "1.6",  letterSpacing: "-0.005em", fontWeight: "400" }],
  "label-sm":    ["0.6875rem",{ lineHeight: "1.2", letterSpacing: "0.06em",  fontWeight: "500" }]
}
```

Visual summary: cards are translucent white glass (`bg-white/40` -> `/45` featured, `backdrop-blur-lg`/`xl`), soft white borders, `rounded-2xl`, `shadow-md`/`xl`; hover = brighter white, indigo border, indigo glow shadow, `translateY(-3px)`. Page background is a fixed WebGL shader canvas over a `body` gradient (`from-[#f6f8ff]/85 via-[#f0f4ff]/80 to-[#eef2ff]/90`).

**Fonts in this section:** `Newsreader` (headings via `font-headline-*` / `font-serif`), `Plus Jakarta Sans` with `Inter` fallback (body, labels), and the **default Tailwind mono stack** via `font-mono` (12 usages for terminal/badges; this is NOT JetBrains Mono). **Space Grotesk, Geist and JetBrains Mono do not appear anywhere in this mockup.** Only Google Fonts `Inter`, `Newsreader`, `Plus Jakarta Sans` and `Material Symbols Outlined` are loaded.

## 4. Every image/asset URL referenced in the HTML

**There are no image files at all**: no `<img>`, no `background-image`, no `srcset`, no favicon/OG image, no base64 data URIs, no `.png/.jpg/.svg/.webp` asset paths. Project "covers" are inline HTML/CSS terminal mockups. Inline `<svg>` elements exist only as tech-stack icons in the `#tech-stack` section.

External references that a local build may want to remove/replace:

| URL                                                                                                               | Type       | Guessed purpose                                          |
| ----------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------- |
| `https://cdn.tailwindcss.com?plugins=forms,container-queries`                                                     | JS         | Tailwind runtime CDN (mockup-only; must not ship)        |
| `https://fonts.googleapis.com/css2?family=Inter...&family=Newsreader...&family=Plus+Jakarta+Sans...&display=swap` | CSS        | Text fonts (mockup fonts)                                |
| `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@...`                      | CSS        | Icon font (project link/terminal icons)                  |
| `https://fonts.googleapis.com` / `https://fonts.gstatic.com`                                                      | preconnect | Google Fonts preconnects                                 |
| `https://github.com`                                                                                              | link       | Placeholder project source link (x4 in section, x6 page) |
| `https://example.com`                                                                                             | link       | Placeholder project live link (x4 in section)            |
| `https://cal.com`, `https://linkedin.com`, `https://x.com`, `mailto:alex@example.com`                             | links      | Footer/contact social links, not assets                  |

## 5. Inline JS data for project content

**None.** There are no arrays/objects with project id/title/description/tech/links. The four scripts in the file are:

1. Tailwind CDN loader (external).
2. `#tailwind-config` inline config (colors, fonts, sizes - see section 3).
3. Full-page WebGL simplex-noise shader background (`#shader-canvas-ANIMATION_42`, decorative).
4. Inline contact form/toast handlers (`showToast`, `handleFormSubmit`).

All project content is hardcoded HTML; if it is moved to an Astro content collection it must be authored from scratch.

## 6. Position, order and anchors

- `main` -> `div.max-w-6xl.mx-auto.px-6.lg:px-12` -> sections in order: `#overview` (hero) -> **`#projects`** -> `#tech-stack` -> `#about` -> `#contact`, then `footer`.
- The projects section is the **2nd section**, immediately after the hero, with `scroll-mt-24` to offset the fixed header.
- Incoming links:
  - Header nav: `<a data-path="projects" href="#projects"><span>Proyectos</span></a>` (with underline grow hover).
  - Hero CTA: gradient pill `<a href="#projects"><span class="tracking-wide">Ver Proyectos</span>` + `arrow_outward` icon.
- The section title id anchor is `id="projects"`; heading copy is `Proyectos con visión` (with `visión` in serif italic primary).
