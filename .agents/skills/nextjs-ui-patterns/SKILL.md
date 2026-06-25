---
name: nextjs-ui-patterns
description: Design rules, styling patterns, interactive UI components, and responsive design specifications for the Eco Caret application.
---

# Eco Caret Next.js UI Patterns & Guidelines

To maintain the premium "conscious luxury" brand identity of Eco Caret, please adhere to these standardized UI patterns, styling tokens, and layout guidelines.

---

## 1. Design System & Typography
The application uses **Plus Jakarta Sans** as the default font. Typography classes are defined under [app/globals.css](file:///d:/RetakeSolution/ecocaret/app/globals.css) and should match:
- **Headlines**: Use `font-headline-lg` (e.g., product titles) or `font-headline-md` (section titles).
- **Body Text**: Use `font-body-md` / `text-body-md` / `text-on-surface-variant` for general descriptive text.
- **Labels & CTAs**: Use `font-label-md` / `text-label-md` (usually combined with `uppercase tracking-widest` for buttons and sub-headers).

---

## 2. Color Palette & Material Design
All key colors are mapped to CSS custom variables under `@theme` inside [globals.css](file:///d:/RetakeSolution/ecocaret/app/globals.css) and can also be queried programmatically from [theme/colors.ts](file:///d:/RetakeSolution/ecocaret/theme/colors.ts):
- **Base Surfaces**: `bg-surface` and `text-on-surface` (warm linen tone `#fff8f4` / dark brown `#231a11`).
- **Cards & Inner Containers**: `bg-surface-container-low` or `bg-surface-container-high` to create clean layered hierarchy.
- **Borders & Dividers**: `border-outline-variant/30` or `border-outline-variant/10` for subtle boundaries.
- **Brand Colors**:
  - `bg-primary`: Gold accents (`#894d0d`).
  - `bg-secondary`: Terracotta highlights (`#8b4e39`).
  - `bg-tertiary`: Warm grey/clay tones (`#655b47`).

---

## 3. Interactive Component Patterns

### Modal Dialogs (e.g. `ProfileDialog`)
- Centered on screen with a glassmorphism backdrop:
  ```tsx
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/10 z-[201]">
      {/* dialog contents */}
    </div>
  </div>
  ```

### Side-out Drawers (e.g. `CartDrawer`)
- Slide in from the right edge with a backdrop click handler:
  ```tsx
  <div className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-surface border-l border-outline-variant/30 p-8 flex flex-col shadow-2xl transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
      {/* drawer contents */}
    </div>
  </div>
  ```

### Smooth-Height Accordions
- To animate height dynamically in React/Tailwind, use a wrapper grid with `grid-rows-[0fr]` to `grid-rows-[1fr]` transitions. Place `overflow-hidden` on the inner container:
  ```tsx
  <button onClick={toggleAccordion} className="w-full flex items-center justify-between py-5">
    <span>Accordion Header</span>
    <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>expand_more</span>
  </button>
  <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
    <div className="overflow-hidden">
      <div className="pb-6 text-on-surface-variant">
        {/* collapsible contents */}
      </div>
    </div>
  </div>
  ```

---

## 4. Responsive Design & Layout Shifting
- **Source Order vs Presentation**: On mobile view, prioritize showing buy actions and details above secondary text. If an element (e.g., the description accordion) needs to render in a different layout position on mobile than on desktop:
  1. Define a **shared render function** or nested functional component (e.g. `renderAccordionSection()`) inside the component body to avoid duplicating JSX logic.
  2. Call the helper function twice in your markup:
     - Wrap the desktop version in `<div className="hidden lg:block">...</div>`.
     - Wrap the mobile version in `<div className="lg:hidden mt-8">...</div>` at its respective mobile slot.
- **Icons**: Utilize Google Material Symbols exclusively:
  ```tsx
  <span className="material-symbols-outlined">icon_name</span>
  ```
