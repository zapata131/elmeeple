# Sprint handoff and continuity memo: Milestone 5 (Communities & Event Siting) Started

We have successfully merged the **Support Multiple Venue Types Selection & Remove Híbrido** (**Issue #74**) and integrated the **Tournaments & Event Listings** (**Issue #63**) features into our active workspace. We are now starting work on **Milestone 5: Communities, Event Siting & Map Positioning** (**Issue #75** and **Issue #76**).

---

## 1. Active sprint status and goal
*   **Active branch:** `feature/issue-75-communities-onboarding-map`
*   **Sprint status:** **In Progress (Milestone 5 Started)**
*   **Milestone goal:** Support informal gaming clubs and communities without fixed addresses by making location details optional during onboarding, positioning them dynamically on the map at their next upcoming event, and making event venue and registration URLs optional.

---

## 2. Completed work (Merged)

1.  **Multiple Venue Types (Issue #74)**:
    *   Replaced the single type select dropdown with checkboxes in [onboarding/page.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/src/app/onboarding/page.tsx).
    *   Removed the "Híbrido" type and updated all mock datasets to use `'cafe,tienda'` instead.
    *   Formatted multiple comma-separated types with bullet points (e.g. `Café de juegos • Tienda de juegos y TCG`) in cards, profiles, and dashboards.
    *   Updated map sidebar category filtering to support multi-type matching.
2.  **Tournaments & Event Listings (Issue #63)**:
    *   Created `events` table and integrated it with PostgreSQL Row-Level Security (RLS).
    *   Implemented server actions (`getEvents`, `createEvent`, `deleteEvent`) and integrated them with the partner dashboard via the `<EventManager />` component.
    *   Added a responsive **"Eventos"** tab to the storefront profile page (`/venue/[slug]`).
    *   Added mock events to the mock database for local development and testing.

---

## 3. Next steps and recommendations

1.  **Implement Map Siting for Communities (Issue #75)**:
    *   Open [InteractiveMap.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/src/components/InteractiveMap.tsx) and [Map.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/src/components/Map.tsx).
    *   Update rendering logic: for venues with type `comunidad` and null `lat`/`lng`, resolve the coordinates of their next upcoming event and render the map pin there.
    *   If no events are scheduled, exclude them from the map but keep them in the sidebar list.
2.  **Add Custom Pin Icon for Communities (Issue #75)**:
    *   Update the map pin marker component in [Map.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/src/components/Map.tsx) to render a distinct outline marker or a "group" SVG icon for communities.
3.  **Make Event Venue and Registration URL Optional (Issue #76)**:
    *   Modify the event database schema (or mock database in `mock-supabase.js`) to make `venue_id` and `registration_url` nullable.
    *   Update the event creation form in the partner dashboard to support optional venues and registration URLs.
4.  **Remove Discord as Contact Method (Issue #73)**:
    *   Remove Discord input from onboarding and dashboard forms, and remove the Discord icon from preview cards.
