# Store Income table-only print design

## Goal

Make Print / PDF on Store Income print only the income report table for Day, Week, Year, and Range, without changing the normal on-screen report.

## Behavior

- Printing hides the salon shell, page heading, actions, period controls, report context, Day cards, overlays, and toast.
- The printed output contains only the report table: column headings, the active period's data rows, and the period-total footer.
- Day prepares one table row for the selected date even though the table remains hidden in the normal Day layout.
- Week, Year, and Range continue to print the same rows and totals shown on screen.
- Print layout removes scrolling, sticky columns, card decoration, and interactive affordances so the complete table fits the printable page.

## Implementation

Keep the existing `.report-table` as the single table surface. Extract its row and total population into a small helper used by both Day and the existing table periods. `renderDay()` will populate one hidden row without changing which screen section is visible. Print media CSS will expose the table card even when its `hidden` attribute is present, hide every non-table child of the page, and normalize the table for paper.

The existing Print / PDF handler remains `window.print()`, so browser Print and Save as PDF use the same CSS behavior.

## Verification

- A focused DOM test proves Day retains the current cards while preparing one dated table row with the correct total.
- A focused print-style test proves non-table content is excluded and the table is printable without scroll or sticky columns.
- Existing Store Income tests prove Week, Year, Range, drill-down, email, and compact-layout behavior remain intact.

