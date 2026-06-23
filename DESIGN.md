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
* **Quick View Cards:** Clicking a map pin opens a summary card with the venue name, tags, and a button to view the full profile.
* **Self-Serve Store Portal:** A dedicated onboarding flow for owners to create their profile, set operating hours, and drop their pin on the map.
* **Tag-Based Inventory:** Store owners define their *ludoteca* (game collection) using a predefined tagging system (e.g., TCGs, Eurogames, MTG, D&D) instead of manual data entry.
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
* **Custom Purple Map Pins:** The map uses custom vector-based SVG markers styled in `#8367C7` (Malva suave) instead of Leaflet's default blue pins, ensuring brand cohesion.
* **Zoom Controls Positioning:** Leaflet's default zoom control is disabled in the top-left, and a custom `ZoomControl` is added at `topright` to prevent overlap with the floating brand card.
* **Mobile Overlap Prevention:** To keep the map visible on mobile devices, the top brand card is automatically hidden (`hidden md:block`) whenever a venue's Quick View Card is active.
* **Owner Logo Upload & Canvas Auto-Cropping:** To avoid heavy image storage requirements for the B2B MVP, the Onboarding page features a Client-side File Input. When an image is uploaded, an invisible HTML5 Canvas crops and resizes it to a perfect `150x150px` square, compressing it into a highly lightweight Base64 JPEG string (5-10 KB) stored directly in the database.
* **Mandatory Visual Review Loop:** As defined in `AGENTS.md`, the AI Reviewer must capture and verify screenshots for both desktop and mobile viewports to ensure no visual regressions (overlapping text, clipping, or blocked controls) exist before approving a PR.

### **5. Technical Architecture (The "ShipFast" Stack)**
* **Framework:** Next.js (App Router) acting as a monolith for both Frontend UI and Backend Server Actions/API routes.
* **Styling:** Tailwind CSS combined with a lean UI component library (e.g., DaisyUI or Shadcn).
* **Database:** Supabase (PostgreSQL) as our primary database, ensuring strict relational mapping between stores, users, and tags, alongside built-in auth support and instant schema APIs.
* **Authentication:** NextAuth (Auth.js) for seamless social logins (Google, Discord) and magic email links.
* **Emails (Transactional):** Resend or Mailgun (for onboarding verifications).
* **Hosting/Deployment:** Vercel for zero-config CI/CD and edge deployments.

### **6. Testing Strategy**
* **Core Philosophy:** Test-Driven Development (TDD) mandatory for all AI Builder agents. Tests must be written and approved before implementation code.
* **Unit Testing:** * Jest + React Testing Library to verify individual UI components (e.g., Map rendering, Quick View Card data population) and Next.js Server Actions.
* **Integration Testing:**
  * **Framework:** Playwright or Cypress.
  * **Core Workflows to Test:** The "Self-Serve Onboarding Flow" (verifying a store owner can sign up, select tags, and submit) and the "Map Interaction Flow" (verifying map pins correctly fetch and display database records).

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
