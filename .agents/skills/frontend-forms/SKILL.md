---
name: frontend-forms
description: Guidelines, component code patterns, styling classes, and state integration standards for form inputs, textareas, buttons, validations, and store integrations in the Eco Caret project.
---

# Eco Caret Frontend Form Guidelines & Patterns

Standardized rules and styling conventions for input fields, textareas, form layouts, buttons, and state bindings across the Eco Caret web application.

---

## 1. Form Structure & Submission
- Always wrap controls in a standard HTML `<form>` tag.
- Implement an explicit `onSubmit` handler and call `e.preventDefault()` immediately to handle asynchronous store integrations or API requests client-side.
- Ensure all submission actions notify the user of success or error (e.g., standard alerts, modal triggers, or success banners).

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // dispatch actions or submit API data
};
```

---

## 2. Input Fields Styling Patterns
Follow these tailwind class compositions to maintain luxury styling consistency:

### Form Field Wrapper
Wrap labels and inputs together in a column layout:
```tsx
<div className="space-y-1">
  {/* label & input inside */}
</div>
```

### Input Labels
Labels must be compact and faint:
```className="font-label-sm text-label-sm text-on-surface-variant"```

### Active Text, Email, & Password Inputs
Use warm surface containers with a thin border. On focus, apply the secondary brand color:
```className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"```

### Textareas
Add `resize-none` to prevent manual size changes breaking luxury page designs:
```className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none"```

### Read-Only / Disabled Inputs
Lower border visibility and use standard cursor indicators:
```className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-body-md outline-none text-on-surface-variant/60 cursor-not-allowed"```

---

## 3. Form Action Buttons
Primary form actions use secondary brand colors, fully rounded pills, and slight shadow elevations on hover:
```className="w-full bg-secondary text-on-secondary py-4 rounded-full font-label-md text-label-md hover:shadow-lg transition-all text-center mt-2 cursor-pointer"```

---

## 4. Input State Binding
Use controlled inputs via React `useState` hooks. Match types properly (e.g. `type="email"`, `type="password"`, `type="text"`) to leverage standard web browser autocomplete and validation:

```tsx
const [email, setEmail] = useState("");

<input
  type="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="..."
/>
```
