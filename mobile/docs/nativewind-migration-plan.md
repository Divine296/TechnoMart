# NativeWind Migration Plan

## Objectives

- Replace bespoke `StyleSheet` usage with `NativeWind` utility classes while keeping parity with current layouts.
- Centralize typography, spacing, and color decisions in Tailwind tokens for consistency and easier theming.
- Rename routes and components to be explicit about their feature areas without breaking Expo Router navigation.

## Current State Audit

- Styling relies on `StyleSheet.create` definitions spread across every screen (`src/app/**`) and shared components (`src/components/**`). The styles reiterate the same colors (e.g. `#FF8C00`, `#F5F5F5`, `#6B7280`) and spacing rules.
- Tailwind and `nativewind` dependencies are installed, but `tailwind.config.js` only extends with the preset; no project-specific tokens exist.
- `global.css` only wires Tailwind directives; there is no `NativeWindStyleSheet` configuration file.
- Route files follow Expo Router conventions (`src/app/(tabs)/index.jsx`, `src/app/login.jsx`, etc.) but several names are generic (`FoodOrdersScreen.jsx`, `orders.jsx`) which makes the usage context ambiguous.

## Phase 0 - Tooling & Configuration

1. **Bootstrap NativeWind output**
   - Create `src/styles/nativewind.ts` (or `.js`) where `NativeWindStyleSheet.setOutput({ default: 'native' });` is invoked. Import this module once in `_layout.js` so the configuration loads before any screen renders.
2. **Tailwind config extension**
   - Update `tailwind.config.js` to extend `theme.colors`, `fontFamily`, and `borderRadius` with the palette below.
   - Configure content paths to include `src/styles/**/*.{js,jsx,ts,tsx}` for helper utilities.
3. **Link font families**
   - Define `fontFamily: { sans: ['Roboto_400Regular', 'System'], heading: ['Roboto_700Bold', 'System'] }` in Tailwind and use Tailwind's `font-` utilities instead of manual `useFonts` assignments where possible. Keep `useFonts` for loading but rely on class names for styling.
4. **Add helper utilities**
   - Introduce a `cn.ts` helper that wraps `clsx`/`tailwind-merge` if more complex conditional class logic is needed.

## Phase 1 - Tokenize Design Language

1. **Color tokens**
   - Implement the palette under `theme.extend.colors` and expose semantic aliases (`primary`, `accent`, `surface`, `text`).
   - Replace hard-coded color literals with semantic utilities (`bg-primary-500`, `text-surface-950`, etc.) during refactors.
2. **Spacing & Radii**
   - Audit recurring spacing values (`paddingHorizontal: 12`, `borderRadius: 24`, etc.) and map them to Tailwind equivalents (`px-3`, `rounded-3xl`). Where gaps exist, extend the Tailwind scale (e.g. add `spacing: { 4.5: '18px' }`).
3. **Typography**
   - Define text styles via Tailwind utility compositions. Example: `text-title-lg` plugin class for `text-[30px] font-heading text-text-900` using the `@tailwindcss/typography` plugin or custom variants.

## Phase 2 - Component Refactors (Incremental)

1. **Shared UI primitives first**
   - Convert `src/components/Header.jsx`, `Recommended.jsx`, `Categories.jsx`, etc. to use `className`. This ensures reusable pieces provide Tailwind-friendly APIs to downstream screens.
   - Re-export frequently used primitives (e.g. `Pressable`, `Text`, `View`) as `styled` components via `nativewind`. Example:
     ```jsx
     import { styled } from 'nativewind';
     export const ThemedPressable = styled(Pressable);
     ```
2. **Core screens next**
   - Prioritize high-traffic routes: `src/app/(tabs)/home-dashboard.jsx` (current `index.jsx`), `cart`, `orders`, `profile`. Break the conversions into sub-tasks to avoid oversized diffs.
   - Replace entire `StyleSheet.create` blocks with Tailwind classes. For dynamic styles (`openDropdown ? styles.dropdown : styles.hidden`) swap to conditional `className` concatenation.
3. **Forms, Modals, and Lists**
   - Address authentication screens (`login`, `register`, `forgot-password`) and modals after shared components are ready, so buttons/inputs reuse the same utility classes.
   - Extract repeating button styles into a `Button` component with Tailwind variants (potentially using `class-variance-authority` if the team prefers).
4. **Category stacks**
   - `src/app/(stack)/categories/*.jsx` share near-identical layouts. Refactor one file to NativeWind, extract shared layout pieces, then propagate the pattern across the remaining files.

## Phase 3 - Cleanup & Validation

1. **Remove residual StyleSheet usage**
   - Search for `StyleSheet.` and migrate any remaining instances. Allow exceptions only when inline computed styles are unavoidable; document these in code comments.
2. **Delete unused CSS**
   - Once conversions are complete, `global.css` should only contain Tailwind directives. If no custom CSS remains, keep it minimal but document its purpose.
3. **Documentation**
   - Update `README.md` with a short "Styling Guidelines" section summarizing how to apply NativeWind classes, where tokens live, and expectations for new components.

## Testing & QA Strategy

- **Automated**: Ensure existing Jest suites continue to run; add snapshot tests for critical components after refactors to catch unintentional layout shifts.
- **Visual**: Use Expo Preview builds (or Storybook if introduced) to visual-check typography, spacing, and color usage for each converted screen.
- **Interactive**: Validate focus, hover (web), and pressed states for buttons since NativeWind introduces state-specific utilities (e.g. `pressed:bg-primary-600`).

## Color Theme & Palette

Integrate this palette into `tailwind.config.js` under `theme.extend.colors`:

| Token                             | Hex       | Suggested Usage                                |
| --------------------------------- | --------- | ---------------------------------------------- |
| `primary-50`                      | `#FFF4E5` | Elevated surfaces, subtle backgrounds          |
| `primary-100`                     | `#FFE4C7` | Selected list rows                             |
| `primary-200`                     | `#FFD199` | Chips, secondary highlights                    |
| `primary-300`                     | `#FFB56B` | Badge backgrounds                              |
| `primary-400`                     | `#FF9B42` | Hover / pressed states                         |
| `primary-500` (`primary.DEFAULT`) | `#FF8C00` | Primary buttons, CTAs                          |
| `primary-600`                     | `#E97800` | Button pressed / focus rings                   |
| `primary-700`                     | `#C86100` | Dark backgrounds, gradient stops               |
| `primary-800`                     | `#A24B00` | Active tab indicators                          |
| `primary-900`                     | `#7A3600` | Dark theme accents                             |
| `primary-950`                     | `#4F2100` | Deep shadows                                   |
| `accent-500`                      | `#22C55E` | Success states (existing `#27AE60` equivalent) |
| `accent-600`                      | `#16A34A` | Success pressed state                          |
| `warning-500`                     | `#F59E0B` | Informational banners                          |
| `info-500`                        | `#2563EB` | Links / informational text                     |
| `neutral-50`                      | `#F9FAFB` | App background                                 |
| `neutral-100`                     | `#F5F5F5` | Cards                                          |
| `neutral-200`                     | `#E5E7EB` | Borders, dividers                              |
| `neutral-400`                     | `#9CA3AF` | Placeholder text                               |
| `neutral-500`                     | `#6B7280` | Body copy secondary                            |
| `neutral-700`                     | `#374151` | Body copy default                              |
| `neutral-900`                     | `#111827` | Headlines                                      |
| `surface-0`                       | `#FFFFFF` | Base white                                     |
| `surface-muted`                   | `#F3F4F6` | Alternate backgrounds                          |

Add semantic aliases for common usage:

```js
extend: {
  colors: {
    primary: { ...palette.primary, DEFAULT: '#FF8C00' },
    accent: { 500: '#22C55E', 600: '#16A34A' },
    warning: { 500: '#F59E0B' },
    info: { 500: '#2563EB' },
    neutral: { /* as above */ },
    surface: {
      DEFAULT: '#FFFFFF',
      muted: '#F3F4F6',
      subtle: '#F9FAFB',
    },
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      inverted: '#FFFFFF',
    },
  },
}
```

## File Renaming Roadmap

Execute renames in parallel with the styling migration to keep diffs small. After each rename, run `rg`/`eslint --fix` to update imports and router references.

| Current Path                                | Proposed Path                                       | Notes                                                                                                               |
| ------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `src/app/(tabs)/index.jsx`                  | `src/app/(tabs)/home-dashboard.jsx`                 | Update `Tabs.Screen name="home-dashboard"` and set `initialRouteName="home-dashboard"` to preserve the default tab. |
| `src/app/(tabs)/cart.jsx`                   | `src/app/(tabs)/customer-cart.jsx`                  | Rename Tab config to `name="customer-cart"` and update any `router.push('/cart')` calls.                            |
| `src/app/(tabs)/orders.jsx`                 | `src/app/(tabs)/order-tracking.jsx`                 | Aligns with functionality around status tracking.                                                                   |
| `src/app/(tabs)/profile.jsx`                | `src/app/(tabs)/account-profile.jsx`                | Emphasizes account management context.                                                                              |
| `src/app/login.jsx`                         | `src/app/account-login.jsx`                         | Update stack registration in `_layout.js` (`<Stack.Screen name="account-login" />`) and adjust navigation calls.    |
| `src/app/register.jsx`                      | `src/app/account-registration.jsx`                  | Same stack updates and router pushes.                                                                               |
| `src/app/forgotpassword.jsx`                | `src/app/account-password-reset.jsx`                | Maintain camelCase route usage conversions.                                                                         |
| `src/app/FaceScanScreen.jsx`                | `src/app/biometric-face-enrollment.jsx`             | Update any references from `FaceScanScreen`.                                                                        |
| `src/app/splash.jsx`                        | `src/app/app-launch.jsx`                            | Adjust root stack to use the new name.                                                                              |
| `src/app/screen/FoodOrdersScreen.jsx`       | `src/app/screen/food-order-management.jsx`          | Update direct imports and router pushes (`router.push('screens/food-order-management')`).                           |
| `src/app/screen/PaymentMethods.jsx`         | `src/app/screen/payment-method-options.jsx`         |                                                                                                                     |
| `src/app/screen/PersonalInfo.jsx`           | `src/app/screen/personal-information-editor.jsx`    |                                                                                                                     |
| `src/app/screen/OrderHistory.jsx`           | `src/app/screen/order-history-timeline.jsx`         |                                                                                                                     |
| `src/app/(stack)/categories/ComboMeals.jsx` | `src/app/(stack)/categories/combo-meal-catalog.jsx` | Mirror pattern for `Drinks`, `Meals`, `Snacks` as `*-catalog.jsx`.                                                  |

_Note_: Because Expo Router derives routes from filenames, every rename requires updating navigation calls (`router.push`, `Link href`, stack registrations). Plan to touch navigation files immediately after each rename to avoid runtime 404s.

## Risk & Mitigation

- **Large refactor scope**: Break migrations into small PRs per feature area (e.g. "Home tab NativeWind conversion") to keep review manageable.
- **Visual regressions**: Capture reference screenshots before converting each screen; compare after conversion.
- **Performance**: NativeWind generates styles at runtime. Keep className strings static where possible and avoid concatenating large numbers of conditional utilities.
- **Developer onboarding**: Add a short style guide to the repo and schedule a walkthrough so all contributors are comfortable with NativeWind idioms.

## Suggested Timeline

1. Week 1: Complete Phase 0, implement color tokens, convert shared components, and rename auth routes.
2. Week 2: Migrate tabs screens (`home-dashboard`, `customer-cart`, `order-tracking`, `account-profile`).
3. Week 3: Handle secondary screens (`screens/**`), category stacks, and finalize cleanup.
