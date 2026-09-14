# System Design Document: Relay Dashboard

## 1. Frontend Architecture Overview

The Relay Dashboard is built using **Next.js 16** leveraging the modern **App Router** paradigm. It acts as the primary user interface for configuring the API Gateway and Management API.

- **Routing Model**: File-based routing under `apps/dashboard/app/`.
- **Rendering Strategy**: Heavily utilizes React Server Components (RSCs) for initial page loads and data fetching, offloading heavy lifting to the server and shipping zero client-side JavaScript for read-only dashboard elements. Client Components (`"use client"`) are isolated to interactive islands (Modals, Forms, Charts, and complex Tabs).
- **Styling**: Vanilla CSS utilizing a robust custom Design System (no Tailwind or UI libraries), enabling ultra-fast compilation and precise control over the visual identity.

## 2. Design System & Aesthetics

Relay's design philosophy is centered around a **Premium Developer Experience**. It aims to feel like a high-end, modern SaaS product (reminiscent of Vercel, Linear, or Stripe).

### 2.1 Core Visuals
- **Theme**: Pure Dark Mode (`#000000` backgrounds with `#111111` layered panels).
- **Typography**: 
  - *Primary*: Inter (clean, modern sans-serif for UI legibility).
  - *Accent*: Silkscreen (pixelated, retro-tech font for prominent headers and branding).
  - *Monospace*: JetBrains Mono (for API keys, IDs, and logs).
- **Color Palette**:
  - `var(--bg)`: `#000000` (Main background)
  - `var(--panel)`: `#111111` (Card/Panel backgrounds)
  - `var(--border)`: `#333333` (Subtle dividers)
  - `var(--text-primary)`: `#ffffff` (High contrast text)
  - `var(--text-secondary)`: `#888888` (Muted labels)
  - `var(--accent)`: `#3291ff` (Primary actions, links)
  - `var(--accent-red)`: `#ff453a` (Destructive actions)
  - `var(--accent-green)`: `#30d158` (Success states, uptime)

### 2.2 Component Library Highlights
- **`.panel`**: The fundamental building block. A slightly elevated container with a subtle border and 12px border radius. Often features a very subtle hover effect (`border-color: #555`).
- **`.btn`**: Buttons feature a distinct micro-animation (`transform: scale(0.98)` on active) and a smooth hover transition. The `.btn-primary` uses the accent color with a subtle drop shadow.
- **Glassmorphism**: Modals (`.modal-content`) and sticky headers utilize `backdrop-filter: blur(12px)` to create a premium depth effect over scrolling content.

## 3. Page Architecture & Data Flow

### 3.1 Server-Side Data Fetching (`fetchAPI`)
The dashboard rarely fetches data directly from the browser. Instead, Server Components use a custom `fetchAPI` utility located in `app/lib/api.ts`.
1. The user logs in via Neon Auth (Google OAuth).
2. The browser receives a secure HTTP-only session cookie.
3. When the user visits `/overview`, the Next.js Node.js server executes the Server Component.
4. `fetchAPI` extracts the session cookie from the incoming request headers and securely proxies the request to the Management API (`https://relay-g0ia.onrender.com`).
5. The Server Component receives the JSON data and directly renders the HTML.
6. **Result**: Zero layout shift, no client-side loading spinners for main content, and maximum security since the frontend never exposes raw tokens.

### 3.2 Key Pages
- **`/` (Landing Page)**: Marketing site featuring a custom `Typewriter` effect, floating architecture diagrams, and a call-to-action driving users to `/login`.
- **`/(dashboard)/layout.tsx`**: The persistent shell. Contains the Left Sidebar (Workspace Switcher, Navigation links) and handles global state like the currently selected workspace.
- **`/apis/[id]` (API Detail)**: A complex hybrid page. Uses RSC to fetch the specific API configuration, keys, and traffic data. Uses a Client Component for a 6-tab interface (Overview, Keys, Webhooks, Limits, Logs, Settings) allowing instantaneous switching without network waterfalls.
- **`/docs`**: A nested layout containing a documentation-specific sidebar. Built using markdown-styled React components.

## 4. State Management

- **Global State**: Minimal. The URL is the source of truth for routing. The Workspace context is managed at the top level layout and passed down, or fetched directly by Server Components.
- **Local State**: Managed via React `useState` and `useTransition` inside Client Components (e.g., handling form submissions, modal open/close states, and tab selections).

## 5. Security & Authentication UI

1. Unauthenticated users visiting `/overview` are intercepted by `middleware.ts` or `fetchAPI` catching a 401 Unauthorized, triggering an immediate redirect to `/login`.
2. Upon Google OAuth success, Neon Auth redirects back.
3. If the user has no workspaces, `/onboarding` is triggered to force the creation of their first workspace. The UI traps them here until a workspace is created to prevent orphaned accounts.
4. Subsequent logins skip `/onboarding` and route directly to the dashboard `/overview`.
