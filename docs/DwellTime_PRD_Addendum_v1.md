# DwellTime: PRD Addendum v1.0

> **Updates to PRD v2.1 based on market research and pricing analysis**
>
> **Date**: January 2026
> **Status**: Final for MVP

---

## 1. Revised Pricing Strategy

### The Problem With Original Pricing

| Original | Competitor | Gap |
|----------|------------|-----|
| $29/month | $9.99/month (Detention Source Lite) | 3x higher |

**Market reality:**
- Owner-operators net $60-87K/year
- 80-90% fail in year one (cash flow issues)
- Some weeks loads pay only $1.80-2.50/mile
- Drivers already pay $150-200/month in app subscriptions (DAT, ELD, etc.)

### New Pricing: Keep It Simple

```
┌─────────────────────────────────────────────────────────────────┐
│                    DWELLTIME PRICING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FREE                              PRO                          │
│  ────                              ───                          │
│  $0/month                          $12.99/month                 │
│                                    (or $99/year - save 36%)     │
│                                                                 │
│  • 3 detention events/month        • Unlimited tracking         │
│  • GPS tracking                    • Everything in Free, plus:  │
│  • Photo evidence                  • Full facility ratings      │
│  • PDF invoice + email             • Payment reliability data   │
│  • View facility ratings           • Load check (before you go) │
│  • Add your own ratings            • Money recovery tracker     │
│                                    • Invoice follow-up tools    │
│                                    • Nearby services            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Works

| Decision | Rationale |
|----------|-----------|
| **One paid tier** | No confusion. Free or Pro. That's it. |
| **3 free events** | Enough to try, not enough to live on |
| **$12.99 vs $9.99** | We have more features (facility intelligence, payment data) |
| **$99/year option** | Better for us (cash flow), better for them (savings) |

### ROI Math for Drivers

```
One detention event recovered = $75-150
Annual subscription = $99

ROI: 75% to 150% return on your FIRST event
```

---

## 1B. Fleet Pricing (Phase 2)

### No Free Tier for Fleets

Individual drivers get 3 free events/month to try the app and build our data moat.

**Fleets don't get a free tier.** Why:
- 5 drivers × 3 free events = 15 events/month (enough to never pay)
- Fleet owners make business decisions, not personal tryouts
- They already pay for DAT, ELD, insurance apps — subscriptions aren't a barrier
- The dashboard visibility IS the value

**Instead: 14-day free trial** — full access, all features, then converts to paid.

### Fleet Pricing: Flat Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                    DWELLTIME FLEET PRICING                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SMALL FLEET                         FLEET                      │
│  ───────────                         ─────                      │
│  2-5 drivers                         6-10 drivers               │
│                                                                 │
│  $49.99/month                        $79.99/month               │
│  (or $399/year - save 33%)           (or $649/year - save 32%)  │
│                                                                 │
│  Everything in Pro, plus:            Everything in Small Fleet: │
│  • Fleet dashboard                   • Priority support         │
│  • View all driver events            • Dedicated account rep    │
│  • Admin account (view-only)         • Custom onboarding        │
│  • Export reports (CSV, PDF)                                    │
│  • Set company-wide defaults                                    │
│    (rates, grace periods)                                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  11+ DRIVERS?                                                   │
│  Contact us for custom Enterprise pricing.                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Flat Pricing Works

| Fleet Size | Monthly | Per-Driver | vs Individual ($12.99) |
|------------|---------|------------|------------------------|
| 2 drivers | $49.99 | $25.00 | +93% (but includes dashboard) |
| 3 drivers | $49.99 | $16.66 | +28% |
| 4 drivers | $49.99 | $12.50 | -4% savings |
| 5 drivers | $49.99 | $10.00 | -23% savings |
| 6 drivers | $79.99 | $13.33 | +3% |
| 8 drivers | $79.99 | $10.00 | -23% savings |
| 10 drivers | $79.99 | $8.00 | -38% savings |

**Psychology**: "$80/month whether you have 6 or 10 drivers — might as well add everyone."

Flat pricing maximizes driver adoption = more data = stronger moat.

### What Fleet Admins Can Do

| Permission | Included |
|------------|----------|
| View all driver events | ✓ |
| View all invoices | ✓ |
| See facility ratings | ✓ |
| Export data/reports | ✓ |
| Add/remove drivers | ✓ |
| Set default rates | ✓ |
| Add notes to events | ✓ |

### What Fleet Admins Cannot Do

| Blocked | Why |
|---------|-----|
| Edit GPS timestamps | Destroys legal defensibility |
| Delete events | Data integrity |
| Stop another driver's tracking | Driver controls their own work |
| Modify invoice after sent | Legal document |

**Drivers control their own data. Admins have visibility, not control.**

### Market Coverage

| Tier | Fleet Size | % of Market |
|------|------------|-------------|
| Individual | 1 truck | 70% |
| Small Fleet | 2-5 trucks | ~20% |
| Fleet | 6-10 trucks | ~5% |
| Enterprise | 11+ trucks | ~5% |

**Our standard pricing covers 95% of the market.**

---

## 2. Facility Intelligence: Full Ratings + Overall Stars

### Keep the Full Rating System

The original PRD facility ratings stay. This is our data moat. We're NOT simplifying it — we're adding to it.

**What drivers rate after each visit:**

| Category | Rating | Optional? |
|----------|--------|-----------|
| **Overall Experience** | ⭐⭐⭐⭐⭐ (1-5 stars) | Required |
| **Wait Time** | ⭐⭐⭐⭐⭐ (1-5 stars) | Optional |
| **Staff Treatment** | ⭐⭐⭐⭐⭐ (1-5 stars) | Optional |
| **Restroom Access** | ⭐⭐⭐⭐⭐ (1-5 stars) | Optional |
| **Parking Availability** | ⭐⭐⭐⭐⭐ (1-5 stars) | Optional |
| **Safety** | ⭐⭐⭐⭐⭐ (1-5 stars) | Optional |
| **Cleanliness** | ⭐⭐⭐⭐⭐ (1-5 stars) | Optional |
| **Comments** | Text | Optional |

### UX Flow: Quick or Detailed

```
┌─────────────────────────────────────────────────────────────────┐
│  RATE THIS FACILITY                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Walmart DC #4523                                               │
│                                                                 │
│  How was your experience?                                       │
│  ☆ ☆ ☆ ☆ ☆                                                   │
│                                                                 │
│  [Submit Quick Rating]                                          │
│                                                                 │
│  ─── or ───                                                     │
│                                                                 │
│  [+ Add Detailed Ratings]  →  Expands to show all categories    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**If they tap "Add Detailed Ratings":**

```
┌─────────────────────────────────────────────────────────────────┐
│  DETAILED RATINGS (optional)                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Wait Time         ☆ ☆ ☆ ☆ ★    [Skip]                       │
│  Staff Treatment   ☆ ☆ ☆ ★ ★    [Skip]                       │
│  Restrooms         ☆ ☆ ☆ ☆ ★    [Skip]                       │
│  Parking           ☆ ☆ ☆ ☆ ☆    [Skip]                       │
│  Safety            ☆ ☆ ☆ ☆ ★    [Skip]                       │
│  Cleanliness       ☆ ☆ ☆ ★ ★    [Skip]                       │
│                                                                 │
│  Comments (optional)                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Long wait but staff was friendly. Parking lot well      │   │
│  │ lit. No driver lounge.                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Submit]                                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Keep Full Ratings?

1. **Data is gold** — More granular data = more valuable to shippers/brokers later
2. **Competitive moat** — Detention Source Lite has ZERO facility ratings
3. **Driver value** — Knowing "parking is great but restrooms are terrible" is useful
4. **B2B revenue** — Shippers will pay to see detailed breakdowns

### What Drivers See (Facility Card)

```
┌─────────────────────────────────────────────────────────────────┐
│  WALMART DC #4523                                               │
│  Dallas, TX                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⭐ 3.2 / 5  (247 ratings)                                      │
│                                                                 │
│  DETAILED BREAKDOWN                                             │
│  Wait Time      ⭐ 2.8    Staff        ⭐ 3.5                   │
│  Restrooms      ⭐ 3.2    Parking      ⭐ 4.1                   │
│  Safety         ⭐ 3.8    Cleanliness  ⭐ 3.0                   │
│                                                                 │
│  🕐 WAIT TIME STATS                                             │
│  Average: 2.8 hours                                             │
│  Today: Moderate (based on 3 drivers)                           │
│                                                                 │
│  💰 PAYMENT RELIABILITY                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  73% of drivers get paid for detention                  │   │
│  │  Average payment time: 12 days                          │   │
│  │  Best case: 3 days | Worst case: 45 days                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  🅿️ AMENITIES                                                   │
│  Overnight parking: Yes (25 spaces)                             │
│  Restrooms: Indoor                                              │
│  Driver lounge: No                                              │
│                                                                 │
│  [View All Reviews]  [Rate This Facility]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Payment Reliability Tracking (NEW FEATURE)

### The Insight

> "Only 3% of drivers collect 90%+ of their detention claims"

Drivers don't just need to document detention — they need to know **which facilities actually pay**.

### Data We Collect

After each detention event, we ask (via push notification 7-14 days later):

```
┌─────────────────────────────────────────────────────────────────┐
│  DETENTION FOLLOW-UP                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your detention claim at Walmart DC #4523                       │
│  Amount: $187.50 (2.5 hours)                                    │
│  Submitted: January 5, 2026                                     │
│                                                                 │
│  Did you get paid?                                              │
│                                                                 │
│  [Yes, full amount]  [Yes, partial]  [No]  [Still pending]      │
│                                                                 │
│  If yes: How many days did it take? [___] days                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What We Calculate (Per Facility)

| Metric | Description |
|--------|-------------|
| **Payment Rate** | % of detention claims that get paid |
| **Avg Payment Days** | Average days from invoice to payment |
| **Payment Range** | Best case / worst case payment times |
| **Partial Payment %** | % that pay less than full amount |

### Why This Is Our Moat

**Detention Source Lite**: Tracks time, generates invoices
**DwellTime**: Tracks time + tells you if you'll actually get paid

No one else has this data. And it gets better with every user.

---

## 4. Facility Check (Load Preview)

### The Problem

Drivers accept loads without knowing:
- How long they'll wait
- If they'll actually get paid for detention
- Where the truck entrance is (different from main address)

### The Solution: Quick Facility Lookup

Before accepting a load, drivers can check any facility:

```
┌─────────────────────────────────────────────────────────────────┐
│  FACILITY CHECK                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Search: [Walmart DC Dallas____________] [Search]               │
│                                                                 │
│  ───────────────────────────────────────────────────────────  │
│                                                                 │
│  WALMART DC #4523                                               │
│  1234 Distribution Way, Dallas, TX 75201                        │
│                                                                 │
│  ⭐ 3.2 / 5  (247 ratings)                                      │
│                                                                 │
│  ⏱️ Average wait: 2.8 hours                                     │
│  💰 73% of drivers get paid (avg 12 days)                       │
│  👍 68% positive experience                                     │
│                                                                 │
│  🚛 TRUCK ENTRANCE                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Truck entrance is DIFFERENT from main address       │   │
│  │  Use: 1250 Industrial Blvd (around the corner)          │   │
│  │  Driver tip: "Enter from Industrial Blvd, not the       │   │
│  │  main road. Gate is on the left after the weigh scale." │   │
│  │                                                         │   │
│  │  [View on Map]  [Get Directions]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [View Full Details]                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### MVP Implementation

For MVP, keep it simple:
1. Driver types facility name or address
2. We search our database first
3. If not found, use Google Places API to find it
4. Show what we know (or prompt driver to be first to rate)

### Phase 2: Smarter Search

- Screenshot OCR from load board (auto-extract addresses)
- Integration with DAT/Truckstop load details
- Auto-complete from our facility database

---

## 5. Truck Entrance Addressing (Differentiator)

### The Problem

**Truck entrances are often DIFFERENT from the main facility address.**

As a driver, you know this pain:
- GPS takes you to the main office entrance
- Truck entrance is around the corner, down the street, or on a completely different road
- You waste 15-30 minutes circling the building
- Some entrances require going through residential areas (illegal for trucks)

**Current solutions are weak:**
- Google Maps: Shows main address only
- Trucker Path: Community-updated, but inconsistent
- TruckMap: Has some facility entrance data, but limited
- SmartTruckRoute: Satellite images help, but no driver tips

### Our Advantage

We're already collecting facility data. Add ONE more field:

```
┌─────────────────────────────────────────────────────────────────┐
│  RATE THIS FACILITY                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🚛 TRUCK ENTRANCE INFO (help other drivers!)                   │
│                                                                 │
│  Is the truck entrance different from the main address?         │
│  [Yes]  [No]  [Not Sure]                                        │
│                                                                 │
│  If yes, describe how to find it:                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Enter from Industrial Blvd. Gate on left after scale.   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📍 Drop a pin on the truck entrance (optional)                 │
│  [Open Map to Pin Location]                                     │
│                                                                 │
│  [Skip]  [Submit]                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data We Collect

| Field | Type | Source |
|-------|------|--------|
| `main_address` | String | Google Places API |
| `truck_entrance_different` | Boolean | Driver-reported |
| `truck_entrance_address` | String | Driver-reported |
| `truck_entrance_lat` | Float | Driver pin drop |
| `truck_entrance_lng` | Float | Driver pin drop |
| `truck_entrance_notes` | Text | Driver tips |
| `verified_count` | Integer | How many drivers confirmed |

### Why This Matters

1. **No one else has this data** — Crowdsourced truck entrance locations
2. **Saves drivers 15-30 min** per unfamiliar facility
3. **Builds loyalty** — Drivers come back because we have info they need
4. **Data moat** — Every entry makes the platform more valuable

### Integration with Navigation

We're NOT building a full truck GPS (that's Trucker Path, Sygic, etc.). But we CAN:

1. **Show truck entrance on map** within our app
2. **"Get Directions" button** opens their preferred truck GPS with correct address
3. **Export to** Trucker Path, Google Maps, Sygic, etc.

```
┌─────────────────────────────────────────────────────────────────┐
│  GET DIRECTIONS TO TRUCK ENTRANCE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Open with:                                                     │
│                                                                 │
│  [Trucker Path]  [Google Maps]  [Apple Maps]                    │
│  [Sygic Truck]   [SmartTruckRoute]  [Copy Address]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**We complement existing truck GPS apps, not replace them.**

---

## 6. Email & Share PDF Feature

### The Problem

After generating a detention invoice PDF, drivers need to send it to:
- The broker
- The shipper/receiver
- Their dispatcher
- Their records

Detention Source Lite has this — they email a "detention summary" that drivers can share.

### Our Solution: Built-In Email + Share

**Option 1: Quick Email (In-App)**

```
┌─────────────────────────────────────────────────────────────────┐
│  SEND DETENTION INVOICE                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Invoice #DT-2026-0142                                          │
│  Amount: $187.50                                                │
│  Facility: Walmart DC #4523                                     │
│                                                                 │
│  Send to:                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ broker@abcfreight.com                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [+ Add another recipient]                                      │
│                                                                 │
│  ☑️ CC myself                                                   │
│  ☑️ Save this email for future invoices to this broker          │
│                                                                 │
│  Message (optional):                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Please see attached detention invoice for load #12345.  │   │
│  │ GPS-verified documentation included.                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Preview Email]  [Send]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Option 2: Native Share (iOS/Android)**

Tap "Share" → Opens native share sheet:
- Email
- Messages
- WhatsApp
- Save to Files
- AirDrop
- etc.

```
┌─────────────────────────────────────────────────────────────────┐
│  INVOICE READY                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Invoice generated!                                          │
│                                                                 │
│  Invoice #DT-2026-0142                                          │
│  Amount: $187.50                                                │
│                                                                 │
│  [📧 Email Invoice]     → Opens in-app email                    │
│                                                                 │
│  [📤 Share]             → Opens native share sheet              │
│                                                                 │
│  [💾 Save to Phone]     → Downloads PDF                         │
│                                                                 │
│  [🔗 Copy Link]         → If we host PDFs (Phase 2)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Recommendation: Both Options

1. **In-app email** for quick send (saves broker email for future)
2. **Native share** for flexibility (use whatever app they want)
3. **Auto-save to phone** so they always have a copy

### Email Template (Pre-Written)

```
Subject: Detention Invoice #DT-2026-0142 - [Facility Name]

Hello,

Please find attached the detention invoice for:

Load #: [Load Reference]
Facility: [Facility Name]
Date: [Date]
Detention Time: [X hours Y minutes]
Amount Due: $[Amount]

This invoice includes GPS-verified arrival and departure times,
along with photo documentation.

Payment terms: Net 30

Thank you,
[Driver Name]
[Company Name]
[Phone]

---
Generated by DwellTime - GPS-Verified Detention Tracking
```

### Save Broker Contacts

Over time, build a contact list:

```
┌─────────────────────────────────────────────────────────────────┐
│  SEND TO                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RECENT                                                         │
│  • broker@abcfreight.com (ABC Freight)                          │
│  • ap@xyzlogistics.com (XYZ Logistics)                          │
│                                                                 │
│  SAVED CONTACTS                                                 │
│  • John Smith - ABC Freight                                     │
│  • Mary Jones - XYZ Logistics                                   │
│  • Dispatch - My Company                                        │
│                                                                 │
│  [+ Add New Contact]                                            │
│                                                                 │
│  Or enter email: [________________________]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Competitor Analysis: Detention Source Lite

### What They Do Well

| Feature | How It Works |
|---------|--------------|
| **Simple flow** | Click "Track Detention" → Wait → Complete → Get summary |
| **GPS verification** | Logs location when tracking starts |
| **Auto-email** | Sends detention summary to driver automatically |
| **Share function** | Driver can email summary to anyone |
| **Clean UI** | Straightforward, not cluttered |
| **Price** | $9.99/month after 30-day trial |

### What They're Missing

| Gap | Our Advantage |
|-----|---------------|
| **No facility ratings** | We have full facility intelligence |
| **No payment tracking** | We track "did you get paid?" |
| **No facility database** | We build a searchable database |
| **No historical data** | We show trends, averages |
| **No truck entrance info** | We crowdsource truck-specific directions |
| **No invoice aging** | We track and remind on old invoices |
| **No ROI visibility** | We show "DwellTime helped you recover $X" |

### Their Detention Summary vs Our Invoice

**Detention Source Lite generates a "Detention Summary":**
- GPS timestamp + location
- Appointment time
- Check-in/out times
- Detention calculation
- Comments section

**Our Invoice includes:**
- Everything above, PLUS:
- Professional PDF format (their logo, terms)
- Photo evidence attached
- Facility rating data
- Historical context ("Average wait at this facility: X")
- QR code for verification (Phase 2)

### Pricing Comparison

| | Detention Source Lite | DwellTime |
|---|----------------------|-----------|
| Price | $9.99/month | $12.99/month |
| Free tier | 30-day trial only | 3 events/month forever |
| Annual option | ✗ | $99/year (36% savings) |

**Our $3 premium is justified by:**
- Facility intelligence
- Payment reliability data
- Truck entrance info
- Invoice aging/tracking
- Recovery dashboard

---

## 8. Recovery Dashboard (NEW FEATURE)

### The Problem

Drivers don't see ROI from the app. They don't know if it's working.

### The Solution

Show them exactly how much money they've documented and recovered.

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR DETENTION RECOVERY                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  THIS MONTH                                                     │
│  ───────────                                                    │
│  Documented:    $1,875 (25 hours)                               │
│  Collected:     $1,425 (76%)   ████████████████████             │
│  Pending:       $450                                            │
│                                                                 │
│  Your collection rate: 76% ↑                                   │
│  (Industry average: 3% collect 90%+)                            │
│                                                                 │
│  ────────────────────────────────────────────────────────────────
│                                                                 │
│  ALL TIME                                                       │
│  ────────                                                       │
│  Documented:    $12,340                                         │
│  Collected:     $9,876 (80%)                                    │
│                                                                 │
│  💰 DwellTime helped you recover: $9,876                        │
│     Your subscription cost: $78 (6 months)                      │
│     Your ROI: 12,559%                                           │
│                                                                 │
│  ────────────────────────────────────────────────────────────────
│                                                                 │
│  PENDING INVOICES                                               │
│  ────────────────                                               │
│  • Walmart DC #4523 - $187.50 - 12 days old                     │
│  • Sysco Atlanta - $262.50 - 8 days old                         │
│                                                                 │
│  [Send Reminder]                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Metrics

| Metric | What It Shows |
|--------|---------------|
| **Documented** | Total detention $ tracked in app |
| **Collected** | What driver reported as paid |
| **Pending** | Submitted but not yet paid |
| **Collection Rate** | % of documented that got paid |
| **ROI** | Collected ÷ subscription cost |

### Why This Matters

1. **Retention**: Driver sees value, keeps paying
2. **Word of mouth**: "This app helped me recover $10K"
3. **Data collection**: We learn which facilities pay

---

## 9. Invoice Aging + Follow-Up Reminders

### The Problem

Drivers forget to follow up. Invoices go stale. Money is lost.

### The Solution

```
┌─────────────────────────────────────────────────────────────────┐
│  INVOICE AGING                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CURRENT (0-14 days)                     3 invoices | $562.50   │
│  ───────────────────────────────────────────────────────────────
│  • Target DC #12 - $187.50 - 3 days - ✅ Sent                   │
│  • Amazon DAL3 - $150.00 - 7 days - ✅ Sent                     │
│  • Sysco Atlanta - $225.00 - 12 days - ✅ Sent                  │
│                                                                 │
│  AGING (15-30 days)                      2 invoices | $337.50   │
│  ───────────────────────────────────────────────────────────────
│  • Walmart DC #4523 - $187.50 - 18 days - ⚠️ Follow up?         │
│  • Kroger Memphis - $150.00 - 22 days - ⚠️ Follow up?           │
│                                                                 │
│  OVERDUE (30+ days)                      1 invoice | $112.50    │
│  ───────────────────────────────────────────────────────────────
│  • XYZ Freight - $112.50 - 45 days - 🔴 Escalate?               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Automated Reminders

| Day | Action |
|-----|--------|
| 14 | Push notification: "Invoice to [Facility] is 14 days old. Send reminder?" |
| 21 | Push notification: "Invoice aging. Consider following up." |
| 30 | Push notification: "Invoice overdue. Mark as unpaid or escalate?" |

### One-Tap Follow-Up

Driver taps "Send Reminder" → Pre-written email sent to broker/shipper:

```
Subject: Detention Invoice Follow-Up - [Invoice #]

This is a friendly reminder regarding detention invoice [#]
for services at [Facility] on [Date].

Amount due: $[Amount]
Original invoice date: [Date]
Days outstanding: [X]

GPS-verified documentation is attached.

Please confirm receipt and expected payment date.

Thank you,
[Driver Name]
[Company]
```

---

## 10. Updated Feature Priority (MVP)

### Must Have (Weeks 1-8)

| Feature | Status | Notes |
|---------|--------|-------|
| Geofence detection + timer | ✓ Original PRD | Core |
| GPS logging (background) | ✓ Original PRD | Core |
| Photo evidence capture | ✓ Original PRD | Core |
| PDF invoice generation | ✓ Original PRD | Core |
| **Email invoice (in-app + share)** | 🆕 New | Send PDF directly |
| **Full facility ratings (1-5 stars)** | 🆕 Updated | Overall required, details optional |
| **Payment reliability tracking** | 🆕 New | Moat feature |
| **Recovery dashboard** | 🆕 New | Proves ROI |
| **Invoice aging tracker** | 🆕 New | Helps collection |
| **Facility check (lookup)** | 🆕 New | Before accepting load |

### Should Have (Weeks 9-12)

| Feature | Status | Notes |
|---------|--------|-------|
| Dual detention (pickup + delivery) | ✓ Original PRD | Keep |
| Amenities (parking, restrooms) | ✓ Original PRD | Keep |
| **Truck entrance crowdsourcing** | 🆕 New | Differentiator |
| **Saved email contacts** | 🆕 New | Quick send to brokers |
| Follow-up email reminders | 🆕 New | One-tap reminders |
| Nearby services | ✓ Original PRD | Basic version |

### Phase 2 (Months 3-6)

| Feature | Notes |
|---------|-------|
| Fleet dashboard | For 2-10 truck owners |
| Navigation app handoff | Open truck entrance in Trucker Path, etc. |
| Screenshot OCR | Auto-extract facility from load board screenshot |
| Email open tracking | Know if broker opened your invoice |

### Deprioritized (Phase 3+)

| Feature | Why |
|---------|-----|
| Public API | Enterprise, not MVP |
| ELD auto-capture | Adds complexity, negotiate from strength later |
| AI analytics | Enterprise feature |
| Cargo weight tracking | Nice-to-have |

---

## 11. Updated Database Changes

### Add to facilities Table

```sql
-- Add truck entrance fields to existing facilities table
ALTER TABLE facilities ADD COLUMN truck_entrance_different BOOLEAN DEFAULT FALSE;
ALTER TABLE facilities ADD COLUMN truck_entrance_address VARCHAR;
ALTER TABLE facilities ADD COLUMN truck_entrance_lat DECIMAL(10, 8);
ALTER TABLE facilities ADD COLUMN truck_entrance_lng DECIMAL(11, 8);
ALTER TABLE facilities ADD COLUMN truck_entrance_notes TEXT;
ALTER TABLE facilities ADD COLUMN truck_entrance_verified_count INTEGER DEFAULT 0;
ALTER TABLE facilities ADD COLUMN google_place_id VARCHAR;
```

### Updated facility_reviews Table

```sql
CREATE TABLE facility_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  detention_event_id UUID REFERENCES detention_events(id),

  -- Overall + detailed ratings (all 1-5 stars)
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5) NOT NULL,
  wait_time_rating INTEGER CHECK (wait_time_rating BETWEEN 1 AND 5),
  staff_rating INTEGER CHECK (staff_rating BETWEEN 1 AND 5),
  restroom_rating INTEGER CHECK (restroom_rating BETWEEN 1 AND 5),
  parking_rating INTEGER CHECK (parking_rating BETWEEN 1 AND 5),
  safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),

  -- Wait time (auto-captured from detention event)
  actual_wait_minutes INTEGER,

  -- Truck entrance info (crowdsourced)
  truck_entrance_different BOOLEAN,
  truck_entrance_address VARCHAR,
  truck_entrance_lat DECIMAL(10, 8),
  truck_entrance_lng DECIMAL(11, 8),
  truck_entrance_notes TEXT,

  -- Payment tracking (updated later via follow-up)
  got_paid BOOLEAN,  -- Yes / No / NULL (pending)
  payment_days INTEGER,  -- Days to payment
  payment_amount DECIMAL(10,2),  -- Actual amount received
  partial_payment BOOLEAN,  -- Did they pay less than invoiced?

  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_facility ON facility_reviews (facility_id);
CREATE INDEX idx_reviews_user ON facility_reviews (user_id);
CREATE INDEX idx_reviews_created ON facility_reviews (created_at DESC);
```

### New: Email Contacts Table

```sql
-- Saved email contacts for quick invoice sending
CREATE TABLE email_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  name VARCHAR,
  company VARCHAR,
  contact_type VARCHAR CHECK (contact_type IN ('broker', 'shipper', 'dispatcher', 'other')),
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, email)
);

CREATE INDEX idx_email_contacts_user ON email_contacts (user_id);
CREATE INDEX idx_email_contacts_last_used ON email_contacts (user_id, last_used_at DESC);
```

### New: Invoice Email Log

```sql
-- Track sent emails for invoice follow-up
CREATE TABLE invoice_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  recipient_email VARCHAR NOT NULL,
  email_type VARCHAR CHECK (email_type IN ('initial', 'reminder', 'final_notice')) DEFAULT 'initial',
  subject VARCHAR,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,  -- If we track opens (Phase 2)

  CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE INDEX idx_invoice_emails_invoice ON invoice_emails (invoice_id);
```

### New: Facility Payment Stats (Materialized View)

```sql
-- Aggregated payment reliability per facility
CREATE MATERIALIZED VIEW facility_payment_stats AS
SELECT
  facility_id,
  COUNT(*) FILTER (WHERE got_paid IS NOT NULL) as total_claims,
  COUNT(*) FILTER (WHERE got_paid = TRUE) as paid_claims,
  ROUND(
    COUNT(*) FILTER (WHERE got_paid = TRUE)::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE got_paid IS NOT NULL), 0) * 100,
    1
  ) as payment_rate_percent,
  ROUND(AVG(payment_days) FILTER (WHERE got_paid = TRUE), 1) as avg_payment_days,
  MIN(payment_days) FILTER (WHERE got_paid = TRUE) as min_payment_days,
  MAX(payment_days) FILTER (WHERE got_paid = TRUE) as max_payment_days,
  COUNT(*) FILTER (WHERE partial_payment = TRUE) as partial_payment_count
FROM facility_reviews
WHERE detention_event_id IS NOT NULL
GROUP BY facility_id;

CREATE UNIQUE INDEX idx_facility_payment_stats ON facility_payment_stats (facility_id);

-- Refresh every hour
SELECT cron.schedule('refresh-payment-stats', '0 * * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY facility_payment_stats;
$$);
```

### Invoice Tracking Table (Updated)

```sql
CREATE TABLE invoice_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Status tracking
  status VARCHAR CHECK (status IN ('draft', 'sent', 'reminded', 'paid', 'partial', 'unpaid', 'disputed')) DEFAULT 'draft',

  -- Payment tracking
  amount_invoiced DECIMAL(10,2) NOT NULL,
  amount_received DECIMAL(10,2),
  payment_received_at TIMESTAMPTZ,
  days_to_payment INTEGER,

  -- Follow-up tracking
  last_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  next_reminder_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_tracking_user ON invoice_tracking (user_id);
CREATE INDEX idx_invoice_tracking_status ON invoice_tracking (status);
CREATE INDEX idx_invoice_tracking_reminder ON invoice_tracking (next_reminder_at) WHERE status IN ('sent', 'reminded');
```

---

## 12. Success Metrics

### MVP Success (Month 3)

| Metric | Target |
|--------|--------|
| Downloads | 1,000+ |
| Active users (weekly) | 500+ |
| Free → Pro conversion | 25%+ |
| Facility ratings submitted | 2,000+ |
| Payment reliability data points | 500+ |
| Truck entrance reports | 200+ |

### Growth Metrics (Month 6)

| Metric | Target |
|--------|--------|
| Active users | 3,000+ |
| MRR | $5,000+ |
| Facilities with payment data | 1,000+ |
| Facilities with truck entrance data | 500+ |
| Average collection rate (Pro users) | 70%+ |
| App Store rating | 4.5+ stars |

### Moat Metrics (Month 12)

| Metric | Target |
|--------|--------|
| Facilities in database | 10,000+ |
| Payment reliability data points | 25,000+ |
| Truck entrance locations | 5,000+ |
| Word-of-mouth referrals | 30%+ of signups |

---

## 13. Summary: What Makes Us Different

### vs Detention Source Lite ($9.99/month)

| Feature | Them | Us |
|---------|------|-----|
| GPS tracking | ✓ | ✓ |
| PDF invoices | ✓ | ✓ |
| Email/share invoice | ✓ | ✓ |
| **Facility ratings** | ✗ | ✓ Full 7-category + overall |
| **Payment reliability** | ✗ | ✓ "73% get paid" |
| **Facility database** | ✗ | ✓ Searchable |
| **Truck entrance info** | ✗ | ✓ Crowdsourced |
| **Invoice aging** | ✗ | ✓ Track & remind |
| **Recovery dashboard** | ✗ | ✓ See your ROI |
| **Free tier** | 30-day trial | 3 events/month forever |

**Our pitch**: "Don't just track detention. Know if you'll get paid — and find the truck entrance."

### vs TruckMap / Trucker Path

They focus on navigation and truck stops. We focus on:
- Detention tracking & invoicing
- Payment reliability data
- Facility intelligence for decision-making

**We complement them, not compete.** Our "Get Directions" button opens their apps.

### The Three Data Moats

1. **Payment Reliability** — "Did you get paid?" data no one else has
2. **Facility Intelligence** — Detailed ratings across 7 categories
3. **Truck Entrance Locations** — Crowdsourced directions to the RIGHT entrance

Every user who contributes makes the platform more valuable for everyone else.

---

## Document Summary

This addendum updates the DwellTime PRD with:

| Addition | What It Does |
|----------|--------------|
| **Simplified pricing** | Free (3 events) + Pro ($12.99/month) |
| **Full facility ratings** | 1-5 stars overall + 6 optional detailed categories |
| **Payment reliability** | Track & display "X% of drivers get paid" |
| **Truck entrance crowdsourcing** | Solve the "GPS takes me to wrong entrance" problem |
| **Email/share invoice** | Send PDF directly to broker from app |
| **Saved contacts** | Quick send to frequently-used brokers |
| **Recovery dashboard** | Show drivers their ROI |
| **Invoice aging** | Track old invoices, prompt follow-up |
| **Facility check** | Look up facility before accepting load |

---

*Addendum Version: 1.0*
*Last Updated: January 2026*
*Companion to: DwellTime PRD v2.1, SRS v2.0, API Spec v1.0*
