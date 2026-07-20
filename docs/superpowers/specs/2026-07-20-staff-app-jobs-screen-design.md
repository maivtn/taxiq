# Staff App Jobs Screen Design

**Date:** 2026-07-20  
**Status:** Approved through the user's implementation request

## Goal

Rename the standalone staff mobile experience from
`html/pages/mobile-two-account-tailwind-lucide.html` to
`html/pages/staff-app.html` and add a Jobs screen to the existing Staff App
showcase.

## Chosen placement

Jobs remains under `Community → Jobs`, which already exists in the Staff App
sidebar. This keeps job discovery separate from the worker's current salon,
earnings, wallet, and tax profile while avoiding another bottom-navigation item.

Alternatives considered:

- A new bottom-navigation item would improve discoverability but overcrowd the
  existing five-item mobile navigation.
- Placing Jobs under My Profile would reduce navigation changes but incorrectly
  frame an active matching workflow as profile settings.
- Placing Jobs only in AI Assistant would make it difficult to revisit matches
  and track actions.

## Screen composition

Add one Staff Jobs phone screen to the current multi-screen grid. It uses the
same Tailwind tokens, header, phone frame, sidebar template, typography, and
bottom navigation as the surrounding staff screens.

The screen contains:

1. A `Jobs` header with a menu button and help action.
2. Three local tabs: `Matches`, `My Job Profile`, and `Activity`; the mockup opens
   on `Matches`.
3. A compact privacy notice explaining that salons see skills and expectations,
   not the tech's name, photo, phone number, or current salon.
4. Two demo AI match cards showing salon name, match score, skills, distance,
   compensation, schedule fit, and a plain-language match explanation.
5. `I'm interested` and `Dismiss` actions.
6. The standard bottom navigation with `Community` active because Jobs is a
   Community child destination.

## Interaction model

- `I'm interested` marks the card as interested, disables repeated submission,
  and shows a temporary in-phone status message confirming that only the
  anonymous profile was shared.
- `Dismiss` visually de-emphasizes the card, disables both actions on that card,
  and shows a temporary status message.
- The interactions are local demo behavior only. They make no network request
  and do not persist after reload.
- The existing reusable staff sidebar is cloned into the Jobs phone frame. Its
  `Jobs` item is visually active and the Community group is expanded.

## File and reference behavior

- Final application file: `html/pages/staff-app.html`.
- The old `html/pages/mobile-two-account-tailwind-lucide.html` path is removed.
- Historical design and implementation documents are not rewritten because they
  describe the filename that existed when those documents were authored.
- No unrelated W-9 worktree changes are modified or committed.

## Accessibility and responsive behavior

- Action controls remain native buttons with explicit types.
- Status feedback uses an `aria-live="polite"` region.
- Dismissed and interested states are expressed through text and disabled state,
  not color alone.
- The new screen stays within the existing 430px showcase card and 844px phone
  frame, with internal vertical scrolling.

## Verification

A focused Node test will assert:

- the renamed file exists and the old file does not;
- the Jobs screen, tabs, privacy notice, and two match cards exist;
- Community → Jobs remains present in the sidebar;
- the Jobs phone frame participates in the reusable staff shell;
- interest/dismiss controls and their demo behavior hooks exist.

The complete focused test suite will then be run, followed by a browser-sized
visual check of the renamed page.
