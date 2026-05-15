# BlockPay Design System (canonical reference)

## Tokens — already wired in `app/globals.css`

| Token                  | Value                              | Use                            |
| ---------------------- | ---------------------------------- | ------------------------------ |
| `bg-black`             | `#000000`                          | Page background                |
| `--color-bg-panel`     | `#0a0f0c`                          | Section dividers               |
| `--color-bg-card`      | `#0c1310`                          | Cards                          |
| `--color-bg-card-elevated` | `#111a14`                      | Elevated cards / dashboard    |
| `--color-fg`           | `#ffffff`                          | Primary text                   |
| `--color-fg-muted`     | `#a1a1aa` (Tailwind `zinc-400`)    | Body copy                      |
| `--color-fg-subtle`    | `#71717a` (Tailwind `zinc-500`)    | Captions                       |
| `--color-accent`       | `#4ade80` (`text-accent` utility)  | Brand highlight green          |
| `--color-accent-deep`  | `#052e16`                          | Button text on green bg        |
| `--color-border`       | `rgba(74,222,128,0.18)`            | Default green-tinted border    |
| `--color-border-strong`| `rgba(74,222,128,0.35)`            | Strong border (table headings) |

## Type
- Display (headings): `font-display` → Space Grotesk, weight 600/700
- Body: default (Manrope)
- Headlines highlight the brand word in green: `<span className="text-accent">BlockPay</span>`

## Components / utilities
- `card-frame` — large card, green-tinted gradient, rounded-3xl
- `card-frame-tight` — smaller card, rounded-2xl
- `btn-pill` — outline green pill button (use as `<Link className="btn-pill text-sm">`)
- `btn-pill-solid` — filled green pill (CTA)
- `bg-grid` + `bg-grid-fade` — hero grid background
- `dotted-vline` / `dotted-hline` — green dashed connectors

## Patterns
- **All section headlines**: large bold display font, brand word in green, ~3-line max.
- **Pill button labels**: include a `<ChevronRight size={16} strokeWidth={2.4} />` from lucide-react.
- **Cards**: green-tinted border, soft inner gradient, generous padding.
- **No emojis. Anywhere.**
- **No 3rd-party 3D icon sets.** Use the SVG illustrations under `components/illustrations.tsx`, or create new SVGs in the same style (isometric, gradient fills, blue/yellow/green accents, soft rounded shapes).

## Shared components
- `components/logo.tsx` — `<Logo />`
- `components/nav.tsx` — public marketing nav, takes `active` prop
- `components/footer.tsx` — public marketing footer
- `components/illustrations.tsx` — illustration set

## Routes already built
- `/` Home (Hero, FlowSection, FeaturesSection, CompareSection, FaqSection)
