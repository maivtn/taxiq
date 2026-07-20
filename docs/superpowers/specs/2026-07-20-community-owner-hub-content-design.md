# Community Owner Hub Content Design

**Date:** 2026-07-20  
**Status:** Ready for user review

## Objective

Turn `html/pages/community.html` from a mostly placeholder Community page into an owner-focused salon community hub. Keep the existing sidebar and the five existing page tabs: Feed, Groups, Learning, Jobs, and Events.

The finished prototype should help a salon owner communicate with staff and customers, improve operations and revenue, recruit technicians, and organize learning and events. A salon may create and manage multiple groups.

## Audience

The primary user is a salon owner or manager using the merchant dashboard. Staff and customers appear as group members, but this page is not their dedicated application UI.

## Scope

### Included

- Populate all five existing tab panels with realistic English demo content.
- Preserve the existing shared sidebar and tab names.
- Support multiple Staff, Customer, and Mixed groups.
- Provide interactive prototype behaviors using in-page JavaScript.
- Retain and extend the existing Owner Jobs AI-matching experience.
- Maintain responsive and accessible behavior consistent with the current page.

### Excluded

- Real-time networking, WebSocket chat, backend persistence, or authentication.
- Real file upload, push notifications, email, SMS, or QR-code delivery.
- Customer-facing or staff-facing application screens.
- Legal, employment, or tax advice.

All created posts, groups, messages, events, and state changes are browser-session demo state and reset on refresh.

## Information Architecture

The page keeps its current heading and page-level tab bar. The shared sidebar continues to be rendered by `html/assets/nexora-shell.js`; this feature does not alter sidebar navigation.

Each tab owns one clear workflow:

1. **Feed:** salon-wide activity and items needing the owner's attention.
2. **Groups:** multiple-group discovery, creation, management, and chat.
3. **Learning:** practical owner education and progress.
4. **Jobs:** job posts, anonymous matches, and hiring pipeline.
5. **Events:** staff, customer, promotional, and industry events.

## Shared Visual Pattern

Each tab begins with a compact tab header containing a title, explanatory copy, and its primary action. Content uses the existing Nexora palette, cards, chips, Lucide icons, border radii, and responsive breakpoints.

On desktop, Feed and Learning use a main column plus a narrow insights/action rail; Groups chat uses a message column plus a member/detail rail; the other views use responsive card grids. Tablet and mobile layouts collapse to one column. Horizontal filters scroll on narrow screens rather than shrinking labels until unreadable.

Every list-based area includes a useful empty state, not an empty white panel.

## Feed Tab

### Purpose

Give the owner one place to see conversations and operational activity across all groups.

### Components

- **Create post composer:** text prompt plus Photo, File, Poll, and Choose audience actions.
- **Audience selector:** All groups, a specific group, Staff groups, or Customer groups.
- **Filters:** All, Announcements, Staff, Customers, and Saved.
- **Post cards:** author, role, source group, timestamp, audience badge, content, attachments, reactions, comments, save, and pin actions.
- **Needs your attention:** pending join requests, reported content, unanswered customer questions, and scheduled announcements.
- **Community insights:** active members, engagement trend, most active group, and average response time using clearly labeled demo values.

### Prototype behavior

The owner can filter posts, open and add comments, react, save, pin, and create a session-only post. Required composer content is validated before publishing.

## Groups Tab

### Purpose

Let the owner create and manage multiple communities for employees, customers, or both.

### Group list

- Search input and filters: All, Staff, Customer, Mixed, and Archived.
- Summary values: total groups, total members, unread messages, and pending requests.
- Group cards show avatar, name, description, group type, privacy, members, unread count, last activity, and quick actions.
- Seed examples:
  - `Nexora Touch Staff` — Staff, private.
  - `VIP Nail Club` — Customer, private.
  - `Weekend Promotions` — Mixed, private.
  - `New Hire Onboarding` — Staff, private.

### Create Group dialog

Required fields and decisions:

- Group name.
- Short description.
- Group type: Staff, Customer, or Mixed.
- Visibility and joining rules.
- Who can post: all members, admins/moderators, or owner only.
- Optional cover/avatar selection using demo presets.

Defaults are privacy-first:

- **Staff:** private and invite-only; only staff-directory members may be added.
- **Customer:** private by default; the owner may make it discoverable to verified salon customers.
- **Mixed:** private and invite-only; creation requires acknowledging that staff and customers will see one another's messages and profiles.

### Roles

- **Owner:** full control, including deletion, archive, roles, and privacy.
- **Admin:** group settings, membership, and content management.
- **Moderator:** content moderation, pinning, and member reports.
- **Member:** view, post, react, reply, and upload demo attachments as permitted.

Roles follow a simple hierarchy inspired by Discord's role model, while privacy uses clear public/private concepts familiar from Facebook Groups.

### Group chat view

Selecting a group opens an in-tab detail view with:

- Back to Groups control.
- Group header, type/privacy badge, member count, search, and settings.
- Message timeline with date separators, author/role, timestamps, reactions, reply count, and pinned state.
- A focused reply panel that replaces the member rail on desktop and opens as a full-width drawer on mobile.
- Composer supporting text, mention, emoji, image/file demo actions, and send.
- Member rail with Owner/Admin/Moderator/Member sections on wide screens; a member drawer on small screens.
- Moderation actions: pin, report, remove message, mute member, and approve/decline join requests.

Threaded replies keep parallel topics readable, following the organizational purpose of Slack threads without recreating Slack's full interface.

## Learning Tab

### Purpose

Surface practical content for improving salon operations, revenue, staff management, and customer experience.

### Components

- Recommended for your salon hero card.
- Category filters: Operations, Marketing, Team Management, and Customer Experience.
- Course cards with format, duration, level, progress, rating, and Save action.
- Continue Learning section.
- Upcoming live workshop card.
- Saved resources list.
- Share to Staff Group action.

### Prototype behavior

The owner can filter courses, save resources, update demo progress, and choose a Staff group to receive a shared learning post.

## Jobs Tab

### Purpose

Help the owner create roles and move privacy-protected technician matches through a lightweight hiring pipeline.

### Existing content retained

- Anonymous demand card.
- Active post summary.
- AI match percentage and explanation.
- Request contact and Dismiss actions.
- Privacy and employment guardrails.

### New content

- Create Job Post primary action.
- Summary cards: Active Posts, New Matches, Contact Requests, and Interviews.
- Filters for skill, distance, availability, and compensation preference.
- Hiring pipeline: Matched, Contact Requested, Interviewing, and Closed.
- Save candidate and Share with salon manager actions.

The prototype must continue to state that identity is revealed only after the technician approves contact sharing.

## Events Tab

### Purpose

Plan activities for staff, customers, promotions, and professional networking.

### Components

- Create Event primary action.
- List and Calendar view switch.
- Filters: All, Staff Training, Customer Event, Promotion, and Industry.
- Upcoming event cards with date, type, host, location or online status, invited group, capacity, and RSVP totals.
- Event detail panel with description, attendee preview, reminder status, and linked discussion group.

### Create Event dialog

- Title and description.
- Event type.
- Start/end date and time.
- In-person or online location.
- Invited group or audience.
- Capacity and RSVP requirement.
- Reminder toggle.

### Prototype behavior

The owner can create a session-only event, switch views, filter events, change RSVP, and post an event announcement to a selected group.

## State and Data Flow

Demo data is defined in JavaScript as small arrays for groups, messages, feed posts, courses, job metrics, and events. Rendering functions read this state and update only their tab's content.

User action flow:

1. Event delegation captures an action from a tab panel.
2. The handler validates required input and permissions.
3. The corresponding in-memory collection or status is updated.
4. The affected component is re-rendered.
5. A compact inline notice or toast confirms the result.

Tab switching remains controlled by the existing `activateCommunityTab` function and shared shell callback. The Groups list/detail transition stays inside `panel-groups` and does not add another top-level tab.

## Validation and Error Handling

- Disable or reject empty posts, messages, group names, and event titles with field-level guidance.
- Prevent invalid past event times in the demo form.
- Show permission messaging when a selected group type restricts posting or membership.
- Require explicit confirmation for Mixed group visibility.
- Demo attachment controls report selected filenames but do not claim a real upload occurred.
- Missing or filtered-out data produces a contextual empty state with a recovery action.

## Accessibility

- Preserve the existing tab semantics and `hidden` panel behavior.
- Dialogs use `role="dialog"`, `aria-modal="true"`, labelled headings, Escape-to-close, and returned focus.
- Icon-only controls have accessible labels.
- Badges do not communicate status by color alone.
- Chat messages, notices, and validation changes use appropriate live regions without announcing every cosmetic update.
- All actions remain keyboard reachable.

## Testing

Extend `html/pages/community.test.mjs` before implementation to cover:

- All five populated panels and their primary actions.
- Multiple seed groups and all three group types.
- Create Group controls, privacy defaults, and Mixed-group warning.
- Chat composer, message/thread controls, and member roles.
- Feed composer and attention/insight regions.
- Learning cards and filters.
- Jobs additions without removing existing privacy assertions.
- Events list/calendar controls and creation fields.
- Shared sidebar script/config remains present and unchanged in behavior.
- JavaScript syntax and tab-target/panel relationships.

Manual responsive verification covers desktop, tablet, and mobile widths, including the group chat detail view and dialogs.

## Reference Patterns

- Facebook Groups public/private visibility: https://www.facebook.com/help/220336891328465?locale=en_GB
- Discord roles and permissions: https://support.discord.com/hc/en-us/articles/214836687-Discord-Roles-and-Permissions
- Slack public/private channels and threads: https://slack.com/help/articles/360017938993-What-is-a-channel

These are interaction references only. The resulting UI remains a Nexora merchant workflow tailored to salon owners.
