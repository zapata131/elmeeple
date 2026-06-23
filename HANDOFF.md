# 📑 Active Sprint Handoff & Continuity Memo: Milestone 4 + User-First Flow

If you are a new AI agent resuming development on **El Meeple**, read this document first! It contains the exact state of our active sprint, the files in our workspace, and a step-by-step checklist to resume and complete the task.

---

## 🚀 1. Active Sprint Status & Goal
* **Active Branch:** `feature/issue-31-venue-profiles`
* **Sprint Goal:** Complete the transition to a **User-First Navigation System** and **Dedicated Yelp-Style Store Profiles**, offloading the map Quick View Card.
* **Tech Stack & Conventions:** Next.js (App Router), Supabase (PostgreSQL), NextAuth, Tailwind CSS. Strictly adhere to `DESIGN.md` (Section 9: Conventions) and `AGENTS.md` (Section 6: Three-Tier Testing).

---

## 📂 2. Current Files in the Workspace (Accelerated Starting Point)
We have successfully restored the pre-coded files for this sprint. They are currently modified/untracked in the working directory on this branch:

1. **Database Schema:**
   * `supabase/migrations/add_venue_slug.sql` (Creates unique `slug` column and auto-populates it).
2. **Dedicated Profile Pages:**
   * `src/app/venue/[slug]/page.tsx` (Server Component: fetches venue/games/reviews based on slug).
   * `src/app/venue/[slug]/VenueProfileClient.tsx` (Client Component: interactive dashboard with game search, player count/time chips, review averages, vibe progress bars, and player comments feed).
3. **Simplified Map Preview:**
   * `src/components/QuickViewCard.tsx` (Tab-free card showing only announcements, schedule, and a primary CTA Link: `"Ver Perfil y Ludoteca ➔"` linking to `/venue/[slug]`).
4. **User Registration & Navigation (Expanded Scope):**
   * *Status:* Ready to be fully implemented.
   * *Required:* A `/register` page with a role selector (Jugador/Socio) and a floating `Navbar` on the homepage map with a user avatar dropdown menu (linking to `/profile`, `/dashboard`, or `/admin` depending on their role).
5. **Testing & Mocking:**
   * `src/__tests__/venue-profile.test.tsx` (Test suite asserting profile 404s, catalog filters, and review posts).
   * `scripts/mock-supabase.js` and `scripts/seed.js` (Updated to support slugs in mock data).

---

## 🏁 3. Step-by-Step Checklist to Resume & Finish the Sprint

If you are resuming this task, execute these steps in order:

### **Step 1: Check Repository Health**
Run our consolidated verification script to see the current state of compilation and test coverage:
```bash
npm run verify
```
*Note: You may see some TypeScript type errors or missing imports in the new profile/register pages. This is normal because they are active drafts!*

### **Step 2: Implement the `/register` Portal**
* Create `src/app/register/page.tsx`. Implement a clean form (Name, Email, Password) with a role selection input:
  * **Jugador** ➔ saves role as `'player'`.
  * **Socio** ➔ saves role as `'partner'`.
* Ensure it calls a Server Action to write the user profile to the `profiles` table in Supabase.

### **Step 3: Implement the Floating `Navbar`**
* Create `src/components/Navbar.tsx` as a sticky/floating header on top of the homepage map (`src/app/page.tsx`).
* **On the Left:** "El Meeple 🎲" Logo.
* **In the Center:** A "Registrar mi Local" button.
  * *Unauthenticated:* Clicking it opens an elegant modal: *"Para registrar tu negocio, primero debes crear una cuenta o iniciar sesión. Es gratis."* with buttons to `/login` and `/register`.
  * *Authenticated:* Redirects straight to `/onboarding`.
* **On the Right:**
  * *Guest:* "Iniciar Sesión" button.
  * *User:* Circular profile avatar (photo or initials) with a dropdown menu:
    * `👤 Mi Perfil` (links to `/profile`).
    * `🏪 Mi Panel de Socio` (visible ONLY to `partner` role, links to `/dashboard`).
    * `🛡️ Administración` (visible ONLY to `admin` role, links to `/admin`).
    * `🚪 Cerrar Sesión` (NextAuth sign out).

### **Step 4: Clean Up & Verify Type Safety**
* Audit all new files (`page.tsx`, `VenueProfileClient.tsx`, `Navbar.tsx`, `register/page.tsx`) for any linter warnings or implicit `any` types.
* Ensure all Jest unit/integration tests in `src/__tests__/venue-profile.test.tsx` pass perfectly:
  ```bash
  npm run test
  ```

### **Step 5: E2E Visual QA Walkthrough**
Following our **Three-Tier Testing Standard**, perform a live browser walkthrough:
1. Start the local mock Supabase server: `node scripts/mock-supabase.js`.
2. Start the dev server: `npm run dev`.
3. Open a browser subagent (Chrome DevTools MCP) and:
   * Walk through the `/register` flow as a partner and log in.
   * Walk through `/dashboard`, trigger BGG sync, and verify the visual cover arts grid.
   * Visit the homepage, check the floating `Navbar` dropdown, search for a game title, click the highlighted pin, click `"Ver Perfil y Ludoteca ➔"`, write a player review, and verify vibe bars update in real-time.
   * Capture high-resolution screenshots on both **Desktop (1280x800)** and **Mobile (390x844)** viewports.
   * Check the browser console logs for zero runtime errors.

### **Step 6: Push & Merge**
Commit all files, push the branch to GitHub, open PR #31, merge it into `main`, and delete the feature branch. You are done! 🏆
