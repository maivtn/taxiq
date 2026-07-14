# Customer Reward Responsive Redesign

## Context

`html/customer/customer-app-prototype.html` is a standalone customer rewards prototype with 31 screens, five navigation modules, bilingual EN/VI copy, and client-side demo flows for onboarding, rewards, scanning, tipping, direct payment, booking, offers, referrals, and settings. Its fixed phone frame, simulated notch/status bar, emoji-heavy visuals, and single-width layout make it feel like a prototype rather than a responsive web application.

The screen behavior and business rules remain governed by `html/customer/customer-app-developer-spec.md`. The existing prototype remains unchanged as a reference implementation.

## Goal

Create `html/customer/cutomer-reward.html` as a realistic, mobile-first responsive web application that:

- preserves all 31 screens and their existing interactive demo flows;
- preserves runtime EN/VI switching;
- keeps the existing dark purple, pink, cyan, green, and gold visual identity;
- fills the mobile viewport without a simulated device frame;
- uses bottom navigation on mobile and tablet;
- switches to a persistent sidebar on desktop;
- remains usable and visually balanced from small phones through wide desktop screens.

## Scope

### Included

- All screen IDs listed in the customer app developer specification.
- All five modules: Home, Wallet, Scan, Explore, and Profile.
- Existing navigation mappings between root and detail screens.
- Existing demo interactions and local state mutations.
- Shared loading, empty, pending, success, and error presentation patterns.
- Responsive layout, accessibility, and reduced-motion behavior.

### Excluded

- Backend APIs, authentication services, persistence, or production payment integration.
- Changes to business rules in `customer-app-developer-spec.md`.
- Changes to `customer-app-prototype.html`.
- Desktop-only features that do not exist in the 31-screen customer app.

## Technical Direction

The deliverable is one standalone HTML file using:

- Tailwind CSS v4 Browser CDN for layout, responsive utilities, and component styling;
- Lucide Browser CDN for a single consistent SVG icon system;
- plain JavaScript for navigation, local demo state, language switching, and interactions;
- CSS theme tokens and reusable Tailwind component classes inside the document.

Bootstrap and Bootstrap Icons will not be loaded. Tailwind Browser CDN is acceptable for this static prototype. A production release should compile Tailwind into a static CSS asset rather than use the browser CDN.

## Responsive Architecture

### Mobile: below 768px

- The application occupies the full viewport and respects `env(safe-area-inset-*)`.
- Content uses a single column with touch-friendly spacing.
- Five-tab bottom navigation remains fixed and reachable with one hand.
- Screen content has enough bottom padding to remain clear of navigation.
- Dialog-like actions use bottom sheets when appropriate.

### Tablet: 768px through 1023px

- Bottom navigation remains active.
- The content container grows while preserving readable line lengths.
- Compatible card collections and summary blocks may use two columns.
- Detail and form flows remain focused rather than stretching edge to edge.

### Desktop: 1024px and above

- Bottom navigation is replaced by a persistent sidebar approximately 248px wide.
- The sidebar contains the same five modules and active-state mapping as mobile navigation.
- Detail screens keep a Back action while the sidebar continues to highlight the parent module.
- Main content uses a centered maximum width of approximately 1200px.
- Dashboards and list screens use two or three columns where the information supports it.
- Forms, confirmations, and task-focused screens retain a narrower reading width.

## Visual System

- Preserve the current near-black background and purple-to-pink primary accent.
- Retain cyan for informational highlights, green for success, gold for points/rewards, and red for destructive or error states.
- Reduce large neon glows and heavy gradients so hierarchy comes from spacing, typography, and restrained borders.
- Use realistic business and staff imagery in discovery, merchant, booking, and look-history surfaces.
- Replace functional emoji with Lucide icons. Decorative emoji may remain only when it is meaningful product content.
- Use compact cards, clear section headings, and consistent radius, border, shadow, and spacing tokens.
- Keep body text readable and avoid oversized marketing-style headings inside the app shell.

## Shared Components

The file will define reusable component classes and consistent markup patterns for:

- mobile top bar and desktop sidebar;
- bottom navigation;
- page header and Back action;
- balance, business, offer, reward, appointment, activity, and look cards;
- search fields, form controls, segmented filters, chips, toggles, and amount selectors;
- primary, secondary, icon-only, and destructive buttons;
- toast, modal, confirmation dialog, and bottom sheet;
- loading skeleton, empty state, inline error, pending state, and success state;
- QR and scan surfaces;
- language switcher.

Tailwind theme values will centralize brand colors. Repeated visual patterns will use semantic component classes with `@apply` so the 31 screens do not duplicate long utility sequences.

## Screen And Navigation Model

- Preserve the existing 31 screen IDs to keep the documented screen inventory and demo flows aligned.
- Only one screen is active at a time.
- A single screen-to-module map controls both mobile bottom-nav and desktop sidebar highlighting.
- Root module navigation returns to Home, Wallet, Scan, Explore, or Profile.
- Detail navigation uses explicit Back targets instead of relying solely on browser history.
- Navigation resets the active screen scroll position and updates accessibility state.

## Client-Side State And Data Flow

One local application state object holds:

- active screen and active module;
- current language;
- per-business point balances;
- selected tip, payment, reward, booking, and filter values;
- onboarding, consent, notification, and confirmation states;
- demo-created looks, wishes, saved offers, and history entries.

JavaScript responsibilities are grouped by purpose within the file:

- navigation and responsive shell;
- translation and placeholder updates;
- onboarding and login;
- rewards, wallet, and redemption;
- scan and check-in;
- tip and direct payment;
- booking;
- explore, offers, and wish alerts;
- looks, reviews, referral, notifications, and preferences;
- shared overlays and feedback messages.

Event handlers update the state first and then render the affected UI. Reusable helpers handle screen changes, active navigation, translations, overlays, and formatted balances.

## Interaction And Accessibility

- Interactive controls have a minimum 44px target where practical.
- Icon-only controls include accessible labels and tooltips where their meaning is not obvious.
- Keyboard focus is clearly visible.
- Modals and sheets support Escape and restore focus when closed.
- Navigation exposes current state through appropriate ARIA attributes.
- Color is not the only signal for status.
- Motion is limited to screen transitions, sheets, scan feedback, and confirmations.
- `prefers-reduced-motion` disables nonessential animation.

## Empty, Loading, Pending, And Error Handling

- Lists provide purposeful empty states with a relevant next action.
- Search and filters show a no-results state without collapsing the page.
- Actions that simulate asynchronous work disable repeat submission while pending.
- Tip, payment, booking, and redemption preserve their documented pending-to-confirmed behavior.
- Invalid or incomplete form input displays an inline message and focuses the relevant field.
- CDN loading failure must not hide core content; meaningful text and native controls remain usable even if enhanced styling or icons are unavailable.
- Unknown screen targets fail safely by returning to Home.

## Validation

Run the static site from the existing `html/` local-server workflow and validate the new page at:

- 375 x 812 phone;
- 768 x 1024 tablet;
- 1024 x 768 small desktop;
- 1440 x 900 desktop.

At each relevant viewport, check for clipped text, horizontal overflow, obscured content, unusable fixed navigation, and incorrect column changes.

Exercise these flows end to end:

- login and OTP;
- onboarding and consent;
- scan and check-in;
- tip pending and confirmed;
- direct payment pending and confirmed;
- wallet, rewards, cross-redeem, and claimed reward;
- booking request and confirmation;
- Explore search and business details;
- offers filtering, saving, and wish alerts;
- Looks creation, private feedback, referral, message preferences, and profile;
- runtime EN/VI switching across representative root, detail, modal, toast, and form states.

## Acceptance Criteria

- `cutomer-reward.html` opens through the existing local static server with no build step.
- All 31 documented screens are present and reachable.
- Existing primary demo flows remain functional.
- Mobile and tablet show bottom navigation; desktop shows the sidebar at 1024px and above.
- No simulated phone frame, notch, or status bar remains.
- The approved color identity is recognizable without overwhelming glow effects.
- Functional icons use Lucide consistently.
- EN/VI switching works without reload.
- No tested viewport has horizontal page overflow, clipped controls, or content hidden behind fixed navigation.
- Keyboard focus, accessible labels, and reduced-motion behavior are present for shared controls.
