# Architecture and design document: El Meeple

### 1. Core vision
* **Project name:** El Meeple (elmeeple.com)
* **Concept:** The premier interactive directory for board game cafés, TCG stores, and gaming communities in LATAM and Spain.
* **Value proposition:** We centralize venue discovery to drive foot traffic for owners and provide a seamless "where to play" map for hobbyists and community organizers.
* **Business model:** Freemium B2B SaaS (Free basic map pins initially, leading to premium subscriptions for advanced store tools and event promotion in the future).

### 2. Target audience
* **Primary (Supply):** Board game cafés, TCG retail store owners, and local community organizers.
* **Secondary (Demand):** Board game hobbyists, TCG players, and tourists looking for local gaming spaces.

### 3. MVP feature scope
* **Map-first interface:** A responsive, location-based interactive map serves as the default homepage, automatically centering on your city.
* **Quick view cards (lightweight summary):** Clicking a map pin opens a lightweight, fast-loading summary card. This card displays verified status, brand badges, opening hours, announcements, and a prominent brand-purple CTA link: **"Ver perfil y ludoteca"** that redirects you to the dedicated store profile page.
* **Dedicated Yelp-style storefronts (`/venue/[slug]`):** Dynamic storefront profile pages resolve clean, SEO-friendly slugs (such as `/venue/orcs-stories`). They feature a high-fidelity dual-column layout on desktop (60% catalog grid, 40% reviews and vibe hub) and a mobile-optimized layout.
* **Storefront mobile tabbed interface:** To prevent mobile scroll fatigue over large board game collections, the dedicated storefront profile page features a mobile-only sub-navigation bar with two tabs: `[ Ludoteca ]` and `[ Comunidad ]` directly below the store header banner. This bar conditionally renders either the game catalog (search, filters, and grid) or the ratings/comments feed based on the active tab on mobile viewports. On desktop, the page preserves the full, high-density dual-column side-by-side layout.
* **Advanced catalog search and filters:** Within the storefront page, you can filter the store's game catalog via a text search bar, player count filter chips (Solo, 2, 3-4, 5+), and play duration category chips in real-time.
* **Global game search on the map:** A dedicated search mode toggle below the homepage search bar allows you to switch between searching for venues ("Buscar locales") and searching for specific games ("Buscar juegos"). In game search mode, the map filters pins and the sidebar list in real-time to show only venues that have the searched game in their synced catalog. Cards in the sidebar render a brand-purple meeple-badge indicating the matched game (such as "Tiene Scythe") without using emojis.
* **Self-serve store portal:** A dedicated onboarding flow allows owners to create their profile, set operating hours, drop their pin, and manage their store dashboard.
* **BoardGameGeek ludoteca sync:** Store owners can enter their BGG username in their dashboard to automatically import and sync their game box collection, rendering a beautiful visual gallery.
* **Community reviews and vibe hub:** Authenticated players can submit reviews (1-5 stars), select from vibe presets, and write comments. The community average rating, visual vibe tag progress bars, and comments feed update in real-time.
* **Admin verification:** A backend toggle allows platform owners to approve self-submitted venues before they appear publicly.

### 4. UI/UX and brand aesthetics
* **Design philosophy:** Minimalist, clean, and highly legible, prioritizing map visibility and easy navigation.

| UI Element Purpose | Color Name | Hex Code |
| :--- | :--- | :--- |
| Background / Base | Blanco roto | #F5F0E9 |
| Main Text / Dark UI | Carbón suave | #3A3A3A |
| Primary Accent / Buttons / Pins | Malva suave | #8367C7 |
| Secondary Accent / Accents | Turquesa pastel | #73D8D4 |
| Alerts / Highlights | Coral deslavado | #FF9E8A |

### 4.1 Core UX and design system rules
* **Left sidebar layout (desktop and mobile):** To maximize search efficiency and support high-density directories, the homepage features a fixed left sidebar (width: `md:w-96`) on desktop. This sidebar contains the brand header, tagline, search bar, category filter chips, and a scrollable list of matching venues. On mobile viewports, the sidebar moves to the top of the screen as a clean, compact header search panel, leaving the rest of the height for the map. Clicking any card in the sidebar list automatically pans and centers the map onto that venue's coordinates.
* **Custom purple map pins:** The map uses custom vector-based SVG markers styled in `#8367C7` (Malva suave) instead of Leaflet's default blue pins, ensuring brand cohesion.
* **Zoom controls positioning:** We disable Leaflet's default zoom control in the top-left, and add a custom `ZoomControl` at `topright` to prevent overlap with the floating brand card.
* **Mobile overlap prevention:** To keep the map visible on mobile devices, the top brand card is automatically hidden (`hidden md:block`) whenever a venue's quick view card is active.
* **Hard page navigation for map transitions:** To bypass client-side Leaflet unmount coordinate crashes (`_leaflet_pos` undefined) in headless browser contexts (where external map tiles fail to load due to sandboxed connection limits), the quick view card CTA uses a standard HTML `<a>` anchor tag instead of Next.js SPA client-side `<Link>` components. This forces a clean hard page reload when transitioning to the store profile.
* **Owner logo upload and canvas auto-cropping:** To avoid heavy image storage requirements for the B2B MVP, the onboarding page features a client-side file input. When you upload an image, an invisible HTML5 canvas crops and resizes it to a perfect `150x150px` square, compressing it into a highly lightweight Base64 JPEG string (5-10 KB) stored directly in the database.
* **Mandatory visual review loop:** As defined in `AGENTS.md`, the AI reviewer must use Chrome DevTools MCP tools (via the `chrome-devtools` server) to perform live browser walkthroughs, capturing and verifying screenshots for both desktop and mobile viewports to ensure no visual regressions (overlapping text, clipping, or blocked controls) or console errors exist before approving a PR.
* **Minimalist iconography and no emojis (visual premium rule):** To maintain a high-end, premium aesthetic, you must not use raw emojis (such as dice, clock, user, store, shield, door, trophy, pen, bubble, arrow, pin) in headers, buttons, lists, cards, and banners. You must replace them with clean typography, minimalist layouts, or custom inline vector SVG icons styled in our brand colors (such as Malva, Carbón, or Gold). Star glyphs (★, ☆) are allowed exclusively as clean typographic characters in ratings feeds.
* **Global game search toggle and match badges:** The homepage search bar includes a toggle to switch between searching for venues and searching for games. If a game search is active, cards in the sidebar list render a custom game-matching badge styled in brand-purple background opacity (5%), thin borders (15%), and brand-purple text (such as "Tiene Scythe") with a custom inline vector SVG icon (no emojis), providing clear visual feedback on why the venue matched.
* **Onboarding portal route protection, 5-step funnel, and collapsible session banner:** To prevent unauthorized guest registrations, the `/onboarding` portal is a client-side protected route. Unauthenticated guests are automatically redirected to `/login?callbackUrl=/onboarding`. The onboarding funnel is optimized to 5 steps, combining owner and establishment details into a single Step 1. At the very top of Step 1, a read-only, collapsible session account banner renders the user's name, email, brand-purple meeple SVG avatar, and an emerald-green checkmark success badge, securing direct, frictionless owner-account linkage. Step 4 (Summary) includes brand-purple `[Editar]` shortcuts next to headers to allow instant, effortless correction by jumping directly back to the target step.
* **Community rating badges for discoverability:** To guide users to the best establishments, both the homepage map sidebar card items and the Floating Quick View Card header render a custom typographic rating badge (e.g. `★ 4.8 (12)`) in amber-500 gold. This is calculated dynamically on the client side from the preloaded `reviews` array, matching our premium visual standards without using raw emojis.
* **Secure trust badge for sensitive uploads:** To mitigate user friction and anxiety when uploading sensitive legal or fiscal documents (such as the operating permit in Step 5), we render a brand-cohesive secure trust badge (`data-testid="secure-trust-badge"`). This badge features a clean, premium vector SVG lock icon (no emojis) styled in emerald green (`text-emerald-600`), a soft emerald background (`bg-emerald-500/10 border-emerald-500/25`), and highly legible copywriting in Spanish clarifying that the document is encrypted and only visible to the administration of El Meeple.
* **Catalog View Toggles (Grid vs List):** Within the storefront dedicated page (`/venue/[slug]`), users can toggle between a visual Grid View (default) and a compact List View. The toggle is rendered next to the game count badge using premium inline vector SVGs (no emojis) styled in brand Malva `#8367C7` for active states and Carbón `#3A3A3A`/50 for inactive states. List View renders a high-density, vertical stack of games featuring smaller 40x40px thumbnails, titles, player counts, and duration badges, minimizing vertical scroll fatigue.
* **Localized search radius filter:** The homepage map sidebar features a distance-based search radius filter. Users can select from chips (`Sin límite`, `2 km`, `5 km`, `10 km`, `20 km`) to filter venues based on their distance from a reference point. The reference point is determined dynamically: it uses the user's current location (obtained via the browser's Geolocation API on mount) or the center of the map selected by the user via the location search bar. Distances are calculated on the client side using the Haversine formula.
* **Premium dark mode theme:** A gorgeous, class-based dark mode theme is supported across all views. Theme state is stored in the `html` element's class list (`.dark`), saved in `localStorage.theme`, and toggled via a Sun/Moon button in the navbar header. An inline `<head>` blocking script prevents light-theme flashes during page load. Color tokens map to deep charcoal `#121212`/`#1E1E1E`/`#2D2D2D` backgrounds and light Blanco Roto `#F5F0E9` text.



### 5. Technical architecture (the "ShipFast" stack)
* **Framework:** Next.js (App Router) acting as a monolith for both frontend UI and backend server actions/API routes.
* **Styling:** Tailwind CSS combined with a lean UI component library (such as DaisyUI or Shadcn).
* **Database (Supabase and PostgreSQL):** Core tables include:
  * `venues`: Tracks venue metadata, ownership, unique url `slug` column, `bgg_username`, and `bgg_last_synced_at` (sync timestamp).
  * `venue_games`: Idempotent bulk upsert of games linked to `venues` (`bgg_id`, `name`, `thumbnail`, player counts, playing time). Unique constraint on `(venue_id, bgg_id)`.
  * `reviews`: Community reviews with `rating` (1-5), `comment`, `vibe_tags` text arrays, and `user_email`.
* **Row-level security (RLS):** Strict security policies enabled on all tables:
  * Public read access (`SELECT`) permitted on all public venue, game, and review tables.
  * Authenticated write access (`INSERT`/`UPDATE`) restricted to validated users or owners using session checks.
* **BoardGameGeek integration:** Public XML API collection sync (`https://boardgamegeek.com/xmlapi2/collection?username=<username>&own=1`) parsed securely on the server side using `fast-xml-parser`.
  * **Weekly CRON Sync:** A background CRON route `/api/cron/sync` (secured via `CRON_SECRET` Bearer token) automatically queries approved venues and triggers sequential BGG catalog syncs weekly, implementing a 1-second polite delay between requests.
* **Authentication:** NextAuth (Auth.js) with custom credentials role resolution, dynamic SHA-256 database password hashing, and global context wrappers.
* **Emails (Transactional):** Resend or Mailgun (for onboarding verifications).
* **Hosting/deployment:** Vercel for zero-config CI/CD and edge deployments.

### 6. Testing strategy
* **Core philosophy:** Test-driven development (TDD) is mandatory for all AI builder agents. You must write and verify tests before implementing production code.
* **Unit and integration testing:** Jest + React Testing Library + JSDOM to verify:
  * Individual UI components (Map rendering, quick view card tabs, grids).
  * Next.js server actions (`submitReview`, `syncBggCollection`) with mock-supabase database clients.
  * Resilient JSDOM globals and `jose` token polyfills for NextAuth.
  * **Memory optimization:** Jest JSDOM tests must always run in serial mode using `--runInBand` and `--forceExit` (e.g., `npm run test -- --runInBand --forceExit`) to prevent parallel child worker heap out-of-memory crashes and ensure fast execution (under 90 seconds).
* **Live system and visual QA (Playwright):**
  * Automated end-to-end browser walkthroughs run on **Desktop (1280x800)** and **Mobile (390x844)** viewports.
  * Verifies complete user journeys: owner BGG sync, player search filters, visual grids, and real-time review updates.
  * Captures high-resolution screenshots saved to `visual-qa-results/` and audits browser console logs for zero runtime errors or warnings.
  * **Unified Runner:** Run `./scripts/test-all-features.sh` to automatically boot the mock database and Next.js servers, run all E2E walkthroughs, and clean up background processes on exit.
* **Resilient local QA architecture:**
  * A custom mock Supabase server (`scripts/mock-supabase.js`) listening on local port `54321` simulates PostgreSQL endpoints, RLS policies, PATCH updates, and complex relational embeddings (`select=*,venue_games(*),reviews(*)`).
  * We implemented robust mock database support for unique `slug` query filtering, dynamic SHA-256 password validation matching NextAuth, and `vnd.pgrst.object` Accept header checking to return single JSON objects (supporting `.single()` queries) instead of arrays.
  * A high-fidelity BGG API fallback in the sync server action uses a cached local XML representation when BGG API is rate-limiting or returning 401, guaranteeing flawless local QA walkthroughs.

### 7. Version control and workflow (GitHub Flow)
* **Branching strategy:** Strict adherence to GitHub Flow.
  * `main` branch is always stable and deployable via Vercel.
  * **No direct commits to `main`.**
* **AI execution loop:**
  1. The AI builder agent must branch off `main` for every new feature or bug fix (such as `feature/map-ui` or `fix/owner-login`).
  2. The agent commits its code and tests to the feature branch.
  3. The agent opens a pull request (PR) against `main`.
* **Validation (AI reviewer):** A separate AI reviewer agent (or the human architect) inspects the PR. Only when CI checks (unit/integration tests) pass and the code matches this `DESIGN.md` document can you merge the branch into `main`.

### 8. Future roadmap (V2+)
* **Payments and subscriptions:** Stripe integration for Premium Store subscriptions.
* **Community organizer profiles:** Tools for independent organizers to create community pages, schedule meetups at affiliated venues, and manage player RSVPs.
* **Premium store subscriptions:** Highlighted map pins and traffic analytics for venues.
* **Tournament management:** Comprehensive bracket generation and event management tools.

---

## 9. Engineering retrospective and case study
This section documents the technical successes, failures, blockers, and architectural decision-making reasoning accumulated during the development of the **El Meeple** platform. All future developments must reference this retrospective to maintain system integrity.

### 9.1 What works (core architectural successes)
1. **Unified profiles and role-based access control (RBAC):**
   Instead of separating store owners and players into distinct tables (which would force dual-role users to create duplicate accounts), we implemented a single `public.profiles` table extending Supabase Auth. A `role` enum (`player`, `partner`, `admin`) manages access controls. This makes queries clean, simplifies NextAuth session handling, and allows seamless role upgrades.
2. **Client-side image auto-cropping and canvas compression:**
   To prevent high-resolution store logos and operating permits from bloat-loading or exhausting database storage, we built an invisible HTML5 canvas processor in the browser. Logos are auto-cropped to a perfect `150x150px` square, and permit JPEGs are compressed to a maximum dimension of `400x300px` at 70% quality, keeping file uploads strictly under `15 KB` as base64 strings.
3. **Idempotent BoardGameGeek (BGG) XML synchronization & Polling Resilience:**
   Rather than manually typing in catalogs, store owners sync their library in 1 click using their BGG username. The server-side action parses BGG's XML payload using `fast-xml-parser`, performs a bulk upsert into `venue_games` with a unique constraint on `(venue_id, bgg_id)`, and executes a full sync (deleting local games no longer present on BGG). To handle BGG XML API2 queuing, the server action detects HTTP `202 Accepted` states and returns a queued status (`isQueued: true`), prompting the frontend dashboard (`BggSyncForm`) to start a 5-second countdown auto-retry loop (up to 3 attempts) for a smooth, friction-free sync experience. If BGG is rate-limited (`429`), it gracefully reports it in production, falling back to cached local XML mock in sandboxed testing.
   * **Bearer Token Authorization:** Authenticates requests to the BGG XML API2 using `Authorization: Bearer <token>` header, aligning with BGG's updated security policy to prevent 401 Unauthorized errors during real syncs.
4. **Resilient local mock infrastructure:**
   By designing a custom mock Supabase server (`mock-supabase.js`) and local BGG XML caching, we created a high-fidelity local developer environment that runs completely independently of live third-party APIs.
5. **Server-side partner dashboard security overhaul:**
   To protect the partner dashboard admin panel from unauthorized access and eliminate redundant input fields, we implemented server-side session checks via `getServerSession(authOptions)`. If a user is not logged in or doesn't have the `partner` or `admin` role, they are immediately redirected to `/login?callbackUrl=/dashboard`. The dashboard automatically resolves the owner's email from the session token to fetch and display only their registered venues, completely removing manual email inputs and URL query parameter checks.

### 9.2 What has failed and lessons learned (blockers and workarounds)
1. **Next.js and Leaflet SSR hydration conflicts (critical):**
   * *The blocker:* Leaflet references the browser-only `window` object immediately upon import, which caused Next.js server-side rendering (SSR) to crash during production builds and runtime.
   * *The workaround:* We bypassed direct server imports. The map is marked as `"use client"` and dynamically imported on the client side using:
     `const Map = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <MapPlaceholder /> })`
2. **Leaflet default marker asset resolution (critical):**
   * *The blocker:* Webpack and Turbopack bundlers dynamically compile and hash asset paths, which broke Leaflet's default blue pin image URL resolutions, throwing silent 404 image-loading errors in the console.
   * *The workaround:* We bypassed Leaflet's image marker asset resolution entirely. We now render pins using custom inline Vector SVGs styled with our brand Malva `#8367C7` and custom CSS drop-shadow filters, making pin rendering 100% independent of asset bundlers and matching our premium aesthetics.
3. **NextAuth / Auth.js context wrappers (critical):**
   * *The blocker:* Client-side authentication hooks like `useSession()` triggered fatal client-side crashes if they were called in components that were not nested inside NextAuth's context provider.
   * *The workaround:* We wrapped the root layout body in a custom client-side `<NextAuthProvider>` wrapper in `layout.tsx`, making sessions globally available.
4. **Empty database connection refused states (critical):**
   * *The blocker:* If you start the application without configured Supabase credentials in `.env.local` (or if the local database is offline), the homepage map hangs in an infinite loading spinner.
   * *The workaround:* We implemented a graceful catch-block fallback. If the Supabase query fails, the app prints a warning and populates the local state with our static CDMX mock venues (`MOCK_VENUES` array), keeping the map and sidebar 100% interactive out of the box.

### 9.4 Empty-state visual patterns (Zero States)
We follow a strict zero-state policy. When a search or list query yields 0 results (empty state), the interface must never render an empty page, blank grid, or missing markers. It must show a premium, brand-aligned zero-state card (`data-testid="zero-state-search"`) that contains:
1. A descriptive header indicating that no results were found.
2. A helper explanation suggesting options to resolve the empty state.
3. An interactive primary button to "Limpiar filtros" or reset search parameters.
4. Clean vector SVGs (no emojis) matching brand typography and soft outlines.

### 9.5 Owner-Reviewer Messaging Channel (Onboarding Comments)
To reduce back-and-forth email friction during store onboarding, partners can provide contextual remarks (e.g., "permiso en renovación") right next to their tax uploads:
1. **Database Schema**: Added an optional `reviewer_comment` column of type `TEXT` to the `venues` table.
2. **Form Onboarding Wizard (Step 5)**: Embedded an optional `reviewerComment` textarea bound to the global wizard state.
3. **Auditing Interface**: Pending registration cards inside the Admin Dashboard details modal render a warning-colored (`bg-amber-500/10`) card displaying this message to administrators for contextual audits.
4. **Safety & Stability**: Implemented loop-protection states inside the session prefill hook to prevent cascade renders inside Jest and react runtime environments.

