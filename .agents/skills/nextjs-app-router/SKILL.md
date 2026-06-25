---
name: nextjs-app-router
description: Guidelines, best practices, and project conventions for working with the Next.js App Router in this codebase.
---

# Next.js App Router Guide (Eco Caret)

This project is built using **Next.js 16.2.7** and **React 19.2.4**. The environment and APIs have unique behaviors that differ from older Next.js versions. Please follow these guidelines and conventions when making changes.

---

## 1. Environment Variables
- **Client-side access**: Any environment variable that needs to be accessed by client components (browser-side) **must** be prefixed with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_API_BASE_URL`).
- **Server-side access**: Regular environment variables (no prefix) are only accessible in server components, API routes, or server-side utility functions. They will evaluate to `undefined` in client components.
- Default settings are located in [.env](file:///d:/RetakeSolution/ecocaret/.env).

---

## 2. Instant Navigations & Caching
This codebase uses Cache Components (`cacheComponents: true` config) and React 19 `'use cache'` semantics.

### Route Segment Configuration
- Use the `unstable_instant` export from page files to define and validate instant static shells at dev time and build time:
  ```typescript
  export const unstable_instant = { prefetch: 'static' }
  ```
- If a specific layout or page relies on highly dynamic data (e.g., cookies, session headers) and cannot be instant, opt-out using:
  ```typescript
  export const unstable_instant = false
  ```

### Suspense Placement
- Make sure dynamic/uncached data fetches (e.g. live inventory, search query results) are wrapped in local `<Suspense>` boundaries. If a component suspends outside a `<Suspense>` boundary on a client navigation, the router will freeze the interface or show hydration errors.
- Resolve dynamic route parameters using `.then()` inside the JSX to prevent blocking:
  ```tsx
  <Suspense fallback={<p>Loading details...</p>}>
    {params.then(({ id }) => (
      <ProductDetails id={id} />
    ))}
  </Suspense>
  ```

---

## 3. Redux Store & Providers
The application uses Redux Toolkit to manage states (Cart, Profile, Wishlist) via a [StoreProvider](file:///d:/RetakeSolution/ecocaret/components/StoreProvider.tsx).

### React 19 Ref Warning
- **Important**: Do not access `useRef` current values (like `storeRef.current`) during the render phase. In React 19, this triggers a linter error (`Cannot access ref value during render`).
- To initialize a store ref exactly once, check that the ref is null with the pattern:
  ```typescript
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  ```
- Avoid rendering or passing `storeRef.current` directly if it changes during rendering. Reference it in callbacks or pass the initial value carefully.

---

## 4. Navigation Links
- **Rule**: Never use traditional `<a>` tags for internal pages. Doing so triggers a browser reload, dropping client-side UI states and breaking navigations.
- **Solution**: Always use the `<Link>` component from `next/link`.
  ```tsx
  import Link from "next/link";
  
  <Link href="/collections">Explore Collections</Link>
  ```

---

## 5. Styling & Theme System (Tailwind CSS v4)
- **Tailwind CSS v4** is used. Theme variables are declared in [app/globals.css](file:///d:/RetakeSolution/ecocaret/app/globals.css) inside `@theme { ... }` block.
- Keep inline values consistent with the predefined theme keys (e.g., `bg-surface`, `text-on-surface`, `border-outline-variant`, `bg-surface-container-high`).
- **Icons**: The project uses Google Material Symbols. Render them using:
  ```tsx
  <span className="material-symbols-outlined">icon_name</span>
  ```
