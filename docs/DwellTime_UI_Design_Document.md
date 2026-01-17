# DwellTime: User Interface Design Document

> **Design Direction**: Clean Trust — Professional, modern, easy to navigate with optional dark mode for night/in-cab use

---

## Layout Structure

### Screen Architecture

DwellTime uses a **single-column, card-based layout** optimized for one-handed mobile use. Every screen follows a consistent structure:

```
┌─────────────────────────────┐
│  Status Bar (system)        │
├─────────────────────────────┤
│  Header                     │
│  - Screen title (left)      │
│  - Action icon (right)      │
├─────────────────────────────┤
│                             │
│  Primary Content Area       │
│  - Cards / Information      │
│  - Scrollable if needed     │
│                             │
│                             │
├─────────────────────────────┤
│  Primary Action Button      │
│  (Full-width, sticky)       │
├─────────────────────────────┤
│  Bottom Navigation Bar      │
│  (4 tabs with icons+labels) │
└─────────────────────────────┘
```

### Navigation Structure

**Bottom Tab Bar (4 tabs maximum)**:

| Tab | Icon | Label | Purpose |
|-----|------|-------|---------|
| 1 | Home/Dashboard icon | Home | Current status, active detention, quick stats |
| 2 | Search/Map icon | Facilities | Search and browse facility ratings |
| 3 | Clock/List icon | History | Past detention events and invoices |
| 4 | Person icon | Profile | Settings, subscription, preferences |

### Screen Hierarchy

```
Home (Tab 1)
├── Active Detention View (when tracking)
│   └── Add Evidence (Camera/Notes)
├── Detention Summary (post-visit)
│   ├── Generate Invoice
│   └── Rate Facility
└── Quick Stats Cards

Facilities (Tab 2)
├── Search Results
└── Facility Detail
    ├── Ratings Breakdown
    ├── Reviews List
    └── Get Directions

History (Tab 3)
├── Event Detail
│   ├── Evidence Gallery
│   └── Invoice Preview
└── Filter/Export Options

Profile (Tab 4)
├── Account Settings
├── Detention Settings (rate, grace period)
├── Invoice Customization
├── Appearance (Light/Dark mode toggle)
└── Subscription Management
```

---

## Core Components

### Primary Action Button

The main call-to-action appears as a **full-width button fixed to the bottom** of the screen, above the navigation bar.

- Height: 56px minimum
- Width: Full screen width minus 32px margins (16px each side)
- Corner radius: 12px
- States: Default, Pressed, Disabled, Loading

**Usage Examples**:
- "Start Tracking" (Home, no active event)
- "End Detention" (Active tracking)
- "Generate Invoice" (Summary screen)
- "Submit Rating" (Rating screen)

### Status Card (Home Screen)

A prominent card displaying current detention status:

**Inactive State**:
```
┌─────────────────────────────────┐
│  ○  No Active Detention         │
│                                 │
│  Ready to track your next stop  │
└─────────────────────────────────┘
```

**Active State**:
```
┌─────────────────────────────────┐
│  ● TRACKING ACTIVE              │
│                                 │
│  Walmart DC #4523               │
│  Dallas, TX                     │
│                                 │
│  ┌───────────────────────────┐  │
│  │      02:34:17           │    │
│  │   Detention Time        │    │
│  └───────────────────────────┘  │
│                                 │
│  Grace ended: 10:32 AM          │
│  Current value: $189.50         │
└─────────────────────────────────┘
```

### Information Cards

Used for grouping related information throughout the app:

- Background: White (light mode) / Dark gray (dark mode)
- Corner radius: 12px
- Padding: 16px internal
- Margin: 16px between cards
- Shadow: Subtle drop shadow for depth (light mode only)

### List Items

For history, reviews, and search results:

- Height: 72px minimum (accommodates two lines of text + metadata)
- Left element: Icon or status indicator
- Center: Primary text (bold) + secondary text (regular)
- Right element: Value, arrow, or timestamp
- Divider: 1px line with 16px left indent

### Input Fields

- Height: 52px
- Corner radius: 10px
- Border: 1px solid (gray in default, accent color when focused)
- Label: Floating above field when active
- Clear button: X icon on right when field has content

### Facility Rating Display

**Star Rating**:
- 5-star system using filled/unfilled star icons
- Display with one decimal (e.g., 4.2)
- Stars sized at 20px for lists, 28px for detail views

**Category Ratings** (on detail view):
```
Wait Time        ★★★★☆  4.1
Staff            ★★★★★  5.0
Restrooms        ★★★☆☆  3.2
Parking          ★★★★☆  4.0
Safety           ★★★★★  4.5
```

### Timer Display

Large, prominent timer for active detention:

- Font size: 48px (primary), 16px (label)
- Font weight: Bold/Semibold
- Format: HH:MM:SS
- Updates: Every second
- Color: Accent color when in detention (green for money earned)

---

## Interaction Patterns

### Gesture Support

| Gesture | Action | Where Used |
|---------|--------|------------|
| Tap | Primary selection | Everywhere |
| Long press | Secondary options | History items (delete, share) |
| Pull down | Refresh content | Home, History, Facility lists |
| Swipe left | Quick action (delete/archive) | History items only |
| Swipe between tabs | Navigate tabs | Bottom navigation |

### Confirmation Patterns

**Critical Actions** (require explicit confirmation):
- End active detention
- Delete detention record
- Send invoice
- Cancel subscription

Confirmation uses a **bottom sheet modal** with:
- Clear description of action
- Destructive action in red (if applicable)
- Cancel option always available

**Non-Critical Actions** (immediate with undo):
- Mark invoice as paid
- Archive history item

Uses **toast notification** with "Undo" button (5 second window)

### Loading States

- **Initial load**: Skeleton screens matching content layout
- **Action processing**: Button shows spinner, disabled state
- **Background sync**: Subtle indicator in header (not blocking)

### Empty States

Every list screen has a designed empty state:

- Illustration (simple, line-art style)
- Headline explaining the empty state
- Brief description
- Call-to-action button when applicable

**Example (History - Empty)**:
```
     [Simple truck illustration]

     No detention events yet

     When you track your first detention,
     it will appear here.

     [ Start Tracking ]
```

### Notification Patterns

**In-App Notifications**:
- Toast messages: Bottom of screen, auto-dismiss after 4 seconds
- Alerts: Center modal for critical information
- Banners: Top of screen for persistent info (e.g., "GPS signal weak")

**Push Notifications** (from system prompt):
- Geofence arrival: "You've arrived at [Facility]. Start tracking?"
- Grace period warning: "Grace period ends in 15 minutes"
- Detention started: "Detention tracking active"

### Form Validation

- Real-time validation as user types (after first blur)
- Error messages appear below field in red
- Success indicated by green checkmark
- Submit button disabled until form valid

---

## Visual Design Elements & Color Scheme

### Light Mode (Primary)

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Background | White | #FFFFFF |
| Secondary Background | Light Gray | #F5F7FA |
| Card Background | White | #FFFFFF |
| Primary Text | Charcoal | #1F2937 |
| Secondary Text | Gray | #6B7280 |
| Disabled Text | Light Gray | #9CA3AF |
| Primary Accent | Deep Blue | #1A56DB |
| Primary Accent (Pressed) | Darker Blue | #1648C0 |
| Success / Money | Green | #10B981 |
| Warning | Amber | #F59E0B |
| Error / Destructive | Red | #EF4444 |
| Dividers | Light Gray | #E5E7EB |
| Card Shadow | Black 8% | rgba(0,0,0,0.08) |

### Dark Mode (Night/In-Cab)

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Background | Near Black | #121212 |
| Secondary Background | Dark Gray | #1E1E1E |
| Card Background | Dark Gray | #252525 |
| Primary Text | Off White | #F5F5F5 |
| Secondary Text | Gray | #A0A0A0 |
| Disabled Text | Dark Gray | #6B6B6B |
| Primary Accent | Lighter Blue | #3B82F6 |
| Primary Accent (Pressed) | Blue | #2563EB |
| Success / Money | Bright Green | #22C55E |
| Warning | Orange | #F97316 |
| Error / Destructive | Bright Red | #F87171 |
| Dividers | Dark Gray | #333333 |
| Card Shadow | None | — |

### Iconography

- Style: Outlined icons (2px stroke), filled when selected/active
- Size: 24px for navigation, 20px inline with text
- Source: Consistent icon family (Lucide, Heroicons, or custom)
- Touch target: 44px minimum around all icons

### Imagery

- Photo placeholders: Light gray with camera icon
- Facility photos: Rounded corners (8px), consistent aspect ratio (16:9)
- Evidence photos: Thumbnail grid (3 columns), tap to expand

### Elevation & Shadows (Light Mode Only)

| Level | Usage | Shadow |
|-------|-------|--------|
| 0 | Flat elements | None |
| 1 | Cards, buttons | 0 2px 4px rgba(0,0,0,0.08) |
| 2 | Floating elements, modals | 0 4px 12px rgba(0,0,0,0.12) |
| 3 | Bottom sheets | 0 -4px 16px rgba(0,0,0,0.16) |

---

## Mobile, Web App, Desktop Considerations

### Mobile (Primary Platform)

DwellTime is **mobile-first** — this is the primary and MVP platform.

**iOS Specifics**:
- Respect safe areas (notch, home indicator)
- Use SF Pro font or system default
- Follow iOS navigation conventions (back arrows left, actions right)
- Support Dynamic Type for accessibility
- Face ID / Touch ID for sensitive actions (future)

**Android Specifics**:
- Material Design 3 influences welcome but not required
- Support system back gesture
- Use Roboto or system default font
- Handle diverse screen sizes (test on small and large devices)
- Support Android 8.0+ (API 26)

**Shared Mobile Requirements**:
- Minimum touch target: 44x44px
- Maximum content width: None (full width on mobile)
- Orientation: Portrait only for MVP
- Screen sizes: Support 320px width minimum to 428px (iPhone 14 Pro Max)

### Tablet (Future Enhancement)

- Two-column layout for larger screens
- Master-detail pattern for History and Facilities
- Side navigation option
- Not required for MVP

### Web App (Phase 2 — Fleet Dashboard)

For fleet owners and shippers accessing dashboards:

**Layout Adjustments**:
- Maximum content width: 1200px (centered)
- Side navigation for primary sections
- Multi-column layouts for data tables
- Hover states for all interactive elements

**Additional Considerations**:
- Responsive breakpoints: 768px (tablet), 1024px (desktop)
- Keyboard navigation support
- Print-friendly invoice views

### Desktop (Not Planned)

No native desktop application planned. Web app covers desktop use cases.

---

## Typography

### Font Family

**Primary Font**: Inter

- Clean, highly legible sans-serif
- Excellent screen rendering
- Wide character support
- Free and open source
- Fallback: SF Pro (iOS), Roboto (Android), system sans-serif

### Type Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | 32px | Bold (700) | 40px | Timer display, large numbers |
| H1 | 24px | Semibold (600) | 32px | Screen titles |
| H2 | 20px | Semibold (600) | 28px | Section headers |
| H3 | 18px | Medium (500) | 24px | Card titles |
| Body | 16px | Regular (400) | 24px | Primary content |
| Body Small | 14px | Regular (400) | 20px | Secondary content, metadata |
| Caption | 12px | Medium (500) | 16px | Labels, timestamps, hints |
| Button | 16px | Semibold (600) | 24px | Button text |

### Typography Rules

1. **Minimum body text**: 16px — never smaller for primary content
2. **Maximum line length**: 65 characters for readability
3. **Contrast ratios**: Minimum 4.5:1 for body text, 3:1 for large text
4. **All caps**: Used sparingly (status labels only, e.g., "TRACKING ACTIVE")
5. **Number formatting**:
   - Currency: $1,234.56 (with commas)
   - Time: 02:34:17 (leading zeros)
   - Dates: Jan 9, 2026 (abbreviated month)

### Text Truncation

- Single line: Ellipsis at end ("Walmart Distribution Cen...")
- Facility names: Allow 2 lines maximum before truncation
- Review text: Show 3 lines with "Read more" expansion

---

## Accessibility

### Vision

**Color Contrast**:
- All text meets WCAG 2.1 AA standard (4.5:1 minimum)
- Interactive elements meet 3:1 contrast against background
- Never rely on color alone to convey information (pair with icons/text)

**Color Blindness**:
- Success (green) and error (red) always paired with icons
- Status indicators use shape + color (● filled vs ○ outline)
- Tested against protanopia, deuteranopia, tritanopia

**Text Scaling**:
- Support system font size preferences (iOS Dynamic Type, Android font scaling)
- Layout remains functional up to 200% text size
- Test at large text settings

**Dark Mode**:
- Automatic switching based on system preference
- Manual override in Profile settings
- Maintains all contrast requirements

### Motor

**Touch Targets**:
- Minimum 44x44px for all interactive elements
- 8px minimum spacing between adjacent touch targets
- Primary actions at bottom of screen (thumb reach)

**Gestures**:
- All swipe actions have button alternatives
- No time-limited interactions (except undo toasts, which are non-critical)
- Single-tap for all primary actions

### Cognitive

**Simplicity**:
- One primary action per screen
- Clear, descriptive button labels ("Generate Invoice" not "Submit")
- Consistent navigation across all screens
- Progress indicators for multi-step processes

**Error Prevention**:
- Confirmation for destructive actions
- Undo available for reversible actions
- Clear error messages with recovery instructions

**Reading Level**:
- Interface copy at 8th grade reading level or below
- Avoid jargon (except industry terms drivers know)
- Short sentences, active voice

### Screen Readers

**iOS VoiceOver / Android TalkBack**:
- All images have alt text
- Icons have accessible labels
- Buttons describe their action
- Form fields have associated labels
- Screen changes announced
- Focus order follows visual layout

**Semantic Structure**:
- Proper heading hierarchy (H1 → H2 → H3)
- Lists marked up as lists
- Buttons vs. links used appropriately

### Reduced Motion

- Respect system "reduce motion" preferences
- Replace animations with instant state changes
- Timer updates remain (functional, not decorative)

---

## Summary

DwellTime's interface is designed around three core principles:

1. **Trust**: Clean, professional appearance that drivers trust with their documentation and money

2. **Simplicity**: One-handed operation, single primary action per screen, minimal cognitive load

3. **Practicality**: Dark mode for night use, large touch targets, works offline, glanceable status

The visual design uses a restrained color palette anchored by deep blue (trust) and green (money/success), with generous white space and consistent card-based layouts. Typography prioritizes legibility over style, with minimum 16px body text and clear hierarchy.

Every design decision answers the question: *"Can a driver use this easily at 5 AM in a truck stop parking lot?"*

---

*Document Version: 1.0*
*Last Updated: January 9, 2026*
*Companion to: DwellTime PRD v2.0*
