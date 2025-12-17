# Design Guidelines: Real-Time Chat Application

## Design Approach

**Selected Approach:** Reference-Based (Discord/Slack hybrid)

Drawing inspiration from Discord's community-focused interface and Slack's professional messaging patterns. This chat application prioritizes clarity, efficient information density, and real-time communication flow.

**Key Design Principles:**
- Information hierarchy: Messages > Rooms > Users
- Minimal visual distractions to maintain focus on conversations
- Efficient use of screen real estate for multi-column layout
- Clear visual separation between functional zones

## Core Design Elements

### A. Typography

**Font Family:** Inter (Google Fonts)
- Primary interface font with excellent readability at all sizes

**Typography Scale:**
- Room titles: text-lg font-semibold
- Message sender names: text-sm font-medium
- Message content: text-base font-normal
- Timestamps: text-xs font-normal
- Input placeholder: text-sm font-normal
- Button labels: text-sm font-semibold
- Modal headings: text-2xl font-bold

### B. Layout System

**Spacing Primitives:** Tailwind units of 2, 3, 4, 6, and 8
- Component padding: p-4
- Section gaps: gap-3 or gap-4
- Message spacing: space-y-2
- Modal padding: p-6 or p-8
- Input fields: p-3

**Three-Column Desktop Layout:**
1. Left Sidebar (w-64): Room list and controls
2. Center Panel (flex-1): Message area
3. Right Sidebar (w-56): Active users list

**Responsive Behavior:**
- Mobile: Single column with bottom navigation tabs
- Tablet: Two columns (rooms + messages)
- Desktop: Full three-column layout

### C. Component Library

**Navigation & Room Management:**
- Room List Item: Hover states, unread indicators (bold text), active room highlight
- Create Room Button: Prominent placement at sidebar top
- Room Search: Icon with compact input field
- Public/Private Room Badge: Small pill indicators

**Chat Interface:**
- Message Bubble Alternative: Left-aligned sender name with timestamp, message text below
- Message Grouping: Same user messages within 5 minutes grouped without repeating name
- System Messages: Centered, italicized, smaller text for joins/leaves
- Scroll-to-Bottom Button: Fixed position when not at bottom

**Forms & Inputs:**
- Message Input: Fixed bottom with send icon button, auto-expanding textarea
- Create Room Modal: Centered overlay with backdrop blur, room name input, public/private toggle, optional password field
- Join Room Modal: Similar modal with room name and password fields
- Password Input: Toggle visibility icon

**User Display:**
- User List Item: Avatar placeholder (initials), username, online indicator dot
- Current User Display: Highlighted at list top
- Participant Count: Small badge showing active users

**Modals & Overlays:**
- Semi-transparent backdrop (backdrop-blur-sm)
- Centered modal with max-w-md
- Clear close button (X icon top-right)
- Action buttons aligned right

**Status Indicators:**
- Connection Status: Small indicator in header (connected/disconnected)
- Typing Indicators: "User is typing..." below message list
- Unread Message Count: Number badge on room items

### D. Layout Specifications

**Desktop Structure:**
```
Header (h-16): App title, connection status, user name
Body (flex-1): Three columns
  - Rooms Sidebar: Scrollable list, create room button
  - Messages Area: Header with room name/info, scrollable messages, fixed input
  - Users Sidebar: Participant count header, scrollable user list
```

**Message Layout:**
- Max width for readability: max-w-4xl within message area
- Avatar/initials: w-8 h-8 rounded-full
- Message meta: flex justify-between for name and timestamp
- Link detection: Underlined, distinguishable from plain text

**Form Layouts:**
- Input groups: Stack vertically with space-y-4
- Labels: text-sm font-medium mb-2
- Toggle switches: Aligned right of label text
- Button groups: flex gap-3 justify-end

### E. Interaction Patterns

**Real-time Updates:**
- New messages: Smooth append to bottom, auto-scroll if at bottom
- User joins/leaves: System message with fade-in
- Room updates: Instant refresh of room list

**Navigation:**
- Room switching: Instant transition, clear message history
- Modal opening: Fade + scale animation (duration-200)
- No page reloads, all in-app navigation

**Input Behavior:**
- Enter to send (Shift+Enter for new line)
- Send button always visible
- Clear input after successful send
- Focus management on modal open/close

## Images

This application does not require images. Use icon library (Heroicons) for all UI elements: send icons, user icons, lock icons for private rooms, settings icon, and close buttons.

---

**Critical Implementation Notes:**
- Maintain consistent spacing throughout with the defined primitives
- Ensure mobile-first responsive design with clear navigation patterns
- Prioritize message readability and efficient screen space usage
- All interactive elements need clear hover/active states
- Focus on performance with virtualized scrolling for long message lists