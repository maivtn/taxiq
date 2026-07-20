# Staff App Jobs Screen Design

**Date:** 2026-07-20  
**Status:** Approved through the user's implementation request

## Goal

Rename the standalone staff mobile experience from
`html/pages/mobile-two-account-tailwind-lucide.html` to
`html/pages/staff-app.html` and add a Jobs screen to the existing Staff App
showcase.

## Source-of-truth hierarchy

Implementation must reconcile these three references in this order:

1. `html/customer/18072026/NEXORA_Spec_AI_Matching_Tho_Tiem.md` is the
   authority for business rules, privacy, states, and edge cases.
2. `html/customer/18072026/NEXORA_AI_Matching_Tho_Tiem_Mockup.html` is the
   authority for Jobs content, matching examples, and the mutual-accept flow.
3. `html/customer/18072026/NEXORA_Business_AI_Offer_Mockup.html` supplies the
   shared AI presentation pattern: AI badge, confidence, plain-language `Why`,
   human confirmation, dismissal feedback, anonymity, and guardrail copy.

The Jobs screen adopts these patterns inside the existing Staff App design
system. It does not copy either standalone mockup's desktop shell or CSS.

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

The screen contains three interactive local views:

1. A `Jobs` header with a menu button and help action.
2. `Matches`, the default view:
   - a compact privacy notice explaining that salons see skills and
     expectations, not the tech's name, photo, phone number, or current salon;
   - the Rose Nails & Spa 94% match and Golden Glow Spa 76% match from the
     matching mockup;
   - skills, distance, compensation, schedule fit, and a plain-language `Why`;
   - `I'm interested`, `Dismiss`, and `Report` actions on every match.
3. `My Job Profile`:
   - skills, years of experience, self-reported license state, city and radius;
   - split or weekly compensation expectation, guarantee preference, and
     available schedule;
   - `Active` and `Paused` controls plus a clearly destructive `Delete profile`
     action;
   - anonymity is always on and cannot be disabled in phase 1.
4. `Activity`:
   - demo rows for `Interested`, `Contact requested`, `Contact shared`, and
     `Declined` states;
   - a pending contact request can open the mutual-accept confirmation.
5. The standard bottom navigation with `Community` active because Jobs is a
   Community child destination.

## Interaction model

- `I'm interested` marks the card as interested, disables repeated submission,
  and shows a temporary in-phone status message confirming that only the
  anonymous profile was shared.
- `Dismiss` visually de-emphasizes the card, disables both actions on that card,
  and shows a temporary status message.
- `Report` opens a compact reason selector. Submitting immediately hides the
  match in the demo and confirms it was sent for review.
- The local tabs switch between Matches, My Job Profile, and Activity without
  leaving the Staff App phone frame.
- Pausing the job profile changes its visible status and explains that all
  matching is stopped. Reactivating restores the active state. Delete requires
  confirmation before changing the demo state to deleted.
- A pending salon contact request opens the mutual-accept prompt. `Share contact`
  moves it to `Contact shared`; `Stay anonymous` moves it to `Declined`. No name
  or phone number is presented to a salon before the share action.
- The interactions are local demo behavior only. They make no network request
  and do not persist after reload.
- The existing reusable staff sidebar is cloned into the Jobs phone frame. Its
  `Jobs` item is visually active and the Community group is expanded.

## Guardrails and copy

- AI only ranks and explains matches; the tech makes every decision.
- NEXORA is a connection board. It does not hire, pay, recruit, guarantee work,
  or advise on 1099/W-2 classification.
- Employment terms remain between the tech and salon.
- The current salon is always blocked from seeing the job profile, including
  grouped demand insights.
- License data is labeled `self-reported — not verified by NEXORA`.
- Dismissed matches do not reappear in the demo state, and the feedback explains
  that dismissal improves future suggestions.
- The screen does not add search for a specific salon employee or expose any
  staff identity before mutual acceptance.

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
- Tabs expose selected state through `aria-selected`; overlays restore focus to
  their trigger when closed.
- Report and contact-sharing dialogs have explicit accessible names and close
  actions.
- The new screen stays within the existing 430px showcase card and 844px phone
  frame, with internal vertical scrolling.

## Verification

A focused Node test will assert:

- the renamed file exists and the old file does not;
- the Jobs screen, three working tabs, privacy notice, and two source-aligned
  match cards exist;
- Community → Jobs remains present in the sidebar;
- the Jobs phone frame participates in the reusable staff shell;
- interest, dismiss, and report controls and their demo behavior hooks exist;
- job profile fields and Active/Paused/Delete states exist;
- Activity includes the four required states and a working mutual-accept prompt;
- guardrail copy covers anonymity, current-salon blocking, AI-only suggestions,
  license verification, and NEXORA's non-employer role.

The complete focused test suite will then be run, followed by a browser-sized
visual check of the renamed page.
