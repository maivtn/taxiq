# Nexora Design System Colors

Updated: 2026-07-10

This file documents the core Nexora color tokens used for light and dark themes.

## Primary

| Token | Light | Dark | Usage |
|---|---:|---:|---|
| `primary/base` | `#4648D4` | `#F59E0B` | Main brand actions, selected tabs, primary buttons |
| `primary/hover` | `#3A3BBF` | `#D97706` | Hover state for primary actions |
| `primary/active` | `#2D2EAA` | `#B45309` | Pressed or active state |
| `primary/subtle` | `#E9E9FF` | `#1E1E5F` | Soft backgrounds, selected surfaces |
| `primary/10` | `rgba(70, 72, 212, 0.10)` | `rgba(245, 158, 11, 0.10)` | Low-emphasis tint backgrounds |
| `primary/gradient` | `linear-gradient(135deg, #2F63FF 0%, #7A3DF5 100%)` | `linear-gradient(135deg, #2F63FF 0%, #7A3DF5 100%)` | Primary CTAs, active tabs, high-emphasis app actions |

## Text

| Token | Light | Dark | Usage |
|---|---:|---:|---|
| `text/primary` | `#0B1C30` | `#FFFFFF` | Main readable text |
| `text/secondary` | `#64748B` | `#94A3B8` | Supporting text and metadata |
| `text/muted` | `#565E74` | `rgba(255, 255, 255, 0.60)` | Low-emphasis labels |
| `text/placeholder` | `#94A3B8` | `#6B7280` | Input placeholder text |
| `text/disabled` | `#CBD5E1` | `#4B5563` | Disabled controls |
| `text/on-primary` | `#FFFFFF` | `#050505` | Text on primary buttons or filled states |

## Background

| Token | Light | Dark | Usage |
|---|---:|---:|---|
| `background/default` | `#F8FAFC` | `#050505` | Main app background |
| `background/secondary` | `#F1F5F9` | `#111827` | Secondary page background |
| `background/sidebar` | `#FFFFFF` | `#0D1117` | Sidebar and navigation background |

## Surface

| Token | Light | Dark | Usage |
|---|---:|---:|---|
| `surface/default` | `#FFFFFF` | `#11100D` | Cards, panels, sheets |
| `surface/hover` | `#F8FAFC` | `#1E2333` | Hover state on cards or list items |
| `surface/raised` | `#FFFFFF` | `#171510` | Header, active tabs, elevated controls |
| `surface/selected` | `#F6F7FF` | `#1E1E5F` | Selected rows, selected helper badges, soft active backgrounds |
| `surface/receipt` | `#FFFFFF` | `#171510` | Operational receipt-style modals and ticket detail dialogs |
| `surface/receipt-muted` | `#F8FAFC` | `#111827` | Muted receipt line groups and modal inner sections |

## Border

| Token | Light | Dark | Usage |
|---|---:|---:|---|
| `border/default` | `#E2E8F0` | `rgba(255, 255, 255, 0.10)` | Default dividers and card borders |
| `border/soft` | `rgba(100, 116, 139, 0.16)` | `rgba(255, 255, 255, 0.08)` | Soft card, table, and tab rail outlines |
| `border/strong` | `#CBD5E1` | `#374151` | Stronger dividers and control outlines |

## Status

| Token | Light | Dark | Usage |
|---|---:|---:|---|
| `status/success` | `#10B981` | `#10B981` | Success, active, ready states |
| `status/warning` | `#F59E0B` | `#F59E0B` | Pending, warning, attention states |
| `status/error` | `#EF4444` | `#EF4444` | Error, failed, inactive states |

## Shape

Shape tokens make Nexora feel warmer and less rigid while keeping operational screens precise.

| Token | Value | Usage |
|---|---:|---|
| `radius/control` | `12px` | Buttons, inputs, selects, compact controls |
| `radius/card` | `14px` | Ticket cards, booking rows, metric cards |
| `radius/panel` | `18px` | Main panels, side panels, large grouped surfaces |
| `radius/pill` | `999px` | Status pills, count chips, segmented filters |

## Elevation

Elevation should be soft and low contrast. Use it to separate interactive surfaces, not to decorate.

| Token | Value | Usage |
|---|---:|---|
| `shadow/card` | `0 10px 24px rgba(11, 28, 48, 0.06)` | Cards and table containers |
| `shadow/panel` | `0 18px 48px rgba(11, 28, 48, 0.10)` | Right panels, important grouped surfaces |
| `shadow/modal` | `0 24px 64px rgba(11, 28, 48, 0.16)` | Operational modals that sit above the live POS board |
| `shadow/tab` | `0 8px 20px rgba(70, 72, 212, 0.16)` | Active navigation tabs |
| `shadow/header` | `0 8px 24px rgba(11, 28, 48, 0.05)` | Sticky headers and top app bars |

## Typography

Operational POS screens should optimize for fast scanning by salon staff.

Rules:

- Avoid all-uppercase labels in the main UI because they slow reading, especially in compact tablet layouts.
- Use Title Case or sentence case for section labels, metric labels, table headers, and panel headings.
- Preserve hierarchy with font weight, color, spacing, and size instead of forcing labels to uppercase.

## Layout Density

Nexora POS screens should be optimized for landscape tablet usage in nail salons. The Vietnamese design rule is: tối ưu không gian cho tablet ngang.

General responsive rule for all Nexora Touch pages: tối ưu không gian trên tablet phone; phone cần nhỏ lại tối ưu không gian tránh scroll nhiều.

Rules:

- Prioritize vertical efficiency before visual decoration; compact header, navigation, quick actions, filters, and summaries so the operating surface stays visible.
- For tablet and phone breakpoints, keep dense but readable layouts. Prefer two-column summaries/cards on tablet when content still fits, and avoid collapsing to one column too early.
- On phone, shrink spacing, card padding, media/QR previews, icon tiles, button heights, and large text before accepting long vertical scroll.
- Use single-row controls when landscape width allows it. Let quick actions, filters, and summary controls wrap only when the viewport truly needs it.
- Show the full primary tab set by default on landscape tablets. Use `More` only as an overflow control when the tab count truly exceeds available width.
- Primary navigation tabs should use icon-above-label layout on compact tablet headers to save horizontal width while preserving clear click affordance.
- Give the most space to work areas: ticket columns, booking tables, customer lists, selected ticket panels, and checkout details.
- Avoid landing-page spacing, oversized hero copy, nested cards, and decorative sections in operational POS screens.
- Before polishing color, radius, shadow, or icons, verify the layout still leaves enough usable height on a landscape tablet.

## Operational Modals

Use **Clean POS Receipt** for ticket detail, checkout preview, receipt preview, and other money- or status-related modals. These dialogs should feel like a clear operational record, not a dashboard card stack.

Rules:

- Use `surface/receipt` for the modal shell and `surface/receipt-muted` for grouped detail lines.
- Prefer receipt-style rows for business facts such as customer, service, technician, payment, sync, and total.
- Keep decorative avatars, large icon tiles, nested cards, and heavy gradients out of operational modals.
- Use one primary action and place all modal actions in a sticky footer so the cashier can act without scrolling back.
- Keep activity logs compact; they should support the decision, not compete with ticket facts.
- Use `shadow/modal` for centered modal elevation and keep the backdrop calm so the live board remains context, not distraction.

## Product Documentation Alignment

Design tokens support product structure; they do not define product structure.

Source-of-truth order for Nexora POS mockups:

1. Feature specification.
2. Vietnamese mockup design spec.
3. Low-fi and mid-fi wireframes.
4. Screen-specific specs such as Booking Lite.

Rules:

- Do not mix module content just because the visual layout can support it.
- Today Board is the live ticket operation board: quick actions, daily summary, ticket columns, and selected ticket detail.
- Booking Lite is a separate Booking module: table/list booking management, filters, summary chips, and New Booking.
- A quick action can navigate to another module, but it should not turn the current screen into a multi-mode screen unless the source docs require it.
- If a visual decision conflicts with product documentation, product documentation wins.

## CSS Variables

```css
:root {
  --primary-base: #4648D4;
  --primary-hover: #3A3BBF;
  --primary-active: #2D2EAA;
  --primary-subtle: #E9E9FF;
  --primary-10: rgba(70, 72, 212, 0.10);
  --primary-gradient: linear-gradient(135deg, #2F63FF 0%, #7A3DF5 100%);
  --primary-gradient-hover: linear-gradient(135deg, #2457F5 0%, #6C35EA 100%);
  --primary-gradient-shadow: 0 12px 24px rgba(74, 80, 235, 0.24);

  --text-primary: #0B1C30;
  --text-secondary: #64748B;
  --text-muted: #565E74;
  --text-placeholder: #94A3B8;
  --text-disabled: #CBD5E1;
  --text-on-primary: #FFFFFF;

  --background-default: #F8FAFC;
  --background-secondary: #F1F5F9;
  --background-sidebar: #FFFFFF;

  --surface-default: #FFFFFF;
  --surface-hover: #F8FAFC;
  --surface-raised: #FFFFFF;
  --surface-selected: #F6F7FF;
  --surface-receipt: #FFFFFF;
  --surface-receipt-muted: #F8FAFC;

  --border-default: #E2E8F0;
  --border-soft: rgba(100, 116, 139, 0.16);
  --border-strong: #CBD5E1;

  --status-success: #10B981;
  --status-warning: #F59E0B;
  --status-error: #EF4444;

  --radius-control: 12px;
  --radius-card: 14px;
  --radius-panel: 18px;
  --radius-pill: 999px;

  --shadow-card: 0 10px 24px rgba(11, 28, 48, 0.06);
  --shadow-panel: 0 18px 48px rgba(11, 28, 48, 0.10);
  --shadow-modal: 0 24px 64px rgba(11, 28, 48, 0.16);
  --shadow-tab: 0 8px 20px rgba(70, 72, 212, 0.16);
  --shadow-header: 0 8px 24px rgba(11, 28, 48, 0.05);
}

[data-theme="dark"] {
  --primary-base: #F59E0B;
  --primary-hover: #D97706;
  --primary-active: #B45309;
  --primary-subtle: #1E1E5F;
  --primary-10: rgba(245, 158, 11, 0.10);
  --primary-gradient: linear-gradient(135deg, #2F63FF 0%, #7A3DF5 100%);
  --primary-gradient-hover: linear-gradient(135deg, #2457F5 0%, #6C35EA 100%);
  --primary-gradient-shadow: 0 12px 24px rgba(74, 80, 235, 0.28);

  --text-primary: #FFFFFF;
  --text-secondary: #94A3B8;
  --text-muted: rgba(255, 255, 255, 0.60);
  --text-placeholder: #6B7280;
  --text-disabled: #4B5563;
  --text-on-primary: #050505;

  --background-default: #050505;
  --background-secondary: #111827;
  --background-sidebar: #0D1117;

  --surface-default: #11100D;
  --surface-hover: #1E2333;
  --surface-raised: #171510;
  --surface-selected: #1E1E5F;
  --surface-receipt: #171510;
  --surface-receipt-muted: #111827;

  --border-default: rgba(255, 255, 255, 0.10);
  --border-soft: rgba(255, 255, 255, 0.08);
  --border-strong: #374151;

  --status-success: #10B981;
  --status-warning: #F59E0B;
  --status-error: #EF4444;

  --radius-control: 12px;
  --radius-card: 14px;
  --radius-panel: 18px;
  --radius-pill: 999px;

  --shadow-card: 0 10px 24px rgba(0, 0, 0, 0.28);
  --shadow-panel: 0 18px 48px rgba(0, 0, 0, 0.36);
  --shadow-modal: 0 24px 64px rgba(0, 0, 0, 0.42);
  --shadow-tab: 0 8px 20px rgba(245, 158, 11, 0.20);
  --shadow-header: 0 8px 24px rgba(0, 0, 0, 0.24);
}
```

## Tailwind Color Mapping

```js
colors: {
  primary: {
    base: "#4648D4",
    hover: "#3A3BBF",
    active: "#2D2EAA",
    subtle: "#E9E9FF",
    gradient: "linear-gradient(135deg, #2F63FF 0%, #7A3DF5 100%)",
  },
  text: {
    primary: "#0B1C30",
    secondary: "#64748B",
    muted: "#565E74",
    placeholder: "#94A3B8",
    disabled: "#CBD5E1",
    onPrimary: "#FFFFFF",
  },
  background: {
    default: "#F8FAFC",
    secondary: "#F1F5F9",
    sidebar: "#FFFFFF",
  },
  surface: {
    default: "#FFFFFF",
    hover: "#F8FAFC",
    raised: "#FFFFFF",
    selected: "#F6F7FF",
    receipt: "#FFFFFF",
    receiptMuted: "#F8FAFC",
  },
  border: {
    default: "#E2E8F0",
    soft: "rgba(100, 116, 139, 0.16)",
    strong: "#CBD5E1",
  },
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
}
```

## Tailwind Shape And Elevation Mapping

```js
borderRadius: {
  control: "var(--radius-control)",
  card: "var(--radius-card)",
  panel: "var(--radius-panel)",
  pill: "var(--radius-pill)",
},
boxShadow: {
  card: "var(--shadow-card)",
  panel: "var(--shadow-panel)",
  modal: "var(--shadow-modal)",
  tab: "var(--shadow-tab)",
  header: "var(--shadow-header)",
}
```

## Usage Notes

- Use `primary/gradient` for the strongest brand action in a screen, including the active top-level tab and primary CTA.
- Use `primary/base` for solid brand accents, icon fills, and lower-emphasis selected marks.
- Use `primary/subtle` or `primary/10` for selected states, chips, soft cards, and low-emphasis highlights.
- Treat design tokens as presentation only. IA, tabs, modules, and screen content must follow the source-of-truth product documents.
- Use `surface/raised` for the app header, active tabs, and controls that should feel touchable.
- Use `surface/selected` for the current table row, selected helper badges, or quiet active backgrounds.
- Use `surface/receipt` and `surface/receipt-muted` for ticket detail modals that need to read like a POS record.
- Use status colors only for semantic states. Do not use success green for decorative QR cards unless it means active or ready.
- In dark theme, primary shifts to amber. Keep blue/purple accents as supporting highlights, not the main dark-theme CTA color.
- Keep borders subtle. Prefer `border/soft` for most cards, tables, and tab rails; use `border/strong` only for focused or selected controls.
- Use `radius/card` and `radius/panel` for operational surfaces that need a softer, less rigid feel.
- Use soft elevation sparingly; every shadow should clarify grouping, hierarchy, or active state.
