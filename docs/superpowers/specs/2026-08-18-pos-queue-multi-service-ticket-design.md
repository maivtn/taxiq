# POS Queue multi-service technician ticket design

## Goal

Change `pos-phase-1.html?tab=tickets` so one Queue ticket represents all services performed by one technician for one customer order. A ticket can contain multiple services, while different technicians on the same order continue to have separate Queue tickets.

The Edit service action becomes a multi-select editor. Saving the editor updates the ticket's service list, duration, billable total, linked Booking service tickets, and Checkout payload without losing the change after a reload.

## Scope

- Change the Queue operational-ticket boundary from one service per `WAITLIST` row to one technician work ticket per order.
- Let Edit service select one or more active catalog services.
- Render every selected service on Queue cards, Queue table rows, and grouped-order rows.
- Keep one shared technician, status, elapsed timer, and action set for all services in the Queue ticket.
- Preserve Booking links and expand the Queue ticket back into canonical per-service records when writing to the appointment store or Checkout snapshot.
- Add focused behavioral and source-level regression tests.

Out of scope: changing service catalog management, editing prices inside the Queue modal, assigning different technicians per service inside one Queue ticket, changing checkout payment behavior, or redesigning other POS tabs.

## Operational ticket invariant

The Queue identity is:

```text
orderId + technician assignment = one open Queue ticket
```

The technician assignment is `techId`, then `reqTech`, then `Anyone` when neither exists. A technician can still have tickets for several customers; the invariant applies within one customer order.

All services in a Queue ticket share:

- `status`
- `techId` / `reqTech`
- waiting, service, and ready timestamps
- Start, Change tech, Done, Checkout, and Cancel actions

Changing or assigning the technician moves the whole ticket and all its services together.

If that move would create two open Queue tickets with the same `orderId` and technician assignment, merge them immediately. Preserve all unique service items and linked IDs. The merged status is `service` when either source is in service, otherwise `waiting` when either source is waiting, otherwise `ready`; this prevents a partially unfinished order from becoming payable too early. Preserve the earliest relevant status timestamp and add a merge entry to the ticket history.

## Queue data model

`items` becomes the source of truth for the services inside a `WAITLIST` row:

```js
{
  id: 17,
  orderId: "booking-123",
  bookingId: "booking-123",
  serviceTicketId: "ticket-1",       // legacy alias: first linked service ticket
  serviceTicketIds: ["ticket-1", "ticket-2"],
  svc: "Pedicure",                   // legacy/compatibility primary label
  items: [
    {
      serviceId: "svc-pedicure",
      serviceTicketId: "ticket-1",
      name: "Pedicure",
      price: 40,
      durationMin: 60,
      techId: "t1",
      cat: "pedi"
    },
    {
      serviceId: "svc-gel-polish",
      serviceTicketId: "ticket-2",
      name: "Gel Polish",
      price: 20,
      durationMin: 20,
      techId: "t1",
      cat: "gel"
    }
  ],
  durationMin: 80
}
```

Compatibility rules:

- Old rows with only `svc` or one `item` normalize into a one-item service list.
- `svc` always mirrors the first item name so existing fallbacks remain safe.
- `serviceTicketId` mirrors the first linked ID; new logic uses `serviceTicketIds`.
- `durationMin` is the sum of item durations.
- The displayed total is the sum of item prices.
- Duplicate and completion checks treat every value in `serviceTicketIds` as linked to the Queue ticket.

## Booking check-in and rehydration

Booking remains canonical as one appointment service ticket per service. The appointment schema does not become multi-service.

When checking in or rehydrating a checked-in Booking:

1. Normalize every non-cancelled Booking service ticket.
2. Group those service tickets by `orderId` and technician assignment.
3. Create one `WAITLIST` row per group.
4. Add one Queue item for each canonical Booking service ticket and retain its ID on the item and in `serviceTicketIds`.
5. Skip any canonical service ticket already linked to an open or completed Queue ticket.

This preserves the one-technician Queue presentation while retaining per-service Booking records for compatibility with Booking and Calendar.

## Edit service interaction

The modal keeps the existing title and catalog presentation but changes each service option into a toggle:

- Opening the modal preselects every service currently in `w.items`.
- Clicking a service toggles its selected state and checkmark.
- The current-selection footer shows service count and total price. Duration stays in ticket data for scheduling only.
- `Save services` applies the draft; `Cancel` and Escape discard it.
- Save is disabled when no service is selected, and an inline message explains that at least one service is required.
- The modal does not save immediately when an option is clicked.

On Save:

1. Rebuild `items` from selected active catalog services.
2. Apply the Queue ticket's current `techId || reqTech` to every item.
3. Recalculate `svc`, `durationMin`, and the displayed total.
4. Preserve canonical service-ticket IDs for services that remain selected.
5. Create canonical service-ticket IDs for newly selected services on linked Bookings.
6. Mark removed linked Booking service tickets `cancelled` so rehydration cannot recreate them.
7. Write one ticket-history entry that records the previous and new service lists.
8. Rerender and keep focus on the edited Queue ticket.

For session-only walk-ins, the same Queue fields update in memory without an appointment-store write.

## Rendering

Queue card and table service cells render the full service list rather than only `w.svc`.

- Cards show one readable service line per item.
- Tables use a compact comma-separated or stacked list that wraps safely.
- Grouped-order rows show the same item names before the technician/status label.
- Total and duration use all items.
- Existing Queue action placement and responsive wrapping remain unchanged apart from the multi-select modal footer.

## Technician matching

A technician is fully qualified only when their skills cover every selected service requirement. Match scoring and override warnings list the missing requirement or requirements. Assigning or swapping a Queue ticket always applies to every item in that ticket.

## Checkout and completion

Queue Checkout expands each Queue item into its own `serviceDetails` entry and preserves the item's canonical `serviceTicketId` when available. The Checkout total therefore equals the sum shown on the Queue ticket.

For a linked Booking, completion succeeds only when every non-cancelled canonical Booking service ticket belongs to a completed Queue ticket. A completed multi-service Queue ticket satisfies all IDs in its `serviceTicketIds` list.

Cancelling a Queue ticket cancels the whole technician work ticket. Every linked canonical Booking service ticket in that Queue ticket is treated as cancelled for Queue rehydration purposes.

For Booking-linked tickets, both Edit service removal and Queue cancellation persist the affected canonical ticket statuses through the appointment store before mutating `WAITLIST`. A failed store write leaves the Queue ticket unchanged.

## Error handling

- Missing or inactive catalog services cannot be newly selected.
- Appointment-store failure leaves both the modal and Queue ticket unchanged and shows the store error.
- A missing linked Booking or canonical service ticket blocks Save instead of applying an in-memory-only partial change.
- Empty selection is rejected before any mutation.
- If catalog loading fails, existing selected items remain visible and Save cannot silently remove them.

## Testing

Add regression coverage proving:

- the modal supports toggling multiple services and saves only on `Save services`;
- opening preselects all existing Queue items;
- zero selected services cannot be saved;
- saving updates item names, prices, durations, total, and technician IDs;
- one order with two services assigned to the same technician creates one Queue ticket;
- the same order with two technicians creates two Queue tickets;
- linked Booking ticket IDs persist, additions create IDs, and removals become cancelled;
- reload/rehydration preserves the edited multi-service ticket;
- Checkout emits one service detail per selected item with the expected total;
- completion recognizes every ID in `serviceTicketIds`;
- card, table, and grouped-order renderers display all services;
- the existing single-service path remains valid as a one-item ticket.

## Success criteria

On `pos-phase-1.html?tab=tickets`, a staff member can open Edit service, select several services, review their combined duration and price, save once, and see all selected services on one Queue ticket for the same technician. The same services reach Checkout and survive a page reload for Booking-linked tickets.
