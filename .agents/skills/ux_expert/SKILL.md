---
name: ux_expert
description: "A specialized Product Design and UX Audit skill. Equips the AI with advanced cognitive psychology laws, premium visual design tokens, accessibility standards, and conversational copywriting playbooks to critique and refine user experiences."
---

# UX Expert Skill: Product Design and UX Audit Playbook

This skill is automatically loaded to equip the AI with world-class product design frameworks, cognitive psychology principles, and premium visual standards. Use this playbook to critique, refine, and optimize all user journeys, layouts, copywrite tones, and responsiveness across **El Meeple**.

---

## 1. UX Audit Methodology

When analyzing a page, feature, or user journey, execute a rigorous audit across the following six dimensions:

### 1.0 Brand Synchronization and Design Doc Alignment (Mandatory Pre-Flight)
Before auditing any component, page, or layout, you **MUST** perform the following alignment checks:
*   **Read `DESIGN.md`**: Open and read [DESIGN.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/DESIGN.md) to internalize our current database schemas, page structures, and brand guidelines.
*   **Verify Brand Tokens**: Ensure that any layout proposal, specialty tag, or color accent perfectly matches the official brand tokens defined in `DESIGN.md` (Blanco Roto `#F5F0E9`, Carbón Suave `#3A3A3A`, Malva Suave `#8367C7`).
*   **Technical Feasibility**: Verify that your UI design proposals are fully supported by our Supabase schema and NextAuth session properties documented in `DESIGN.md`. Do not propose mock fields or data flows that contradict our database architecture.

### 1.1 Friction and Cognitive Load
*   **Redundancy**: Are we asking the user to type information we already have (e.g., re-typing active session email, manually entering address coordinates)?
*   **Step Count**: Can we combine steps in a funnel to reduce cognitive strain (e.g., converting a 6-step onboarding wizard into a 5-step form by integrating account confirmation)?
*   **Affordances**: Are interactive elements (buttons, inputs, toggle pills) easily recognizable? Do they have distinct hover, focus, active, and loading states?

### 1.2 Hierarchy and Layout Density
*   **Mobile Adaptability**: Does the layout collapse elegantly on mobile viewports without sacrificing reachability?
*   **Information Scannability**: Is there a clear focal point? Are typography sizes, weights, and letter-spacings structured to guide the eye?
*   **Scroll Fatigue**: On mobile devices, are long scroll grids split using tabs or drawers to keep interactive controls close to the thumb?

### 1.3 Premium Aesthetics and Contrast
*   **Color Harmony**: Are brand colors (Blanco Roto, Carbón Suave, Malva Suave, Coral, Turquesa) used systematically and with purpose?
*   **Emoji Ban**: Are raw emojis strictly prohibited in headers, buttons, cards, and feeds? Are they replaced with custom inline vector SVGs or clean typographic glyphs?
*   **Glassmorphism & Micro-animations**: Do we utilize subtle borders (15%), background opacities (5-10%), and smooth transitions (`duration-200`) to create a premium, tactile feel?

### 1.4 Accessibility and Legibility
*   **Contrast Ratios**: Do text colors against backgrounds satisfy WCAG 2.2 AA (4.5:1) or AAA (7:1) contrast standards?
*   **Touch Targets**: Are all interactive buttons on mobile at least `44x44px` with adequate spacing to prevent accidental clicks?

### 1.5 Conversational Voice
*   **Tone of Voice**: Is the copy warm, direct, and user-centric (following the Google Developer Documentation Style Guide)?
*   **Active Voice**: Address the user in the second person ("you" / "tú"). Explain backend achievements in a comforting, human way instead of exposing technical database jargon.
*   **Casing Consistency**: Ensure all page titles, card headers, form labels, and buttons are in beautiful **sentence case**.

---

## 2. Playbook References

Refer to the following specialized documents in this skill's directory for deep-dive guidelines:
1.  **[references/cognitive_laws.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/.agents/skills/ux_expert/references/cognitive_laws.md)**: Applying Fitts's Law, Hick's Law, Jakob's Law, and Miller's Law.
2.  **[references/premium_aesthetics.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/.agents/skills/ux_expert/references/premium_aesthetics.md)**: Semantic Tailwind tokens, glassmorphism templates, and SVG iconography.
3.  **[references/conversational_copy.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/.agents/skills/ux_expert/references/conversational_copy.md)**: Google-style copywriting, humanized states, and sentence-case rules.
