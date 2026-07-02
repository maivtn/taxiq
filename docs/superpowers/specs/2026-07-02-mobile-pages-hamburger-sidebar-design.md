# Mobile Pages Hamburger Sidebar Design

## Context

Most files under `html/pages/` are thin static shells that set `data-root=".."`, mount `#app`, and load the shared `html/assets/layout.js`. The standalone files `html/pages/mobile-two-account-tailwind-lucide.html` and `html/pages/mobile-two-account-tailwind-lucide copy.html` already implement their own mobile menu/sidebar templates and must be excluded from this change.

## Goal

On mobile viewports, shared `html/pages` screens should show a hamburger button. Tapping it opens the existing sidebar navigation as an off-canvas menu. The two standalone mobile-two account pages are unchanged.

## Recommended Approach

Update `html/assets/layout.js` once, because it owns the shared sidebar, topbar, and shell for the target `html/pages` screens. Scope mobile drawer behavior to pages where `document.body.dataset.root === ".."` so the shared `html/index.html` dashboard is not expanded beyond the request and the excluded standalone pages remain unaffected because they do not load this layout.

## Behavior

- Desktop and tablet widths above the existing mobile breakpoint keep the current fixed sidebar and collapse/expand button.
- Mobile widths at or below `767px` render the sidebar off-canvas instead of as a horizontal nav strip.
- The mobile topbar includes a hamburger button with an accessible label.
- Opening the hamburger reveals a backdrop and slides the sidebar in from the left.
- The menu closes when the user clicks the backdrop, taps a sidebar link, taps the close button, or presses Escape.
- The desktop collapsed/open preference can remain persisted in `localStorage`; mobile drawer open state is temporary and should not persist.
- The main content should remain full width on mobile, with no left margin while the drawer is closed.

## Components And Data Flow

- `renderHeader(meta)` adds a mobile-only hamburger button when the current shell is a pages shell.
- `renderSidebar()` reuses the existing nav groups and page metadata.
- `injectSidebarCSS()` changes the mobile CSS from horizontal strip behavior to drawer behavior for pages shells.
- New helper functions manage mobile drawer state by toggling classes and ARIA attributes on the sidebar, backdrop, and hamburger button.
- `renderShell(renderContent)` injects the sidebar, header, content, and backdrop in a deterministic order, then wires event handlers.

## Error Handling And Accessibility

- Missing elements should be handled defensively so pages still render if a selector is not found.
- The hamburger uses `aria-label`, `aria-controls`, and `aria-expanded`.
- The backdrop button has an accessible close label.
- Escape closes the drawer only when it is open.
- Closing on nav link click prevents the drawer from staying open during page navigation or hash/no-op demos.

## Testing

Use a lightweight DOM or browser verification because the project has no package-managed test suite.

- Verify `html/pages/analytics.html` at mobile width has a hamburger, hidden drawer, and backdrop.
- Click hamburger and verify the sidebar becomes visible and `aria-expanded="true"`.
- Click backdrop or press Escape and verify the sidebar closes and `aria-expanded="false"`.
- Verify a desktop width still uses the existing fixed sidebar margin behavior.
- Verify the two excluded standalone mobile-two account files remain unchanged in the diff.
