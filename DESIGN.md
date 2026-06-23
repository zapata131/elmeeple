# **Architecture & Design Document: El Meeple**

### **1. Core Vision**
* **Project Name:** El Meeple (elmeeple.com)
* **Concept:** The premier interactive directory for board game cafés, TCG stores, and gaming communities in LATAM and Spain.
* **Value Proposition:** Centralizing venue discovery to drive foot traffic for owners and providing a seamless "where to play" map for hobbyists and community organizers.
* **Business Model:** Freemium B2B SaaS (Free basic map pins initially, leading to premium subscriptions for advanced store tools and event promotion in the future).

### **2. Target Audience**
* **Primary (Supply):** Board game cafés, TCG retail store owners, and local community organizers.
* **Secondary (Demand):** Board game hobbyists, TCG players, and tourists looking for local gaming spaces.

### **3. MVP Feature Scope**
* **Map-First Interface:** A responsive, location-based interactive map serving as the default homepage, automatically centering on the user's city.
* **Quick View Cards (Lightweight Summary):** Clicking a map pin opens a lightweight, fast-loading summary card displaying verified status, brand badges, opening hours, announcements, and a prominent brand-purple CTA link: **"Ver Perfil y Ludoteca ➔"** that redirects players to the dedicated store profile page.
* **Dedicated Yelp-style Storefronts (`/venue/[slug]`):** Dynamic storefront profile pages resolving clean, SEO-friendly slugs (e.g. `/venue/orcs-stories`). Features a high-fidelity dual-column layout on desktop (60% catalog grid, 40% reviews & vibe hub) and a stacked single-column layout on mobile, optimized for 100+ games.
* **Advanced Catalog Search & Filters:** Within the storefront page, players can filter the store's game catalog via a text search bar, player count filter chips (`Solo`, `2`, `3-4`, `5+`), and play duration category chips in real-time.
* **Self-Serve Store Portal:** A dedicated onboarding flow for owners to create their profile, set operating hours, drop their pin, and manage their store dashboard.
* **BoardGameGeek Ludoteca Sync:** Store owners can enter their BGG username in their dashboard to automatically import and sync their game box collection, rendering a beautiful visual gallery.
* **Community Reviews & Vibe Hub:** Authenticated players can submit reviews (1-5 stars), select from vibe presets, and write comments. The community average rating, visual vibe tag progress bars, and comments feed update in real-time.
* **Admin Verification:** A backend toggle for the platform owner to approve self-submitted venues before they appear publicly.

### **4. UI/UX & Brand Aesthetics**
* **Design Philosophy:** Minimalist, clean, and highly legible, prioritizing map visibility and easy navigation.

| UI Element Purpose | Color Name | Hex Code |
| :--- | :--- | :--- |
| Background / Base | Blanco roto | #F5F0E9 |
| Main Text / Dark UI | Carbón suave | #3A3A3A |
| Primary Accent / Buttons / Pins | Malva suave | #8367C7 |
| Secondary Accent / Accents | Turquesa pastel | #73D8D4 |
| Alerts / Highlights | Coral deslavado | #FF9E8A |

### **4.1 Core UX & Design System Rules**
* **Left Sidebar Layout (Desktop/Mobile):** To maximize search efficiency and support high-density directories, the homepage features a fixed Left Sidebar (width: `md:w-96`) on desktop that contains the brand header, tagline, search bar, category filter chips, and a scrollable list of matching venues. On mobile viewports, the sidebar moves to the top of the screen as a clean, compact header search panel, leaving the rest of the height for the map. Clicking any card in the sidebar list automatically pans and centers the map onto that venue's coordinates.
* **Custom Purple Map Pins:** The map uses custom vector-based SVG markers styled in `#8367C7` (Malva suave) instead of Leaflet's default blue pins, ensuring brand cohesion.
* **Zoom Controls Positioning:** Leaflet's default zoom control is disabled in the top-left, and a custom `ZoomControl` is added at `topright` to prevent overlap with the floating brand card.
* **Mobile Overlap Prevention:** To keep the map visible on mobile devices, the top brand card is automatically hidden (`hidden md:block`) whenever a venue's Quick View Card is active.
* **Hard Page Navigation for Map Transitions:** To bypass client-side Leaflet unmount coordinate crashes (`_leaflet_pos` undefined) in headless browser contexts (where external map tiles fail to load due to sandboxed connection limits), the Quick View Card CTA uses a standard HTML `<a>` anchor tag instead of Next.js SPA client-side `<Link>` components, forcing a clean hard page reload when transitioning to the store profile.
* **Owner Logo Upload & Canvas Auto-Cropping:** To avoid heavy image storage requirements for the B2B MVP, the Onboarding page features a Client-side File Input. When an image is uploaded, an invisible HTML5 Canvas crops and resizes it to a perfect `150x150px` square, compressing it into a highly lightweight Base64 JPEG string (5-10 KB) stored directly in the database.
* **Mandatory Visual Review Loop:** As defined in `AGENTS.md`, the AI Reviewer must use Chrome DevTools MCP tools (via the `chrome-devtools` server) to perform live browser walkthroughs, capturing and verifying screenshots for both desktop and mobile viewports to ensure no visual regressions (overlapping text, clipping, or blocked controls) or console errors exist before approving a PR.
* **Minimalist Iconography & No Emojis (Visual Premium Rule):** To maintain a high-end, premium aesthetic, raw emojis (e.g., `🎲`, `🕒`, `👤`, `🏪`, `🛡️`, `🚪`, `🏆`, `✍️`, `💬`, `➔`, `📍`) are strictly prohibited in headers, buttons, lists, cards, and banners. They must always be replaced with clean typography, minimalist layouts, or custom inline vector SVG icons styled in our brand colors (e.g., Malva, Carbón, or Gold). Star glyphs (`★`, `☆`) are allowed exclusively as clean typographic characters in ratings feeds.


### **5. Technical Architecture (The "ShipFast" Stack)**
* **Framework:** Next.js (App Router) acting as a monolith for both Frontend UI and Backend Server Actions/API routes.
* **Styling:** Tailwind CSS combined with a lean UI component library (e.g., DaisyUI or Shadcn).
* **Database (Supabase & PostgreSQL):** Core tables include:
  * `venues`: Tracks venue metadata, ownership, unique url `slug` column, and `bgg_username`.
  * `venue_games`: Idempotent bulk upsert of games linked to `venues` (`bgg_id`, `name`, `thumbnail`, player counts, playing time). Unique constraint on `(venue_id, bgg_id)`.
  * `reviews`: Community reviews with `rating` (1-5), `comment`, `vibe_tags` text arrays, and `user_email`.
* **Row-Level Security (RLS):** Strict security policies enabled on all tables:
  * Public read access (`SELECT`) permitted on all public venue, game, and review tables.
  * Authenticated write access (`INSERT`/`UPDATE`) restricted to validated users or owners using session checks.
* **BoardGameGeek Integration:** Public XML API collection sync (`https://boardgamegeek.com/xmlapi2/collection?username=<username>&own=1`) parsed securely on the server side using `fast-xml-parser`.
* **Authentication:** NextAuth (Auth.js) with custom credentials role resolution, dynamic SHA-256 database password hashing, and global context wrappers.
* **Emails (Transactional):** Resend or Mailgun (for onboarding verifications).
* **Hosting/Deployment:** Vercel for zero-config CI/CD and edge deployments.

### **6. Testing Strategy**
* **Core Philosophy:** Test-Driven Development (TDD) mandatory for all AI Builder agents. Tests must be written and approved before implementation code.
* **Unit & Integration Testing:** Jest + React Testing Library + JSDOM to verify:
  * Individual UI components (Map rendering, Quick View Card tabs, grids).
  * Next.js Server Actions (`submitReview`, `syncBggCollection`) with mock-supabase database clients.
  * Resilient JSDOM globals and `jose` token polyfills for NextAuth.
* **Live System & Visual QA (Playwright):**
  * Automated end-to-end browser walkthroughs run on **Desktop (1280x800)** and **Mobile (390x844)** viewports.
  * Verifies complete user journeys: owner BGG sync, player search filters, visual grids, and real-time review updates.
  * Captures high-resolution screenshots saved to `visual-qa-results/` and audits browser console logs for zero runtime errors or warnings.
* **Resilient Local QA Architecture:**
  * A custom mock Supabase server (`scripts/mock-supabase.js`) listening on local port `54321` to simulate PostgreSQL endpoints, RLS policies, PATCH updates, and complex relational embeddings (`select=*,venue_games(*),reviews(*)`).
  * Implemented robust mock database support for unique `slug` query filtering, dynamic SHA-256 password validation matching NextAuth, and `vnd.pgrst.object` Accept header checking to return single JSON objects (supporting `.single()` queries) instead of arrays.
  * High-fidelity BGG API fallback in the sync server action using a cached local XML representation when BGG API is rate-limiting or returning 401, guaranteeing flawless local QA walkthroughs.

### **7. Version Control & Workflow (GitHub Flow)**
* **Branching Strategy:** Strict adherence to GitHub Flow.
  * `main` branch is always stable and deployable via Vercel.
  * **No direct commits to `main`.**
* **AI Execution Loop:**
  1. The AI Builder agent must branch off `main` for every new feature or bug fix (e.g., `feature/map-ui` or `fix/owner-login`).
  2. The agent commits its code and tests to the feature branch.
  3. The agent opens a Pull Request (PR) against `main`.
* **Validation (AI Reviewer):** A separate AI Reviewer agent (or the human architect) inspects the PR. Only when CI checks (Unit/Integration tests) pass and the code matches this `DESIGN.md` document is the branch merged into `main`.

### **8. Future Roadmap (V2+)**
* **Payments & Subscriptions:** Stripe integration for Premium Store subscriptions.
* **Community Organizer Profiles:** Tools for independent organizers to create community pages, schedule meetups at affiliated venues, and manage player RSVPs.
* **Premium Store Subscriptions:** Highlighted map pins and traffic analytics for venues.
* **Tournament Management:** Comprehensive bracket generation and event management tools.
* **BGG Integration:** Direct BoardGameGeek XML API connection for automated *ludoteca* inventory syncing.
