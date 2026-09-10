# RELAY_ — Design System

A developer infrastructure / API management product. The interface should read as
a serious, production-grade tool a team would actually ship — not an
"AI-generated SaaS dashboard." Calm, dense, functional. Every element on screen
earns its place; nothing is decorative.

Reference feel: Linear (density, restraint) + Vercel (typography, minimalism) +
OpenRouter (usage/activity concepts) + Kong Konnect / Postman / Apigee (API
catalog, governance, lifecycle).

This system covers three surfaces, all built from the same tokens and
components:
1. **The app** — `relay_full.html` (the authenticated product, 15 pages)
2. **Auth** — `relay_auth.html` (sign in / create account)
3. **Landing** — `relay_landing.html` (public marketing page)

Treat the three reference HTML files as the literal source of truth for
markup, spacing, and grid-template-columns. This document is the reasoning
behind them, not a replacement for reading the files directly. Where this
document and a reference file ever disagree, the reference file wins.

---

## 1. Design tokens

### Color

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#F7F7F5` | App background (warm off-white, never pure white) |
| `--surface` | `#FFFFFF` | Cards, panels, table surfaces |
| `--border` | `#E5E5E2` | Default hairline borders/dividers |
| `--border-strong` | `#D8D8D4` | Hover/focus border state, background texture (see §7) |
| `--text` | `#111111` | Primary text |
| `--text-secondary` | `#737373` | Secondary text, metadata |
| `--text-tertiary` | `#A3A3A0` | Placeholder, disabled, chevrons |
| `--green` | `#16A34A` | Healthy / success / active / primary positive signal |
| `--green-dim` | `#ECFAF0` | Green hover backgrounds only, used sparingly |
| `--red` | `#DC2626` | Errors only |
| `--red-dim` | `#FDECEC` | Danger-zone hover backgrounds, inline error banners |
| `--yellow` | `#C88A04` | Warnings / degraded state only |
| `--yellow-dim` | `#FBF3DE` | Warning hover backgrounds |
| `--blue` | `#1D6FCE` | Sparse semantic use only (e.g. GET method) |

**Rules:**
- The interface is light and neutral. Green is a signal color, not a brand wash — never color large surfaces green.
- Red = errors only. Yellow = warnings/degraded only. No other meaning is assigned to them.
- The sidebar is never dark.
- This applies on the landing page too: no gradient hero washes, no colorful icon-badge feature cards. Green still only touches real signal (a success stat, a status dot, a checkmark), never a section background.

### Typography

Three-tier system — each tier has one job, on every surface (app, auth, landing):

| Role | Family | Where |
|---|---|---|
| **Identity** | `Silkscreen` (pixel/arcade, weights 400/700) | Logo (`RELAY_`) everywhere it appears, app page titles (`OVERVIEW`, `API KEYS`), and section kicker labels (`WHAT RELAY_ DOES`, nav-group labels like `WORKSPACE`). Never on buttons, body copy, table cells, or long headlines. |
| **Interface** | `Inter` (400/500/600/700) | All UI text and prose — nav, body, buttons, table cells, forms, landing headlines and paragraph copy |
| **Technical** | `JetBrains Mono` (400/500) | Paths, secrets, timestamps, latency/request numbers, code blocks, IDs, stat values |

Font loading (Google Fonts):
```
Silkscreen:wght@400;700
Inter:wght@400;500;600;700
JetBrains+Mono:wght@400;500
```
(Landing page additionally loads Inter 700 for headlines; app and auth only need up to 600.)

Type scale actually used:
- Landing hero headline (Inter 600): 42px, tight tracking (-.02em), line-height 1.15
- Landing section heading (Inter 600): 24px
- App/auth page title (pixel): 20px / 700 (auth title is 18px)
- Sidebar logo / nav logo (pixel): 15px / 700
- Section title: 13px / 600
- Body / table primary: 13px / 400–500
- Secondary / meta text: 11.5–12px / 400
- Stat value (mono): 19px / 500 in-app, 21–24px on landing (bigger numbers, same token)
- Micro labels (column headers, stat labels, kickers): 10.5–11.5px, tertiary color

### Spacing & shape

- Border radius: **6px** everywhere (`--radius`). No large rounded cards (never 16–24px radius). This applies to buttons, panels, inputs, tags, and pricing cards on landing — no exceptions for marketing surfaces.
- Borders: 1px hairline (`--border`) — the primary structural device on every surface. Sections are flat bordered panels, not shadowed cards.
- **No box-shadows anywhere, including landing.** No color gradients used decoratively. No glassmorphism. No glow. (A dot-grid *texture*, §7, is not a color gradient wash and is the one sanctioned exception — see rules there.)
- App page content max-width: **1600px**, fluid up to that cap (don't hard-cap low and leave dead space on wide monitors) — padded 28px top / 32px sides. Only single-purpose narrow elements (settings form fields, auth card) get their own small max-width.
- Landing page content max-width: **1120px**, padded 32px sides — narrower than the app because it's prose/marketing content, not dense tables.
- Sidebar width: **216px**, fixed/pinned (app only). Top bar / nav height: **52px**, sticky (app and landing both use this height for their top nav for visual consistency).
- Table/list rows: ~12–13px vertical padding, 16px horizontal, 1px bottom border, last row has no border.
- Not every section needs a card — tables can sit on the page with separators alone, but in this build most lists are wrapped in a single `.panel` (bordered, radius 6px, white surface) for grouping.
- Auth card: max-width 360px, centered, 22px internal padding.

### Motion

- Only subtle hover states (background tint ~`rgba(0,0,0,.035)`, border darken to `--border-strong`).
- No entrance animations, no bounce, no scroll-triggered reveals — including on the landing page. Sections appear as-is on load; nothing fades or slides in as you scroll.
- The only motion in the app is functional: a right-side drawer sliding in (`right: -440px → 0`, 0.18s ease) and a backdrop fade, and (mobile) the sidebar sliding in as an overlay (`transform: translateX(-100% → 0)`, 0.18s ease) — all triggered by a user action, not on load.

---

## 2. Layout shell (app)

```
┌───────────────┬──────────────────────────────────────────────┐
│  RELAY_    │  [☰ mobile] [search ⌘K]   [env ▾]  [avatar]  │  ← topbar, 52px, sticky
├───────────────┼──────────────────────────────────────────────┤
│ WORKSPACE     │                                                │
│  Overview     │   page content (fluid, max-width 1600px)      │
│  APIs         │                                                │
│  Endpoints    │                                                │
│               │                                                │
│ USAGE         │                                                │
│  Activity     │                                                │
│  Analytics    │                                                │
│  Logs         │                                                │
│               │                                                │
│ ACCESS        │                                                │
│  API Keys     │                                                │
│  Domains      │                                                │
│  Webhooks     │                                                │
│               │                                                │
│ GOVERNANCE    │                                                │
│  Policies     │                                                │
│  Rate Limits  │                                                │
│  Members      │                                                │
│               │                                                │
│ SETTINGS      │                                                │
│  General      │                                                │
│  Billing      │                                                │
│               │                                                │
│ ● Production  │                                                │  ← sidebar footer, env dot
└───────────────┴──────────────────────────────────────────────┘
```

- Sidebar is fixed left, 216px, background matches page (`--bg`, not white, not dark) with a right hairline border. Nav items are flat text rows (29px tall, 6px radius), never icon-heavy.
- Nav grouped into 5 labeled sections (WORKSPACE / USAGE / ACCESS / GOVERNANCE / SETTINGS), each with a small tertiary-colored label.
- Top bar: search field (placeholder text + `⌘K` hint on the right), environment switcher (dot + label + chevron), account avatar (initials on dark circle).
- Main column offsets by sidebar width; content scrolls independently of the fixed sidebar/topbar.

### Responsive breakpoints (app)

Three real tiers, not one blunt cutoff:

| Range | Behavior |
|---|---|
| **≥1600px** (large/ultrawide) | Page content centers and caps at 1600px — no dead zone, no infinite stretch either |
| **1100–1599px** (standard desktop/laptop) | Fully fluid, fills viewport minus the 216px sidebar |
| **900–1100px** (small laptop/tablet landscape) | Sidebar stays; stat rows go 2-up; any two-column section (e.g. Overview's Recent activity / API keys) stacks to one column |
| **<900px** (tablet/mobile) | Sidebar becomes a slide-in overlay opened via a hamburger button in the topbar, with a dimming backdrop, closing on backdrop click or nav selection; stat cells go full-width 1-up; the drawer goes full-width; every dense table row (`.row`, `.log-row`) collapses from its multi-column grid into a stacked single-column mini-card (`grid-template-columns: 1fr !important` — needed because those grids are set per-table-type inline in JS) |
| **<420px** | Env-switcher label trims to just the status dot so the topbar doesn't overflow on the smallest phones |

---

## 3. Core components (shared across app, auth, landing)

**Stat row** — a bordered panel divided into equal flex cells by internal 1px
dividers (not separate cards). Each cell: small tertiary label, large mono
value, optional small delta line underneath. Used for headline metrics in the
app (Overview, Analytics, API detail) *and* reused verbatim on the landing
page for platform-wide numbers (bigger font size, same component — this reuse
is deliberate: the landing page should look like a preview of the real
product, not a separate marketing skin).

**List / table panel** (`.panel` + `.row`) — a bordered, white, radius-6 container.
Each row is a CSS grid (column template varies per table — API list, endpoint
list, log list, member list, etc. each define their own `grid-template-columns`).
Rows have a bottom hairline except the last. Clickable rows get a faint hover
tint and `cursor:pointer`. This is the dominant pattern in the app, and the
landing hero mockup reuses it directly with realistic sample data instead of
an illustration.

**Status indicator** — a 6px dot + label, never a large colored badge.
`healthy/active/enabled` → green · `degraded/pending` → yellow ·
`down/failing/disabled` → red. Reused in the landing footer as "All systems
operational."

**Tag / badge** — small (10.5px) bordered pill, secondary text color, used for
environment labels (`Production`, `Staging`), roles/event names, and on
landing for the "Most teams" pricing-plan marker. Neutral by default — color
is reserved for the status dot, not the tag itself.

**Tabs** — underline style. Flat text, 13px, secondary color; active tab is
primary text color with a 2px bottom border in `--text`. Used on the API
detail page (Overview / Endpoints / Traffic / Logs / Keys / Settings).

**Filter bar** — a row of pill-shaped chips (label + chevron), not a form.
Used on Analytics, Logs, APIs, Endpoints.

**Breadcrumb** — plain text, secondary color, `/` separator, current crumb in
primary text + medium weight. Used to go back from API detail to the APIs list.

**Bar chart (traffic)** — a minimal functional bar chart: 24 flex bars, height
= value %, flat `--border-strong` fill with the single peak bar highlighted in
green. The *only* chart in the app; exists to answer a real question, not to
decorate the page.

**Drawer** — right-side slide-in panel (420px, full white surface, left
border) with a dimming backdrop, used for request log detail. Opens only on
click, closes on backdrop click or explicit close. Goes full-width under 900px.

**Forms** (Settings, General, Billing, Auth) — plain labeled fields stacked
vertically, 32–34px-tall bordered inputs, capped width so they don't stretch
full-page-width (420px in Settings, the auth card itself is 360px). Primary
action is a single dark button. Destructive actions live in an explicit
"Danger zone" panel, separated from the rest of the form, red-outlined button.

**Code block** — `JetBrains Mono`, used two ways: (a) in-app, a light
`--bg`-on-`--surface` block for headers/body previews in the drawer; (b) on
landing, a dark (`#111111` background, `#EDEDED` text) block for the hero
code example — the one deliberate dark surface in the whole system, used only
because real terminal output reads as more credible on a near-black
background, restricted to that single section.

---

## 4. Auth pages (sign in / create account)

One file, one form, two modes toggled by JS (`setMode('signin' | 'signup')`)
rather than two separate pages — keeps the visual state (card, background,
positioning) identical between modes and only swaps field visibility and copy.

**Layout:** single centered column on `--bg`. No split-screen illustration, no
hero banner — the app's anti-decoration rule (§6) applies here too. Logo
(pixel, 16px) above a title (pixel, 18px) and one line of secondary-colored
context copy, then a single bordered `.panel` card (max-width 360px, 22px
padding) containing:
1. Two monochrome OAuth buttons (`.btn-secondary`, `currentColor` SVG marks —
   deliberately not the usual colorful G/Octocat treatment)
2. A hairline `or` divider
3. An inline error banner (`--red-dim` background, hidden by default, shown via `.show`)
4. The form: workspace name + full name (signup only) → email → password
   (with a "Forgot password?" link that only shows in sign-in mode, and a
   password hint that only shows in signup mode) → submit button whose label
   changes with mode
5. Below the card: a mode-switch line ("Don't have an account? Sign up" ↔
   "Already have an account? Sign in") and, signup-only, fine-print terms text

**Copy rules specific to auth:** no "Welcome back," no exclamation points —
the subtitle states the workspace context plainly ("Sign in to
acme-workspace" / "Set up a new workspace").

---

## 5. Landing page

**Layout concept:** left-aligned throughout (not centered) — matches the
app's dense, left-aligned information style rather than switching to
typical centered-marketing-page conventions. Sticky 52px top nav identical in
height to the app topbar. Sections separated by hairline borders, not
whitespace-only breaks or background color changes.

**Page sections, in order:**
1. **Nav** — logo, Product/Pricing/Docs/Changelog links, Sign in + Get started buttons
2. **Hero** — kicker label, Inter 600 headline (not pixel font — a full sentence in Silkscreen would hurt readability and violates the "never on body copy/headlines" type rule), secondary-colored lede, two CTAs, small mono-adjacent meta line ("No credit card required · free up to 100K requests/mo"), then the **real-component product mockup** (§3) framed under a mono URL bar
3. **Logos strip** — kicker + plain-text monochrome wordmarks of fictional companies (never real company names/logos, to avoid implying unverified endorsements)
4. **Platform stats** — the `.stat-row` component reused at larger scale
5. **Features** — kicker + heading, then exactly 3 bordered `.feature-panel` cards (Routing, Auth & policy, Observability) — text-first, no colorful icon badges, small `›` bullet list per card
6. **Code section** — two-column: the dark code block (§3) on one side, three short "what happens" points on the other
7. **Pricing** — kicker + heading, 3 `.plan` panels (Free / Team / Enterprise), the middle one marked with a `--text` border and a neutral "Most teams" tag rather than a colorful ribbon; checkmarks use `--green` sparingly, never a colored card background
8. **Closing CTA band** — plain, left-aligned, no background change, same two CTAs as the hero
9. **Footer** — brand blurb + 4 link columns grouped exactly like the sidebar's nav groups (label + links pattern reused intentionally), bottom row with copyright and a status dot ("All systems operational") echoing the in-app status-indicator component

**Responsive:** nav links hide under 900px (CTAs stay); all 3-up grids
(features, pricing) collapse to 1 column; the footer's 5-column grid becomes
2 columns at 900px and 1 at 480px; the hero mockup's table row falls back to
the same stacked-card pattern used in the app at mobile widths.

---

## 6. Content & copy rules

- Name things the way a user thinks about them, not how the system is built (a user manages "API Keys," not "credential objects").
- Buttons are active-voice and specific: `+ New API`, `+ Create key`, `Save changes`, `Delete API`, `Get started` — never generic "Submit."
- No exclamation points, no "Welcome back," no marketing tone anywhere — including on the landing page. Enthusiasm comes from specificity (real numbers, a real curl example), not adjectives.
- Numbers are precise and real-looking (`12.4K`, `99.82%`, `42ms`, `$18.42`, `4.8B`) — avoid round demo numbers that look fake (`100`, `50%`).
- Empty/error states describe what happened and how to fix it, in the interface's voice — no apologies.

## 7. Background treatment (auth page)

The auth page is the one place in the system with a background *texture*
rather than flat `--bg`: a faint dot grid using the existing `--border-strong`
token (no new color introduced), masked so it fades to nothing directly behind
the card and only reads as texture around it.

```css
.bg-grid{
  position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image: radial-gradient(var(--border-strong) 1px, transparent 1px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(circle at 50% 38%, transparent 0, transparent 200px, black 480px);
  mask-image: radial-gradient(circle at 50% 38%, transparent 0, transparent 200px, black 480px);
}
```

**Rule:** this is the only sanctioned exception to "no gradients" — it's a
monochrome structural pattern (dots, using a token already in the palette),
not a decorative color wash, and it must always mask out behind whatever
card/content sits in front of it so the working content stays on clean space.
Do not introduce this pattern anywhere else (app or landing) without a
matching reason; it exists here specifically because the auth screen has no
other content to give the page texture.

## 8. What to avoid (explicit anti-patterns, all surfaces)

- No hero/welcome banner with illustration, no empty decorative whitespace block for its own sake.
- No 4-up colorful metric cards with icon badges — use the bordered stat row instead.
- No card-kit UI (identical rounded-shadow cards for unrelated content).
- No gradients, glow, neon, or "AI-generated dashboard" cyberpunk styling — the dot-grid exception in §7 is the sole exception, and only on the auth page.
- No excessive icons in navigation — text labels only, grouped by section.
- No pixel font outside the logo, page titles, and section kicker labels — never for full sentences, headlines, or body copy.
- Green is a status signal, not a theme — don't tint large surfaces with it, on any surface.
- No real company names or logos in the landing page's social-proof strip.
- No centered marketing layout on landing — stay left-aligned, consistent with the app.

---

## 9. Reference implementation

Three working HTML/CSS/JS files implement this system exactly and are the
literal source of truth for spacing, grid-template-columns per table type,
and component markup:

- `relay_full.html` — the app (all 15 pages, functional tab/drawer/routing JS, responsive down to mobile with an overlay sidebar)
- `relay_auth.html` — sign in / create account, single file, mode-toggled
- `relay_landing.html` — the public marketing page

This document is the reasoning behind them, not a replacement for reading the
files directly.

---

## 10. Modal: New API (create flow)

The first modal component in the system. Triggered by either `+ New API`
button (Overview and APIs list). Two steps in one modal shell, swapped by
JS (`new-api-step-form` ↔ `new-api-step-success`) rather than two separate
modals — same reasoning as the auth page's single-file mode toggle: the
container (position, width, backdrop) stays identical while only the
content swaps.

**When to use a modal vs. the drawer:** the drawer (§3) is for *inspecting*
something that already exists (a log entry) — non-blocking, doesn't
interrupt the page underneath, closes back to exactly where you were. A
modal is for a *commitment* — creating or confirming something — and is
deliberately blocking (centered, dimmed backdrop, must be dismissed).
New API is the first case in the app that needed this; use the same
`.modal` / `.modal-backdrop` shell for any future create/confirm flow
(e.g. "+ Create key," "+ Add webhook," "+ Invite member") rather than
inventing a new container per flow.

**Shell:** centered on the viewport, `.modal` capped at 440px, white
surface, 1px border, 6px radius — no box-shadow, consistent with the rest
of the system (elevation reads from the dimmed backdrop alone, the same
way the drawer gets no shadow either). A short opacity + 4px translateY
transition (`.15s ease`) on open, matching the drawer's `.18s` sliding
transition in spirit — motion is always tied to a user action, never
decorative.

**Step 1 — the form:**
- Header: `Modal title` (Inter 600, 14px — same tier as `.drawer-title`,
  not the pixel font; a modal title is UI chrome, not page identity)
  + a `×` close, and a hairline bottom border separating it from the body.
- Body (20px padding): stacked `.field` rows reusing the exact form styling
  from Settings/Auth — API name (text, required), Type (select: REST /
  GraphQL / gRPC / WebSocket), Environment (select: Production / Staging /
  Development), Description (optional, new `.modal-body textarea` — same
  border/radius/focus treatment as `.field input`, just multi-line).
- Footer: hairline top border, right-aligned `Cancel` (`.btn-secondary`) +
  `Create API` (`.btn-primary`). Cancel and the backdrop/× all do the same
  thing — discard and close, no confirmation needed since nothing has been
  created yet.

**Step 2 — created confirmation:** the pattern for "something now exists,
here's the one-time-sensitive detail." Title becomes `API created`. Body:
- A single status line — green dot + the new API's name + its environment
  as a `.tag` — confirming what just happened, in place of a "success!"
  message (no exclamation points, per §6).
- A `.modal-kv-panel`: a bordered `--bg`-toned block (not `--surface` —
  visually distinct from the form fields above it, reads as "generated
  output" rather than "editable input") with two rows: `BASE URL` (mono,
  plain text) and `API KEY` (mono, masked except the last 4 characters,
  with a small inline `Copy` button — `.btn-secondary` at a reduced 24px
  height, since it's a secondary action inside a value row, not a primary
  page action).
- A `.modal-warning` banner directly below — same `--yellow-dim`
  warning-token pattern as elsewhere in the system (never invent a new
  warning color), stating the key is shown once and won't be recoverable.
- Footer: a single right-aligned `Done` (`.btn-primary`) — no Cancel here,
  because the action already happened; Done just closes.

**Copy rules specific to this modal:** "API created," not "Success!" or
"Your API has been created!" — states the fact, matches §6's ban on
exclamation points and marketing tone. The key warning is functional
("shown only once… store it securely"), not alarmist.

**What's static vs. wired:** every button is fully wired for *UI state* —
opening, closing, switching steps, copying the (placeholder) key to the
clipboard, resetting the form on next open. What's stubbed is the actual
network call: `submitNewApi()` fakes a short delay then reveals step 2
using placeholder values derived from the form's own inputs (slugified
name → fake base URL, a fixed masked key). Both stub points are marked
with a `// wire up to real ... here` comment, the same convention used in
the auth page's `handleSubmit()` stub — an AI IDE (or you) can find every
integration point by searching for that comment.

**Responsive:** `.modal` has `margin:20px` and no fixed height, so it
naturally narrows and vertically compresses on small viewports without a
separate breakpoint — consistent with the auth card's approach of staying
one fluid layout rather than a distinct mobile version.
