# Task 7 Report — Looks, Offers, Explore và Follow-Tech Persistence

## Status

- Result: completed
- Commit: `5d8f6fc` (`feat: persist customer looks offers and follows`)
- Authorized files changed: `html/customer/cutomer-reward.html`, `html/customer/cutomer-reward.test.mjs`
- This report is intentionally uncommitted. Existing untracked `docs/superpowers/specs/vi.md` and `.sdd/` artifacts were preserved.

## Implemented domains

- Added and exported `saveLookRecord`, `toggleSavedOffer`, `addWishRecord`, `removeWishRecord`, `canFollowTech`, `toggleFollowTech`, and `createTechMoveNotification`.
- Looks require a canonical business and canonical visit/staff ownership, non-empty service/color/note/photo content, a finite timestamp, and a valid RFC 4122 v4 UUID before mutation. Staff display identity is canonicalized from the staff profile.
- Look photos are retained only as bounded JPEG data URLs. File selection is asynchronous and writes only to the preview; save performs the actual state write. A quota failure retries once without the photo and preserves metadata atomically.
- Saved offers use canonical offer IDs and persist in `savedOfferIds`. Wishes are trimmed and case-insensitively unique; migration and removal normalize the same way.
- Tech following is allowed only for a canonical staff profile with a matching shared visit. No follower counts or follower lists are introduced. Move notifications require an existing follow, staff opt-in, canonical destination business, finite time, and a generated UUID; dedupe is keyed by staff and destination business.

## UI and safety

- Added stable offer/business IDs, saved filter, favorite/view/use actions, receipt-scan prototype action, JPEG file input/preview, and activity render target.
- Added `renderLooks`, `renderOffers`, `renderWishes`, `renderExplore`, and `renderActivity` to the accumulated `renderDomainViews()` list. Filters persist under `state.ui.exploreFilter` / `state.ui.offerFilter` and all state-changing actions use `commitState` plus rerender.
- Dynamic persisted values render through DOM node creation, `textContent`, `dataset`, and safe image properties. Looks, wishes, notification titles, business names, and photo alt text are not interpolated into dynamic `innerHTML`. `view-look` uses a DOM-built modal fragment, so notes/business names cannot execute markup.
- Reload uses migration and renderers without bootstrap UUID generation or storage writes. Opening a notification marks only the selected notification read and refreshes activity/global labels.

## TDD evidence

### Focused RED

Before implementation:

```bash
node --test --test-name-pattern="persists looks|follow-tech only" html/customer/cutomer-reward.test.mjs
```

Expected failures were observed: `api.saveLookRecord is not a function` and `api.canFollowTech is not a function`.

### Focused GREEN / robustness

```bash
node --test --test-name-pattern="look writes|notification|persists looks|follow-tech only|quota" html/customer/cutomer-reward.test.mjs
```

- 6/6 focused tests pass. Coverage includes look business/visit/staff ownership, invalid timestamp and UUID atomicity, JPEG migration round-trip, follow opt-in and deduped notification behavior, and quota fallback metadata persistence.
- Existing suite assertions cover safe DOM renderers, modal safety, filter/action registry wiring, persisted English/reload bootstrap stability, and activity/notification behavior.

### Final verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git show --stat --oneline --name-only HEAD
```

- Full suite: `102/102` pass, 0 failures/skips/cancellations/todos.
- `git diff --check`: clean.
- Commit contains only the two authorized customer files; this report remains uncommitted.

## Self-review and concerns

- Rechecked canonical relations before mutation, duplicate-safe saved/wish/follow toggles, opt-in notification dedupe, and the two-stage quota retry.
- Rechecked dynamic state rendering for text/attribute safety and that `view-look` never injects persisted text as HTML.
- No hiring/profile marketplace data, follower metrics, or backend/network integration was added; business confirmation and receipt scan remain prototype actions.
- Existing untracked files were not modified or committed.

## Gate follow-up

- Follow-up commit: `d989f8a` (`fix: close looks and follow integrity gaps`).
- Removed the duplicate `upload-look` registration; the sole action opens the scoped `#addlook` file input, and the file-change path updates the preview without persisting until save.
- Follow migration now drops technicians without a canonical shared visit. Move notifications re-check `canFollowTech` and require `followNotifyOptIn === true`, so malformed truthy values cannot create IDs or notifications.
- Dynamic offer view/use controls refresh through the translation dictionary on every render, including after an English language switch.
- Persisted look migration now verifies canonical visit staff/business ownership, rejects explicit null staff on visits, and only derives staff when the visit itself is canonical. New looks are newest-first; quota fallback targets the exact saved record by ID.

Follow-up verification:

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
```

- Full suite: `106/106` pass, 0 failures/skips/cancellations/todos.
- `git diff --check`: clean.
