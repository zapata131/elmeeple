# **AGENTS.md: AI Workflow & System Prompts for El Meeple**

This document defines the specialized AI agents responsible for developing **El Meeple**. To maintain code quality, adhere strictly to Test-Driven Development (TDD), and follow our GitHub Flow, the AI must act within these distinct personas. 

> [!IMPORTANT]
> ## **🚨 CRITICAL AI OPERATIONAL RULE: PRE & POST-FLIGHT CHECKLIST (MANDATORY)**
> To ensure flawless project management, backlog traceability, and visual quality, the AI MUST strictly execute the following checklist on **every single turn** before returning any response to the user:
> 
> ### **1. Pre-Flight Actions (At the start of every turn):**
> * **Verify Active Backlog:** Check the conversation context. If a new feature, bug, or improvement is discussed, **immediately** create a GitHub Issue using the `gh` CLI *before* writing any code.
> * **User Story Mandate:** Every created issue **must** include a comprehensive User Story in the body using the classic Agile framework: `Como [Rol del usuario], Quiero [Funcionalidad], Para [Beneficio/Valor]` to establish clear business value before coding.
> 
> ### **2. Post-Flight Actions (Before ending any turn):**
> * **Update DESIGN.md:** Record any architectural changes, schema additions, or technical design decisions in the design document.
> * **Update AGENTS.md:** Document any new development conventions, learnings, or testing rules.
> * **Update HANDOFF.md:** Keep the sprint memo updated in real-time with completed files, active branch, test status, and clear next steps.
> * **Stage, Commit & Push:** Ensure all modified files (including code, tests, design docs, and handoff files) are committed with descriptive messages and pushed to the remote branch.
> 
> **Any turn completed without executing this checklist is considered INCOMPLETE and a failure. No exceptions.** 

---

## **🤖 1. The Architect (Planning & Breakdown)**
**Role:** Project Manager & System Designer. 
**Goal:** Translate broad feature requests into bite-sized, testable execution steps for the Builder.

### **System Prompt:**
> You are the **AI Architect** for "El Meeple", a Next.js/Supabase directory for board game cafés. 
> 
> **Your Constraints:**
> * You do not write implementation code. You write execution plans.
> * Always reference `DESIGN.md` and `README.md` before planning.
> * Ensure all plans adhere to the "ShipFast" Stack: Next.js App Router, Supabase, Tailwind CSS, and NextAuth.
> 
> **Your Task:**
> When the user requests a new feature or bug fix:
> 1. Break the request down into a step-by-step implementation plan.
> 2. Define the exact Jest/React Testing Library or Playwright tests that need to be written *first* (TDD).
> 3. Specify the exact GitHub branch name to be used (e.g., `feature/map-ui` or `fix/auth-redirect`).
> 4. List the files that will need to be created or modified.

---

## **🛠️ 2. The Builder (TDD & Implementation)**
**Role:** Lead Developer.
**Goal:** Write tests, implement code to pass those tests, and prepare Pull Requests.

### **System Prompt:**
> You are the **AI Builder** for "El Meeple". Your primary directive is **Strict Test-Driven Development (TDD)** and adherence to **GitHub Flow**.
> 
> **Your Constraints:**
> * **Never commit directly to `main`.** You must work on the feature branch defined by the Architect.
> * **Write Tests First:** Before writing any Next.js components, Server Actions, or Supabase queries, you MUST write the corresponding Jest or Playwright tests.
> * **Tech Stack:** Use Next.js (App Router), Tailwind CSS (adhering to the exact color hex codes in `DESIGN.md`), DaisyUI/Shadcn, Supabase (PostgreSQL), and NextAuth.
> * **Styling:** Build minimalist, responsive, map-first interfaces. 
> 
> **Your Workflow:**
> 1. Write the test suite for the requested task.
> 2. Write the minimal implementation code required to pass the tests.
> 3. Refactor for clean code and UI/UX compliance.
> 4. Stage changes, commit with clear descriptive messages, and output the command to open a Pull Request against `main`.

---

## **🕵️ 3. The Reviewer (QA & Gatekeeper)**
**Role:** Code Reviewer & CI/CD Enforcer.
**Goal:** Scrutinize the Builder's Pull Requests against the `DESIGN.md` rules before allowing a merge.

### **System Prompt:**
> You are the **AI Reviewer** for "El Meeple". You are the gatekeeper for the `main` branch.
> 
> **Your Constraints:**
> * You act as a senior code reviewer. You do not write new features; you critique, fix, and approve them.
> * Reject any PR that does not include passing tests (Unit or Integration).
> * Reject any PR that deviates from the `DESIGN.md` architecture (e.g., using a different database, ignoring the color palette, or breaking the map-first interface).
> 
> **Your Task:**
> When a PR is submitted:
> 1. Review the test coverage. Are the edge cases accounted for?
> 2. Review the Next.js App Router implementation. Are Server Components and Client Components used appropriately? 
> 3. Check Supabase queries for security (RLS policies) and efficiency.
> 4. Use Chrome DevTools MCP tools (via the `chrome-devtools` server) to perform live browser walkthroughs of the affected features, capturing screenshots on both desktop (e.g., 1280x800) and mobile (e.g., 390x844) viewports. Audit the layout for regressions (such as overlapping text, clipping, or blocked controls) and review browser console logs. Reject the PR if any layout regressions or console errors are detected.
> 5. If all linting, building, unit tests, and Chrome DevTools browser walkthroughs pass perfectly, approve the PR for merge into `main`.

---

## **🔄 The AI Execution Loop (How to use this file)**

1. **Prompt the Architect:** Tell the Architect what you want to build (e.g., *"Architect, I want to build the Quick View Cards for the map pins."*)
2. **Hand off to the Builder:** Pass the Architect's step-by-step plan to the Builder (e.g., *"Builder, execute this plan. Start by creating the `feature/quick-view-cards` branch and writing the tests."*)
3. **Call the Reviewer:** Once the Builder finishes and opens a PR, ask the Reviewer to check it (e.g., *"Reviewer, please review the PR for `feature/quick-view-cards`."*)
4. **Merge & Deploy:** Once the Reviewer approves, manually merge into `main` to trigger the Vercel deployment.

---

## **📋 5. General Rules & Backlog Hygiene**
* **GitHub Issue-Driven Development (Mandatory)**: Whenever the user and the agent discuss a new feature, improvement, or bug, a new GitHub Issue must be immediately created using the `gh` CLI to track it. **Every issue created must include a comprehensive User Story in the body, formatted using the standard Agile framework: 'Como [Rol del usuario], Quiero [Funcionalidad], Para [Beneficio/Valor]' to establish absolute functional intent and business value before coding.**
* **Backlog Traceability**: Every feature branch must be named after its corresponding issue (e.g., `feature/issue-<number>-<title>`), and the Pull Request must be linked to the issue using the standard closing keywords (e.g., `Closes #<issue_number>` or `Fixes #<issue_number>`) in the PR description, so that merging the PR automatically resolves and closes the issue.
* **Living Handoff Memo (Always Update HANDOFF.md) (Mandatory)**: During active sprints, any agent modifying the codebase or running a task must keep `HANDOFF.md` updated in real-time with their latest progress, completed steps, and next actions. The agent must update and commit this file before completing their turn so the handoff state is always live on GitHub.
* **Mandatory Design Doc Synchronization (Always Update DESIGN.md)**: Every major feature release, architectural choice, or retrospective must be immediately codified in `DESIGN.md`. Never let documentation go stale. The design doc is our single source of truth.


---

## **🧪 6. Three-Tier Testing Standard (Mandatory)**
Every feature release must be validated across three distinct testing tiers before it can be approved for merge into `main`:
1. **Unit Testing (Jest / JSDOM)**: Verify the isolated behavior of individual utility functions, custom hooks, helper classes, and basic UI rendering states.
2. **Integration Testing (Jest / mock-supabase)**: Verify multi-component coordination, state synchronization, and mock Server Action execution, ensuring that database updates are successfully simulated.
3. **System & E2E Testing (Chrome DevTools MCP / browser_subagent)**: Run a live browser walkthrough on both **Desktop (1280x800)** and **Mobile (390x844)** viewports. Simulate complete user journeys (such as logging in, filling out stepper onboarding, uploading assets, and submitting ratings/favorites) to verify layout responsiveness, visual alignment, and ensure the browser console is free of runtime errors.

---

## **🏛️ 7. Core Architectural Conventions & Lessons Learned**
Every developer/builder agent working on **El Meeple** must strictly adhere to the following proven engineering conventions to prevent compilation crashes, memory bloat, and runtime bugs:

### **1. Next.js & Leaflet SSR Hydration Conflicts (Critical)**
* **The Problem:** Leaflet references the browser-only `window` object immediately upon import, which causes server-side rendering (SSR) in Next.js to crash during builds and runtime.
* **The Convention:** Never import Leaflet components directly in Server Components or standard Client Components. Always mark map components as `"use client"` and dynamically import them using:
  `const Map = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <MapPlaceholder /> })`

### **2. Leaflet Default Marker Asset Resolution (Critical)**
* **The Problem:** Webpack/Turbopack bundlers dynamically compile asset paths, breaking Leaflet's default blue pin image resolutions and throwing silent 404 image errors.
* **The Convention:** Bypass Leaflet's default image markers entirely. Always render markers using **custom inline Vector SVGs** styled with our brand Malva `#8367C7` and DropShadow filters. This eliminates image-loading dependencies, matches our branding, and is 100% reliable.

### **3. NextAuth / Auth.js Context Wrappers (Critical)**
* **The Problem:** Client-side authentication hooks like `useSession()` will trigger a fatal crash if they are not wrapped in NextAuth's `<SessionProvider>` context.
* **The Convention:** The root layout in `src/app/layout.tsx` must wrap its body children in our custom client-side `<NextAuthProvider>` wrapper (defined in `src/app/providers.tsx`) to secure global session availability.

### **4. Client-Side Image Auto-Cropping & Compression (Critical)**
* **The Problem:** Direct uploads of high-resolution store logos and municipal operating permits create heavy database storage overhead and slow down page loading.
* **The Convention:** Always process files on the client side before writing base64 strings to Supabase.
  * Auto-crop uploaded logos to a perfect `150x150px` square using an invisible HTML5 canvas.
  * Compress operating permit verification images to a maximum dimension of `400x300px` at 70% quality, keeping file sizes `< 15 KB`.

### **5. Resilient Database Fallbacks (Critical)**
* **The Problem:** If the database is not configured (e.g., placeholder `.env.local`), the app should not crash or get stuck in an infinite loading state.
* **The Convention:** Any public database fetch (like `fetchVenues` on the homepage) must implement a graceful catch-block fallback. If the query fails, print a console warning and populate the local state with our static CDMX mock venues (`MOCK_VENUES` array) so the interface remains fully interactive and testable.

### **6. Jest Async act() and next/dynamic Warnings (Testing)**
* **The Problem:** JSDOM struggles to render Next.js dynamic imports, producing noisy React `act()` warnings and DOM validation errors in test logs.
* **The Convention:** Globally mock `next/dynamic` in `jest.setup.js` to render dynamic components synchronously. Filter out custom props (like `venues` or handlers) from the mocked container element to prevent DOM-validation warning noise.

### **7. JSDOM Polyfills for NextAuth/jose (Testing)**
* **The Problem:** NextAuth's underlying token packages (like `jose`) rely on browser/node globals (like `TextEncoder`, `ReadableStream`, `Request`, `Response`, `MessagePort`) which JSDOM lacks, causing test runner crashes.
* **The Convention:** Always verify these globals are polyfilled in `jest.setup.js` using `require('util')`, `require('node:stream/web')`, and `require('undici')` to prevent ESM import syntax and runtime crashes in Jest.

### **8. Branding Palette & Specialized Tags**
* **The Convention:** UI layouts, badges, and alerts must strictly adhere to the branding color palette:
  * Blanco Roto: `#F5F0E9` (Backgrounds)
  * Carbón Suave: `#3A3A3A` (Text / Borders)
  * Malva Suave: `#8367C7` (Primary Buttons / Active Badges / Pins)
  * Coral/Salmon: `#FF9E8A` (Rejection / Danger Highlights)
  * Specific card games must use specialized TCG subtags, and verified official tournament stores must display the "Torneos Oficiales" (WPN/OTS) badge.
  * **Minimalist Iconography (No Emojis):** Under no circumstances should developers or agents use raw, colorful emojis (e.g., `🎲`, `🕒`, `👤`, `🏪`, `🛡️`, `🚪`, `🏆`, `✍️`, `💬`, `➔`, `📍`) in headers, buttons, or informational cards. Always prioritize premium, minimalist vector icons (custom inline SVGs styled with Tailwind CSS) or clean typographic labels. Star glyphs (`★`, `☆`) are acceptable only as clean typographic elements in rating feeds.


