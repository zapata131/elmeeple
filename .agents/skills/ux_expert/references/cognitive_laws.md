# Cognitive Psychology Laws for UX Auditing

This document defines the core cognitive science laws and UX principles that the **UX Expert** must use to audit and refine user interfaces across the platform.

---

## 1. Hick's Law (Decision-Making Fatigue)
> *The time it takes to make a decision increases with the number and complexity of choices.*

### Application in El Meeple
*   **Onboarding Wizard**: Instead of presenting a single massive form with 30 inputs (which causes high cognitive fatigue and high abandonment rates), we chunk the registration into a step-by-step wizard.
*   **Homepage Search**: The search bar is kept extremely clean. Instead of exposing multiple complex search inputs simultaneously, a simple toggle allows the user to choose between "Buscar locales" and "Buscar juegos."
*   **Tag Selectors**: Predefined specialties tags are grouped cleanly, allowing owners to easily tap-to-select without scanning long lists.

---

## 2. Fitts's Law (Reachability and Target Size)
> *The time to acquire a target is a function of the distance to and size of the target.*

### Application in El Meeple
*   **Thumb-Friendly Mobile Layouts**: On mobile screens, all primary action buttons (e.g., "Siguiente," "Publicar reseña," or the search toggle) must be placed in the lower half of the viewport, making them easily reachable by the user's thumb.
*   **Touch Targets**: All buttons, links, and checkboxes on mobile viewports must have a minimum clickable area of `44x44px` with sufficient padding to prevent accidental taps.
*   **Bypassing the Mobile Scroll Abyss**: On storefront profiles, we avoid stacking long grids of 100+ board games vertically on mobile. Stacking forces the reviews section and its "Escribir reseña" button to the bottom of a massive page, violating Fitts's Law. Introducing mobile tabs (`[ Ludoteca ]` / `[ Comunidad ]`) keeps all controls instantly reachable on a single mobile screen height.

---

## 3. Jakob's Law (Familiarity and Mental Models)
> *Users spend most of their time on other sites. They expect your site to work the same way as all the other sites they already know.*

### Application in El Meeple
*   **Yelp-Style Storefronts**: A directory storefront page must feel familiar. We follow the established mental model: a prominent top header banner (with a store logo, name, verified status, and address), followed by a dual-column layout on desktop (left-side catalog grid, right-side ratings summary, community vibes, and reviews feed).
*   **Map Controls**: Zoom controls are positioned in the top-right corner, and the search panel floats on the left, matching the mental model established by Google Maps and Airbnb.
*   **Onboarding Stepper**: The step indicator at the top of the onboarding wizard uses standard numbered circular steps, giving users a clear, familiar sense of progress.

---

## 4. Miller's Law (Working Memory Limits)
> *The average person can only keep 7 (plus or minus 2) items in their working memory.*

### Application in El Meeple
*   **Onboarding Funnel Length**: We limit our onboarding wizard strictly to 5 steps by combining the account confirmation and store details. This avoids overwhelming the user's working memory.
*   **Category Filter Chips**: We limit the homepage category filter chips to a curated selection of the most popular gaming preferences (e.g. Eurogames, TCGs, Café, Wargames, Torneos) to prevent scanning fatigue.

---

## 5. Peak-End Rule (Emotional Memory)
> *People judge an experience largely based on how they felt at its peak (the most intense point) and at its end, rather than the average of every moment.*

### Application in El Meeple
*   **Successful Collection Sync**: Sincronizing a store's board game catalog via BGG is a "peak" moment. The success screen must feel incredibly rewarding, rendering a beautiful success message (e.g., *"¡Colección sincronizada con éxito! Sincronizamos X juegos"*) in Turquesa and displaying a preview of the imported gallery.
*   **Onboarding Completion**: The final step of onboarding is the "end" of the funnel. Upon submission, we display a gorgeous, premium confirmation layout featuring our brand meeple SVG, welcoming the partner to the community, and showing a clear "Ir al panel de socio" CTA to leave a lasting positive impression.
