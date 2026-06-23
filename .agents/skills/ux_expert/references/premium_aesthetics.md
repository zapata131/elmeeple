# Premium Visual Standards and Aesthetics Specification

This document defines the high-end UI tokens, glassmorphism CSS templates, tactile transitions, and vector SVG specifications required to maintain the **El Meeple** premium brand aesthetic.

---

## 1. Tailwind Semantic Theme Configuration

To avoid hardcoding color hex codes across our components, we centralize our brand colors into Tailwind's `@theme` block in `src/app/globals.css`.

### Brand Color Tokens
*   `brand-bg`: `#F5F0E9` (Blanco Roto - main layouts, backgrounds)
*   `brand-dark`: `#3A3A3A` (Carbón Suave - primary text, borders, headers)
*   `brand-primary`: `#8367C7` (Malva Suave - brand identity, primary buttons, pins)
*   `brand-highlight`: `#FF9E8A` (Salmon/Coral - danger highlights, error badges)
*   `brand-success`: `#73D8D4` (Turquesa pastel - verified badges, success alerts)

---

## 2. Premium Glassmorphism Templates

To create depth and a luxurious, tactile feel, we use glassmorphic panels for our floating cards, dropdowns, and search modals.

### Glass Panel Utility Class
*   **Desktop Search Card & Onboarding Card**:
    `bg-[#F5F0E9]/95 border border-[#3A3A3A]/10 shadow-2xl backdrop-blur-md`
*   **Sidebar Cards (Idle State)**:
    `bg-white/80 border border-[#3A3A3A]/5 hover:border-[#8367C7]/25 hover:bg-white transition-all duration-200 shadow-sm`
*   **Sidebar Cards (Active/Selected State)**:
    `bg-white border-2 border-[#8367C7] shadow-md scale-[1.01]`

---

## 3. Tactile Transitions and Micro-Animations

Every click, hover, and loading state must provide smooth, high-fidelity tactile feedback to the user:

### Micro-Interactions
*   **Interactive Cards and Buttons**:
    `transition-all duration-200 ease-in-out hover:scale-[1.015] active:scale-[0.985]`
*   **Link Hovers**:
    `hover:text-[#8367C7] hover:underline transition-colors duration-150`
*   **Arrows & SVGs on Hover**:
    Animate vectors on hover, e.g., sliding an arrow SVG to the right:
    `transition-transform group-hover:translate-x-1 duration-200`

### Premium Loading States (Pulse vs. Spin)
*   Avoid noisy, generic spinning loading icons, which can increase user anxiety.
*   Use elegant, brand-colored pulse animations that hint at the layout structure:
    *   **Text loading**: `animate-pulse text-[#8367C7] font-semibold`
    *   **Image placeholders**: A soft gray pulse block (`w-14 h-14 bg-[#3A3A3A]/10 animate-pulse rounded-xl`)

---

## 4. Vector SVG Iconography Specifications (No Emojis)

Raw, colorful emojis are strictly prohibited in all headers, buttons, cards, and feeds. They must be replaced with custom, inline vector SVGs styled with our brand colors.

### Standard SVGs
Below are the official inline SVG definitions for commonly used icons:

#### 1. The Meeple Brand Logo / Avatar
Used in the brand header, onboarding Step 1, and map matching badges:
```tsx
<svg className="w-5 h-5 text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
</svg>
```

#### 2. Star Rating Glyphs (Typographic)
Used in rating summaries and comments feeds.
*   **Active Star**: `★` (styled with `text-yellow-500` or `#E2B63E` gold accent)
*   **Empty Star**: `☆` (styled with `text-[#3A3A3A]/20`)

#### 3. Verified Store badge
An elegant badge in Turquesa (`#73D8D4`) with a custom checkmark SVG, replacing the old shield `🛡️` emoji:
```tsx
<div className="flex items-center gap-1 bg-[#73D8D4]/15 text-[#73D8D4] border border-[#73D8D4]/25 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase">
  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
  </svg>
  Verificado
</div>
```
