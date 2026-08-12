# Staff Settings Tab Design

## Goal

Move the merchant-facing Staff navigation entry from the top level of the shared sidebar into Settings as an empty tab.

## Design

- Remove the standalone `Staff` item from the merchant navigation in `html/assets/nexora-shell.js`.
- Add `Staff` to the existing Settings submenu with tab id `staff`.
- Add a matching `STAFF` page tab and accessible empty `tabpanel` to `html/pages/owner-setting.html`.
- Preserve the existing Staff-only shell and standalone Staff pages; this change only reorganizes merchant navigation.
- Keep `sub-account` as the default Settings tab.

## Navigation behavior

- From another merchant page, Settings > Staff links to `owner-setting.html?tab=staff`.
- On Owner Settings, selecting Staff activates the empty panel, updates the shared sidebar highlight, and updates `?tab=staff` through the existing tab controller.
- Invalid Settings tab values continue to fall back to the existing default.

## Testing

- Shared-shell regression coverage verifies that merchant navigation has no standalone Staff item and that Settings owns the Staff link/button.
- Owner Settings coverage verifies the Staff tab/panel accessibility contract and that the panel remains empty.

