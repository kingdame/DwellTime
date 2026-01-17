# DwellTime: Product Requirements Document v2.1

> **A GPS-verified detention tracking and facility intelligence platform for trucking professionals**
>
> **Now includes**: Public API, ELD Auto-Capture, Dual Detention (Pickup + Delivery), Facility Amenities, AI Analytics

---

## 1. Elevator Pitch

DwellTime is a mobile-first SaaS platform that solves the $1.1–1.3 billion annual detention problem in trucking. Drivers lose hours waiting at facilities with no way to document, prove, or collect compensation for their time. DwellTime provides GPS-verified detention tracking, automated invoice generation, and crowdsourced facility intelligence—turning wasted hours into documented billable time. Every detention event creates proprietary data that becomes a competitive moat: facility wait times, ratings, and conditions that no competitor possesses. We start with owner-operators who need proof to get paid, then expand to small fleets who need visibility across drivers, and ultimately become the intelligence layer that brokers and shippers pay to access.

---

## 2. Who Is This App For

### Primary Users: Owner-Operators

Owner-operators are independent truck drivers who own or lease their own trucks and operate as independent contractors. They represent approximately 587,000 self-employed drivers in the United States (roughly 16% of all truck drivers). They are the ideal initial target because:

- **Direct financial impact**: They personally lose income for every hour spent waiting—unlike company drivers who may receive hourly pay regardless
- **Decision-making authority**: They can download and pay for apps without corporate approval
- **Tech-savvy enough**: Most are comfortable with mobile apps (ELD apps, load boards, GPS navigation)
- **Motivated to contribute data**: They benefit directly from knowing which facilities have long wait times before accepting loads

**Demographics**:
- Age range: 21–65+ (primarily 30s–50s)
- Education: Predominantly high school diploma or GED
- Device usage: Mobile-first (smartphones), some tablet/laptop use for paperwork
- Current tools: ELD apps (Motive, Samsara), load boards (DAT, Truckstop), banking apps

**Pain Points**:
- No irrefutable way to prove wait times to brokers/shippers
- Paper logs and manual timestamps easily disputed
- Only 3% of drivers collect 90%+ of their detention claims
- 63% of drivers wait 3+ hours at facilities
- Detention policies vary wildly ($50–$100/hour when paid at all)

### Secondary Users: Small Fleet Owners (2–10 Trucks)

Fleet owners who manage multiple trucks and drivers. They represent a massive market segment—70% of all trucking companies operate only one power unit, and 97% have 10 or fewer trucks. They need:

- Fleet-wide detention analytics
- Visibility into which facilities/shippers cost them money
- Aggregated data for rate negotiations
- Driver accountability and documentation

### Phase 2 Users: Shippers & Receivers (Months 3–6)

Large shipping and receiving facilities—Walmart distribution centers, Amazon fulfillment, food manufacturers, cold storage warehouses—are the *cause* of detention. Once we have driver data exposing wait times, these companies become paying customers to:

| Need | Solution | Why They Pay |
|------|----------|--------------|
| **Reputation Management** | "Claim your facility" portal to see ratings, respond to reviews | Bad ratings = carriers refuse loads or demand higher rates |
| **Operational Intelligence** | See their own average wait times, peak congestion hours, dock utilization | Data they don't currently have—identifies bottlenecks |
| **Competitive Benchmarking** | Compare their facility performance to industry averages | Logistics directors need metrics for executive reporting |
| **Driver Relations** | Direct communication channel with carriers who visit their facility | Reduce complaints, improve relationships |

**Pricing**: $99–$499/month per facility (tiered by facility size and features)

**Sales Motion**: Inbound—facilities discover they have bad ratings and seek to improve them. The data moat creates demand.

### Phase 3 Users: Brokers & Enterprise (Months 6–12)

Freight brokers and large carriers represent the enterprise expansion opportunity:

| User Type | Value Proposition | Revenue Model |
|-----------|-------------------|---------------|
| **Freight Brokers** | Know facility wait times *before* booking loads; avoid problem shippers; reduce carrier complaints | API access / data subscription ($299–$999/month) |
| **Large Fleet Carriers** | Fleet-wide detention analytics across hundreds of drivers; aggregate data for shipper negotiations | Enterprise tier ($500–$2,000/month) |
| **TMS/ELD Providers** | Integrate facility intelligence into their platforms (Motive, Samsara, KeepTruckin) | API licensing / partnership deals |
| **Factoring Companies** | Verify detention claims before advancing payment; reduce fraud | Partnership/referral fees |

**Enterprise Features**:
- API access for integration into existing systems
- White-label facility intelligence data
- Custom reporting and analytics dashboards
- Dedicated account management
- SLA guarantees

### Future Users (Phase 4+)

| User Type | Value Proposition | Revenue Model |
|-----------|-------------------|---------------|
| **Insurance Companies** | Facility risk data for underwriting | Data licensing |
| **Supply Chain Consultants** | Benchmarking data for client recommendations | Report subscriptions |
| **Government/DOT** | Aggregated detention data for policy research | Data partnerships |

---

## 3. Functional Requirements

### 3.1 Core Feature: Automatic Detention Tracking

**Purpose**: Eliminate he-said/she-said disputes by creating GPS-verified, timestamped records of facility arrival, wait time, and departure.

| Requirement | Description |
|-------------|-------------|
| **Geofence Detection** | App detects arrival at facility via GPS coordinates. Auto-populates facility information if known; allows manual entry if not recognized. |
| **Auto-Start Timer** | After configurable grace period expires (default: 2 hours), detention timer begins automatically. |
| **Background Tracking** | Works when phone is locked or app is backgrounded. GPS coordinates logged every 5 minutes during active detention. |
| **Manual Override** | Driver can start/stop timer manually if needed (e.g., GPS issues, facility not in database). |
| **No Pause on Movement** | Once detention tracking starts, it does NOT pause if driver moves within facility or briefly exits geofence. Detention continues until driver explicitly ends or departs final destination. |
| **GPS Fallback** | If GPS signal is weak/unavailable (inside warehouse), system falls back to manual input. Auto-syncs and updates timestamps once signal restored. |

#### Dual Detention: Pickup AND Delivery

**Detention can occur at BOTH ends of a load:**

| Event Type | When It Occurs | Who Pays |
|------------|----------------|----------|
| **Pickup Detention** | Waiting at shipper to load | Shipper/Broker |
| **Delivery Detention** | Waiting at receiver to unload | Receiver/Broker |

| Requirement | Description |
|-------------|-------------|
| **Event Type Selection** | Driver or system identifies if stop is pickup or delivery |
| **Separate Tracking** | Each detention event tracked independently with its own timer |
| **Combined BOL Linking** | Multiple detention events can be linked to single load/BOL |
| **Separate Analytics** | Facility stats show both pickup and delivery wait times |
| **Dual Invoice Option** | Generate invoices for pickup detention, delivery detention, or both |

**Why This Matters**: A driver delivering to a receiver may experience 3 hours of unloading detention AFTER already experiencing 2 hours of loading detention at the shipper. Both are billable—most apps only track one.

**Terminology Note**: In trucking, "detention" and "demurrage" are often used interchangeably to describe driver wait time at facilities. The app should support both terms in UI/documentation for user familiarity.

### 3.2 Core Feature: Evidence Capture

**Purpose**: Build an irrefutable evidence package that accompanies every detention claim.

| Requirement | Description |
|-------------|-------------|
| **Photo Capture** | Camera integration with automatic timestamp and GPS coordinate watermark embedded in image metadata. |
| **Photo Categories** | Dock area, Bill of Lading (BOL), Wait conditions, Check-in screen, Other. |
| **Notes Field** | Free-text field for context: "Dock not ready," "No lumper available," "Told to wait after appointment." |
| **Evidence Binding** | All photos and notes tied to specific detention event record. |
| **Offline Support** | Photos/notes stored locally if no connection; uploaded when connectivity restored. |

### 3.3 Core Feature: Invoice Generation

**Purpose**: One-tap professional invoice generation that drivers can send directly to brokers for payment.

| Requirement | Description |
|-------------|-------------|
| **PDF Generation** | Professional invoice template generated on-device. |
| **Auto-Population** | Pre-filled with: Driver info, Company name (if applicable), Facility name/address, Arrival/departure times, Grace period end time, Detention start time, Total detention hours, Hourly rate, Amount due. |
| **Evidence Attachment** | GPS log and photos attached as supporting documentation. |
| **Delivery Options** | Email directly to broker, download PDF, share via messaging apps. |
| **Configurable Rate** | Driver sets their hourly detention rate ($25–$100/hr typical range). |
| **Invoice Customization** | Drivers can add their logo, company name, custom terms/notes. |
| **Black Label (Future)** | Premium branded invoice templates for fleet/company customers. |

### 3.4 Core Feature: Facility Intelligence (Expanded)

**Purpose**: Crowdsourced database of facility wait times, conditions, amenities, and nearby services—the defensible data moat.

| Requirement | Description |
|-------------|-------------|
| **Facility Ratings** | Rate facility after each visit (1–5 stars). |
| **Rating Categories** | Wait time, Staff treatment, Restroom access, Parking availability, Safety, Cleanliness. |
| **Text Reviews** | Optional written review with character limit. |
| **Aggregate Scores** | View average ratings, average wait time, total number of reports before accepting loads. |
| **Facility Search** | Search by name, address, city, or proximity. |
| **Map View** | See nearby rated facilities on map interface. |

#### Facility Amenities Tracking

| Amenity | Description | Icon |
|---------|-------------|------|
| **Overnight Parking** | Can truckers park overnight? How many spaces? | 🅿️ |
| **Restrooms** | Indoor restrooms available to drivers | 🚻 |
| **Driver Lounge** | Dedicated waiting area for drivers | 🛋️ |
| **Water Available** | Drinking water accessible | 💧 |
| **Vending Machines** | Food/drink vending on-site | 🥤 |
| **WiFi** | Free WiFi for drivers | 📶 |
| **Showers** | Shower facilities available | 🚿 |
| **Clean Facility** | Overall cleanliness rating | ✨ |
| **Porta Potty Only** | No indoor restrooms, porta potty only | 🚽 |
| **Outdoor Waiting** | Drivers must wait outside | ☀️ |
| **Indoor Waiting** | Climate-controlled waiting area | 🏠 |
| **Security** | Security patrol or cameras | 🔒 |

#### Nearby Services (Auto-Populated + Crowdsourced)

| Service Type | Data Source | Information Provided |
|--------------|-------------|---------------------|
| **Tire Repair** | Google Places + Driver Reports | Name, distance, phone, 24hr availability |
| **Truck Repair** | Google Places + Driver Reports | Name, distance, phone, services offered |
| **Fuel Stops** | GasBuddy API + Driver Reports | Name, distance, diesel price, amenities |
| **Truck Stops** | Trucker Path API + Driver Reports | Name, distance, parking, showers |
| **Weigh Stations** | DOT Data | Location, typical wait times |

#### Cargo & Weight Tracking

| Data Point | Description | Why It Matters |
|------------|-------------|----------------|
| **Average Cargo Weight** | Crowdsourced weight data from drivers | Identify overweight shippers |
| **Overweight Percentage** | % of loads that exceeded 80,000 lbs | Safety compliance flag |
| **Max Recorded Weight** | Highest weight reported at facility | Red flag indicator |
| **Scale Availability** | Is there a scale on-site? | Driver planning |

**Overweight Alert System**: When a shipper has >15% overweight rate, flag them in facility intelligence so drivers know to request certified scale weights before leaving.

### 3.5 Core Feature: Multi-Stop Load Tracking

**Purpose**: Handle real-world scenarios where drivers have multiple pickup/delivery points on a single Bill of Lading.

| Requirement | Description |
|-------------|-------------|
| **Per-Facility Tracking** | Each facility arrival/departure tracked independently. |
| **BOL Association** | Multiple detention events can be linked to single load/BOL. |
| **Combined Invoice** | Option to generate single invoice combining all detention from multi-stop load. |
| **Individual Invoices** | Option to generate separate invoices per facility if preferred. |

### 3.6 Core Feature: Detention History & Analytics

**Purpose**: Dashboard for tracking, filtering, and exporting detention data.

| Requirement | Description |
|-------------|-------------|
| **Event Dashboard** | List view of all detention events with key details. |
| **Filters** | Date range, Facility, Status (pending/invoiced/paid), Amount. |
| **Summary Stats** | Total detention hours (monthly/yearly), Total dollars, Average wait time. |
| **Export** | CSV export for accounting/tax purposes. |
| **Status Tracking** | Mark invoices as pending, sent, paid. |

---

## 4. User Stories

### 4.1 Owner-Operator: Daily Detention Tracking

**As an** owner-operator arriving at a shipper facility,
**I want** the app to automatically detect my arrival and start tracking my time,
**So that** I have GPS-verified proof of how long I waited without manually logging anything.

**Acceptance Criteria**:
- App sends push notification within 2 minutes of arriving at recognized facility
- Notification shows facility name and asks to confirm arrival
- Grace period countdown visible in app
- GPS coordinates logged every 5 minutes once detention begins
- Timer continues even if I background the app or lock my phone

---

### 4.2 Owner-Operator: Evidence Collection

**As an** owner-operator waiting at a dock,
**I want** to quickly capture photos with automatic timestamps and GPS data,
**So that** I have visual evidence to support my detention claim.

**Acceptance Criteria**:
- Camera accessible within 2 taps from main screen
- Photos automatically tagged with current date/time/GPS
- Can categorize photo (dock, BOL, conditions, check-in)
- Can add text note to each photo
- Photos visible in current detention event detail view

---

### 4.3 Owner-Operator: Invoice Generation

**As an** owner-operator leaving a facility after detention,
**I want** to generate a professional invoice in one tap,
**So that** I can immediately send it to my broker and get paid for my time.

**Acceptance Criteria**:
- "Generate Invoice" button appears on detention summary screen
- Invoice pre-populated with all relevant data
- GPS log attached as PDF appendix
- Photos attached or embedded
- Can email directly or save/share PDF
- Invoice shows my company name/logo if configured

---

### 4.4 Owner-Operator: Pre-Load Facility Research

**As an** owner-operator considering a load,
**I want** to look up the pickup/delivery facilities before accepting,
**So that** I can avoid facilities known for excessive wait times.

**Acceptance Criteria**:
- Search by facility name or address
- See average wait time, star rating, number of reports
- See recent reviews from other drivers
- Can view on map with nearby alternatives

---

### 4.5 Owner-Operator: Multi-Stop Load

**As an** owner-operator with a multi-stop load (e.g., Walmart distribution to 3 stores),
**I want** detention tracked separately at each stop but combined on one invoice,
**So that** I can bill accurately for the entire load's detention.

**Acceptance Criteria**:
- Each facility arrival creates separate detention record
- Can link multiple detention events to single "load" or BOL
- Invoice generation offers "combine all stops" option
- Combined invoice shows breakdown by facility plus total

---

### 4.6 Driver: Manual Fallback

**As a** driver inside a warehouse with poor GPS signal,
**I want** to manually log my arrival time,
**So that** I don't miss tracking detention due to signal issues.

**Acceptance Criteria**:
- Manual "Start Detention" button always accessible
- Manual entry allows selecting facility from list or entering new
- When GPS signal returns, app offers to update location data
- Manual entries clearly marked but still valid for invoicing

---

### 4.7 Driver: Rating a Facility

**As a** driver leaving a facility,
**I want** to quickly rate my experience,
**So that** other drivers benefit from my knowledge.

**Acceptance Criteria**:
- Rating prompt appears after ending detention event
- 1–5 star rating for overall experience
- Optional category ratings (wait time, staff, restrooms, parking, safety)
- Optional text review
- Can skip rating if desired
- Rating contributes to facility's aggregate score

---

### 4.8 Fleet Owner: Driver Oversight (Future—Fleet Tier)

**As a** small fleet owner,
**I want** to see detention events across all my drivers,
**So that** I can identify which shippers/facilities cost my company the most money.

**Acceptance Criteria**:
- Dashboard shows all drivers' detention events
- Can filter by driver, facility, date range
- Aggregated analytics: total detention hours/dollars by facility
- Can generate fleet-wide reports for rate negotiations

---

### 4.9 Shipper/Facility Manager: Reputation Management (Phase 2)

**As a** logistics manager at a distribution center,
**I want** to see how truck drivers rate my facility,
**So that** I can identify operational issues and improve our reputation with carriers.

**Acceptance Criteria**:
- Can claim our facility profile with verification
- See aggregate star rating and category breakdowns
- View individual reviews with timestamps
- See our average wait time compared to industry benchmark
- Can respond to reviews publicly

---

### 4.10 Shipper/Facility Manager: Operational Intelligence (Phase 2)

**As a** logistics manager,
**I want** to see data on when our facility has the longest wait times,
**So that** I can adjust staffing and scheduling to reduce detention.

**Acceptance Criteria**:
- Dashboard shows average wait time by day of week
- Heat map showing peak congestion hours
- Trend line showing wait time improvement/decline over time
- Alerts when wait time exceeds threshold

---

### 4.11 Freight Broker: Facility Vetting (Phase 3)

**As a** freight broker booking loads,
**I want** to check facility wait time ratings before confirming a load,
**So that** I can avoid booking carriers into problem facilities and reduce detention disputes.

**Acceptance Criteria**:
- API access to query facility by name or address
- Returns: average wait time, star rating, number of reports
- Can integrate data into our TMS/booking workflow
- Real-time data (updated within 24 hours of new reports)

---

### 4.12 Enterprise Carrier: Fleet Analytics (Phase 3)

**As a** fleet manager at a carrier with 100+ trucks,
**I want** aggregated detention analytics across my entire fleet,
**So that** I can negotiate better rates with shippers who cost us the most in detention.

**Acceptance Criteria**:
- Dashboard shows fleet-wide detention by shipper/facility
- Ranking of worst facilities by total detention cost
- Exportable reports for shipper negotiations
- Year-over-year comparison
- API access for integration into our existing systems

---

## 5. User Interface Guidelines

> **Note**: Detailed UI/UX design will be developed in the next phase. The following are guiding principles and high-level requirements.

### 5.1 Design Principles

| Principle | Rationale |
|-----------|-----------|
| **One-Handed Operation** | Drivers are often in/around their truck; UI must be usable with one hand, large touch targets. |
| **Glanceable Status** | Current detention status (active/inactive, time elapsed) visible immediately on app open. |
| **Minimal Input Required** | Auto-populate everything possible; reduce typing. |
| **Works Offline** | Core tracking must function without connectivity; sync when available. |
| **Dark Mode Default** | Many drivers work at night or rest in sleeper cabs; bright screens are problematic. |
| **High Contrast** | Viewable in direct sunlight (cab windshield) and low light. |
| **Large Text Options** | Accessibility for older drivers (30s–60s age range). |

### 5.2 Key Screens

| Screen | Purpose |
|--------|---------|
| **Home/Dashboard** | Current status (active detention or not), quick stats, recent events |
| **Active Detention** | Timer display, current facility info, evidence capture buttons, "End Detention" |
| **Detention Summary** | Post-visit summary with all data, "Generate Invoice" and "Rate Facility" CTAs |
| **Invoice Preview** | Full invoice view before sending; edit hourly rate, add notes |
| **Facility Search** | Search bar, results list, map toggle |
| **Facility Detail** | Ratings, reviews, average wait time, address, "Get Directions" |
| **History** | List of all detention events with filters |
| **Settings** | Profile, hourly rate, grace period, notification preferences, subscription |

### 5.3 Navigation Structure

```
├── Home (Dashboard)
│   ├── Active Detention (when tracking)
│   └── Quick Actions
├── History
│   └── Event Detail
│       └── Invoice Generation
├── Facility Search
│   └── Facility Detail
└── Profile/Settings
    ├── Account Info
    ├── Detention Settings (rate, grace period)
    ├── Invoice Customization
    └── Subscription Management
```

### 5.4 Notification Strategy

| Trigger | Notification |
|---------|--------------|
| Geofence arrival | "You've arrived at [Facility]. Start tracking?" |
| Grace period ending (15 min warning) | "Grace period ends in 15 minutes" |
| Detention started | "Detention tracking active at [Facility]" |
| Geofence departure | "You've left [Facility]. End detention?" |
| Invoice sent confirmation | "Invoice sent to [email]" |
| GPS signal lost (after 10 min) | "GPS signal weak. Tracking continues, but location may be approximate." |

---

## 6. Technical Architecture

### 6.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Bun | Local development, scripts |
| **Language** | TypeScript | Type safety |
| **Mobile Framework** | React Native | Cross-platform mobile |
| **Development Platform** | Expo | Build tooling, native APIs |
| **Routing** | Expo Router | File-based navigation |
| **Server State** | TanStack Query | API caching, sync |
| **Client State** | Zustand | Local state management |
| **Backend** | Supabase | Auth, DB, Edge Functions |
| **Database** | PostgreSQL | Via Supabase |
| **Edge Functions** | Deno | Via Supabase |
| **Cache** | Upstash Redis | Serverless caching |
| **Object Storage** | Cloudflare R2 | Photos, PDFs |

### 6.2 Data Model

#### users
```
id                    UUID PRIMARY KEY
email                 VARCHAR NOT NULL UNIQUE
name                  VARCHAR
company_name          VARCHAR
phone                 VARCHAR
hourly_rate           DECIMAL DEFAULT 75.00
grace_period_minutes  INTEGER DEFAULT 120
invoice_logo_url      VARCHAR
invoice_terms         TEXT
subscription_tier     ENUM ('free', 'pro', 'fleet')
stripe_customer_id    VARCHAR
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

#### facilities
```
id                    UUID PRIMARY KEY
name                  VARCHAR NOT NULL
address               VARCHAR
city                  VARCHAR
state                 VARCHAR(2)
zip                   VARCHAR(10)
lat                   DECIMAL(10,7) NOT NULL
lng                   DECIMAL(10,7) NOT NULL
avg_wait_minutes      INTEGER
avg_rating            DECIMAL(2,1)
total_reviews         INTEGER DEFAULT 0
facility_type         ENUM ('shipper', 'receiver', 'both', 'unknown')
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

#### detention_events
```
id                    UUID PRIMARY KEY
user_id               UUID REFERENCES users(id)
facility_id           UUID REFERENCES facilities(id)
load_reference        VARCHAR (BOL number or load ID)
arrival_time          TIMESTAMP NOT NULL
departure_time        TIMESTAMP
grace_period_end      TIMESTAMP
detention_start       TIMESTAMP
detention_minutes     INTEGER
hourly_rate           DECIMAL
total_amount          DECIMAL
status                ENUM ('active', 'completed', 'invoiced', 'paid')
notes                 TEXT
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

#### gps_logs
```
id                    UUID PRIMARY KEY
detention_event_id    UUID REFERENCES detention_events(id)
lat                   DECIMAL(10,7) NOT NULL
lng                   DECIMAL(10,7) NOT NULL
accuracy              DECIMAL
timestamp             TIMESTAMP NOT NULL
```

#### photos
```
id                    UUID PRIMARY KEY
detention_event_id    UUID REFERENCES detention_events(id)
storage_url           VARCHAR NOT NULL
category              ENUM ('dock', 'bol', 'conditions', 'checkin', 'other')
lat                   DECIMAL(10,7)
lng                   DECIMAL(10,7)
timestamp             TIMESTAMP
caption               TEXT
```

#### facility_reviews
```
id                    UUID PRIMARY KEY
user_id               UUID REFERENCES users(id)
facility_id           UUID REFERENCES facilities(id)
detention_event_id    UUID REFERENCES detention_events(id)
overall_rating        INTEGER CHECK (1-5)
wait_time_rating      INTEGER CHECK (1-5)
staff_rating          INTEGER CHECK (1-5)
restroom_rating       INTEGER CHECK (1-5)
parking_rating        INTEGER CHECK (1-5)
safety_rating         INTEGER CHECK (1-5)
comment               TEXT
created_at            TIMESTAMP
```

#### invoices
```
id                    UUID PRIMARY KEY
user_id               UUID REFERENCES users(id)
invoice_number        VARCHAR UNIQUE
detention_event_ids   UUID[] (array of linked events for multi-stop)
recipient_email       VARCHAR
total_amount          DECIMAL
pdf_url               VARCHAR
status                ENUM ('draft', 'sent', 'paid')
sent_at               TIMESTAMP
paid_at               TIMESTAMP
created_at            TIMESTAMP
```

### 6.3 Geofencing Logic

```
ARRIVAL DETECTED (enter geofence)
    │
    ▼
Auto-populate facility OR prompt manual entry
    │
    ▼
User confirms → Start grace period countdown
    │
    ▼
Grace period expires (default 2 hours)
    │
    ▼
DETENTION TIMER STARTS
    │
    ├── GPS log every 5 minutes
    ├── User can capture photos/notes
    │
    ▼
User taps "End" OR exits final geofence
    │
    ▼
DETENTION ENDS → Show summary → Prompt invoice/rating
```

**Important**: Detention does NOT pause if driver moves within lot or briefly exits geofence. Once started, detention runs until explicitly ended or driver departs the delivery area entirely.

---

## 7. Business Model

### 7.1 Pricing Tiers — Driver/Carrier Side (MVP)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/month | 3 detention events/month, basic facility lookup, manual timer only (no geofence auto-detect), no PDF invoices |
| **Pro** | $29/month | Unlimited events, auto geofence detection, PDF invoice generation, full facility intelligence, photo capture, GPS logging, CSV export, invoice customization |
| **Fleet** | $19/driver/month | Everything in Pro + fleet dashboard, driver management, aggregated analytics, multi-driver reporting, API access, priority support |

### 7.2 Pricing Tiers — Shipper/Facility Side (Phase 2)

| Tier | Price | Features |
|------|-------|----------|
| **Basic** | $99/month | Claim facility profile, see ratings and reviews, respond to reviews |
| **Professional** | $249/month | Everything in Basic + average wait time analytics, peak hour reports, driver feedback summaries |
| **Enterprise** | $499/month | Everything in Professional + multi-facility dashboard, benchmarking vs. industry, API access, dedicated support |

### 7.3 Pricing Tiers — Broker/Enterprise Side (Phase 3)

| Tier | Price | Features |
|------|-------|----------|
| **Broker API** | $299–$999/month | Facility intelligence API, wait time data feed, integration support (usage-based pricing) |
| **Enterprise Carrier** | $500–$2,000/month | Fleet-wide analytics for 50+ drivers, custom reporting, white-label options, SLA |
| **TMS/ELD Integration** | Custom | API licensing for platform integration, revenue share on referred users |

### 7.4 Revenue Projections (Conservative)

**Phase 1: Driver Revenue (Months 1–6)**

| Milestone | Paid Users | MRR |
|-----------|------------|-----|
| Month 3 | 100 drivers | $2,900 |
| Month 6 | 500 drivers | $14,500 |

**Phase 2: Adding Shipper Revenue (Months 6–12)**

| Milestone | Drivers | Shippers | MRR |
|-----------|---------|----------|-----|
| Month 9 | 1,000 | 25 facilities | $35,000 |
| Month 12 | 2,000 | 75 facilities | $75,000 |

**Phase 3: Adding Enterprise/Broker Revenue (Year 2)**

| Milestone | Drivers | Shippers | Enterprise | MRR |
|-----------|---------|----------|------------|-----|
| Month 18 | 5,000 | 200 facilities | 10 brokers/enterprises | $175,000 |
| Month 24 | 10,000 | 500 facilities | 50 brokers/enterprises | $400,000+ |

### 7.5 Future Revenue Streams

| Stream | Description | Pricing Model |
|--------|-------------|---------------|
| **Shipper Subscriptions** | "Claim your facility" + see ratings + respond to reviews | $99–$499/month |
| **Broker API Access** | Facility intelligence data feed for load matching | Usage-based API pricing |
| **Factoring Partnerships** | Referral fees for invoice financing | Revenue share |
| **Data Licensing** | Aggregated, anonymized facility wait time data | Enterprise contracts |

---

## 8. Success Metrics

### 8.1 MVP Launch Criteria (Week 6–8)

- [ ] App live on iOS TestFlight + Android APK
- [ ] Core flow functional: Geofence → Timer → Invoice
- [ ] 10+ beta users actively testing
- [ ] Payment processing working (Stripe)
- [ ] Facility database seeded with 50+ known locations

### 8.2 Key Performance Indicators

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| App Downloads | 250 | 1,500 | 5,000 |
| Paid Subscribers | 25 | 100 | 500 |
| Detention Events Logged | 100 | 1,000 | 10,000 |
| Facilities in Database | 50 | 500 | 2,500 |
| Facility Reviews | 25 | 250 | 1,500 |
| MRR | $725 | $2,900 | $14,500 |
| DAU/MAU Ratio | 30% | 40% | 50% |

### 8.3 North Star Metric

**Total Detention Dollars Documented**: The cumulative value of detention time tracked through the platform. This represents real money drivers can claim and reflects the core value proposition.

---

## 9. Development Roadmap

### Phase 1: Foundation (Weeks 1–2)

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 1** | Project Setup + Auth | Expo project with TypeScript, Supabase setup, database schema, user auth (email/password), basic navigation structure, settings screen |
| **Week 2** | Geofencing + Timer | Location permissions flow, geofence detection logic, background tracking, detention timer UI, grace period countdown, manual start/stop |

### Phase 2: Core Features (Weeks 3–4)

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 3** | Evidence Capture | Camera integration, photo upload to Supabase Storage, GPS watermarking, photo categorization, notes field, offline queue |
| **Week 4** | Invoice Generation | PDF template design, data population, evidence attachment, email integration, save/share, hourly rate configuration |

### Phase 3: Intelligence + Polish (Weeks 5–6)

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 5** | Facility Intelligence | Facility search (name/address), ratings submission UI, aggregate score display, review list, map view integration |
| **Week 6** | Payments + Polish | Stripe subscription integration, paywall implementation, UI polish, bug fixes, performance optimization |

### Phase 4: Launch (Weeks 7–8)

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 7** | Beta Testing | TestFlight/Play Store internal testing, 10+ beta users, feedback collection, critical bug fixes |
| **Week 8** | Public Launch | App Store/Play Store submission, landing page live, marketing launch, user onboarding flow finalized |

### Phase 5: Shipper Portal (Months 3–6)

| Focus | Deliverables |
|-------|--------------|
| **Facility Claim System** | Verification workflow for shippers to claim their facility profiles |
| **Shipper Dashboard** | Analytics view showing their facility's ratings, wait times, reviews |
| **Review Response** | Ability for shippers to respond to driver reviews |
| **Benchmarking** | Compare facility performance to industry averages |
| **Shipper Subscriptions** | Stripe integration for facility subscription tiers |

### Phase 6: Enterprise & API (Months 6–12)

| Focus | Deliverables |
|-------|--------------|
| **Public API** | RESTful API for facility intelligence data access |
| **Broker Dashboard** | Multi-facility view for freight brokers |
| **TMS/ELD Integrations** | Partnerships with Motive, Samsara, KeepTruckin for data sync |
| **Enterprise Reporting** | Custom analytics, white-label options, bulk data exports |
| **Factoring Integration** | API for factoring companies to verify detention claims |

### Phase 7: ELD Auto-Capture & AI Analytics (Months 9–15)

| Focus | Deliverables |
|-------|--------------|
| **ELD Integration Layer** | Samsara, Motive, Omnitracs bi-directional sync |
| **Auto-Capture Mode** | Zero driver input—detention tracked from ELD GPS data |
| **Fleet Auto-Import** | Bulk vehicle/driver sync from ELD platforms |
| **AI Analytics Dashboard** | Charts, graphs, trend analysis, anomaly detection |
| **Efficiency Scoring** | AI-generated efficiency scores per facility |
| **Predictive Alerts** | ML-based predictions for long wait times |
| **Cost Optimization** | AI recommendations to reduce detention costs |

---

## 9.1 Enterprise Features (Phase 3)

### Public API

DwellTime exposes a comprehensive API for enterprise integrations:

| Endpoint Category | Purpose |
|-------------------|---------|
| **Detention Events** | Create, read, update detention records |
| **Facilities** | Query facility intelligence, ratings, amenities |
| **Fleet Management** | Register vehicles, drivers, manage fleet |
| **Analytics** | Efficiency reports, cost analysis, trends |
| **Webhooks** | Real-time event notifications |

**See**: `DwellTime_API_Specification.md` for complete API documentation.

### ELD Auto-Capture Integration

**Problem**: Drivers shouldn't have to interact with another app while driving.

**Solution**: Integrate directly with ELD providers to automatically capture detention.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELD AUTO-CAPTURE FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. Fleet connects ELD account (Samsara, Motive, etc.)
2. DwellTime receives GPS stream via webhook
3. System auto-detects facility arrivals via geofence
4. Detention tracking starts automatically
5. On departure, event is completed and stored
6. Invoice generated automatically (if configured)
7. Data syncs back to ELD platform for fleet dashboard

RESULT: Zero driver interaction required
```

**Supported ELD Providers (Roadmap)**:

| Provider | Integration Type | Phase |
|----------|-----------------|-------|
| Samsara | OAuth + Webhooks | Phase 2 |
| Motive (KeepTruckin) | OAuth + Webhooks | Phase 2 |
| Omnitracs | API | Phase 3 |
| PeopleNet | API | Phase 3 |
| Geotab | API | Phase 3 |

### AI-Powered Analytics

**For Enterprise Customers**: Transform raw detention data into actionable intelligence.

#### AI Dashboard Features

| Feature | Description | Value |
|---------|-------------|-------|
| **Efficiency Score** | AI-calculated score (0-100) per facility | Quick comparison |
| **Trend Charts** | Detention hours over time, by facility, by driver | Identify patterns |
| **Cost Breakdown** | Pie/bar charts of detention costs by category | Budget planning |
| **Anomaly Detection** | Flag unusual wait times or patterns | Catch problems early |
| **Predictive ETA** | ML-predicted wait time based on historical data | Driver planning |
| **Optimization Recommendations** | AI suggestions to reduce detention | Actionable insights |

#### Chart Types

| Chart | Data Shown | Update Frequency |
|-------|------------|------------------|
| **Line Graph** | Detention hours trend (daily/weekly/monthly) | Real-time |
| **Bar Chart** | Top 10 worst facilities by detention cost | Daily |
| **Pie Chart** | Detention cost by shipper/receiver | Daily |
| **Heat Map** | Detention by day of week + time of day | Weekly |
| **Scatter Plot** | Wait time vs. cargo weight (overweight correlation) | Weekly |
| **Gauge** | Fleet efficiency score | Real-time |

#### AI Insights Examples

```
┌─────────────────────────────────────────────────────────────────┐
│  🤖 AI INSIGHT                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "Walmart DC #4523 has 23% longer wait times on Mondays         │
│   between 6-9 AM. Consider scheduling deliveries after 10 AM    │
│   to reduce detention by an estimated 45 minutes per load."     │
│                                                                 │
│  Potential Monthly Savings: $2,340                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ ANOMALY DETECTED                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "ABC Manufacturing has shown a 156% increase in average        │
│   detention time over the past 2 weeks. This is unusual         │
│   compared to their 6-month baseline."                          │
│                                                                 │
│  Recommendation: Contact shipper about operational changes      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📊 EFFICIENCY REPORT                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Fleet Efficiency Score: 72/100 (↑ 5 from last month)           │
│                                                                 │
│  Top Inefficiencies:                                            │
│  1. Target DC #12 → $12,500/mo in detention (245 min avg)       │
│  2. Sysco Atlanta → $8,200/mo in detention (180 min avg)        │
│  3. Home Depot RDC → $6,100/mo in detention (165 min avg)       │
│                                                                 │
│  [View Detailed Report] [Export PDF] [Schedule with AI]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Background location drains battery** | User churn, negative reviews | Medium | Use geofence events (not continuous GPS); 5-min intervals during detention only; battery optimization documentation |
| **Brokers/shippers reject app invoices** | Core value prop fails | Medium | GPS evidence is irrefutable proof; market as "documentation they can't argue with"; provide educational content on detention rights |
| **DAT/Motive/Samsara copies feature** | Competitive pressure | High | Move fast; build data moat; facility intelligence is the defensible asset—competitors can copy features but not crowd-sourced data |
| **Low initial adoption** | Slow data flywheel | Medium | Seed database with known bad facilities; partner with OOIDA, trucker Facebook groups, YouTube trucking influencers; referral program |
| **GPS accuracy issues inside facilities** | Evidence disputes | Medium | Manual fallback with clear UI; sync when signal returns; photos with timestamps as backup evidence |
| **App Store rejection (background location)** | Launch delay | Low | Clear privacy policy; legitimate use case documentation; follow Apple/Google guidelines precisely |

---

## 11. Go-to-Market Strategy

### 11.1 Launch Channels

| Channel | Approach | Priority |
|---------|----------|----------|
| **Trucker Facebook Groups** | Organic posts, community engagement, beta invites | High |
| **YouTube Trucking Influencers** | Sponsored reviews, demo videos | High |
| **OOIDA (Owner-Operator Independent Drivers Association)** | Partnership/sponsorship, member benefits | Medium |
| **Truck Stop Flyers/QR Codes** | Physical marketing at Pilot/Flying J, Love's | Medium |
| **TikTok/Instagram Reels** | Short-form content showing app in action | Medium |
| **Trucking Podcasts** | Sponsored segments, founder interviews | Low |

### 11.2 Messaging Framework

**Primary Message**: "Stop losing money waiting. Start getting paid."

**Supporting Messages**:
- "GPS-verified proof brokers can't dispute"
- "Know which facilities will waste your time before you accept the load"
- "One tap to generate a professional detention invoice"
- "Join 1,000+ drivers building the industry's facility database"

### 11.3 Referral Program

- **Referrer**: 1 month free Pro for each successful referral
- **Referred**: First month 50% off
- **Viral Loop**: Facility ratings visible to non-users → drives downloads

---

## 12. Legal & Compliance Considerations

| Area | Consideration | Action |
|------|---------------|--------|
| **Location Privacy** | Background location tracking requires clear disclosure | Comprehensive privacy policy; in-app explanation of why location is needed; easy opt-out |
| **Data Retention** | GPS logs are personal data | Define retention period; user can delete their data; GDPR/CCPA compliance if applicable |
| **Invoice Validity** | App-generated invoices may not meet legal invoice requirements in all jurisdictions | Include disclaimer; ensure all legally required fields present; consult legal |
| **Facility Data Accuracy** | Crowdsourced data could be inaccurate or defamatory | Terms of service; moderation capability; facility dispute process |
| **User-Generated Reviews** | Reviews could be defamatory | Community guidelines; reporting mechanism; legal review of ToS |

---

## 13. Appendix

### 13.1 Glossary

| Term | Definition |
|------|------------|
| **Detention** | Time a truck driver spends waiting at a shipper/receiver facility beyond the allotted free time (typically 2 hours). Carriers charge shippers/brokers for this time. |
| **Demurrage** | Often used interchangeably with detention in trucking. In maritime shipping, demurrage specifically refers to container fees at ports. |
| **Grace Period** | The initial free time before detention charges begin (industry standard: 2 hours). |
| **BOL (Bill of Lading)** | Legal document between shipper and carrier detailing type, quantity, and destination of goods. |
| **Owner-Operator** | A truck driver who owns or leases their own truck and operates as an independent contractor. |
| **Geofence** | Virtual geographic boundary that triggers actions when a device enters or exits the area. |
| **ELD (Electronic Logging Device)** | Federally mandated device that records driving hours for compliance. |
| **Lumper** | Third-party worker who loads/unloads freight at facilities. |

### 13.2 Competitive Landscape

| Competitor | Offering | Weakness |
|------------|----------|----------|
| **Detention Source** | GPS-verified detention tracking app | Limited facility intelligence; less polished UX |
| **DMRG Detention Pay** | Detention tracking with geolocation | New/limited features; no invoice customization |
| **McLeod LoadMaster** | Enterprise TMS with detention module | Enterprise-focused; expensive; not for owner-operators |
| **Motive/Samsara** | ELD providers with some detention features | Detention is add-on, not core; no crowdsourced facility data |
| **Manual logging** | Paper/spreadsheet tracking | Easily disputed; time-consuming; no proof |

**DwellTime Differentiator**: Purpose-built for owner-operators + crowdsourced facility intelligence data moat.

### 13.3 Industry Data Points

- DOT estimates drivers lose $1.1–1.3 billion yearly to detention
- 63% of drivers experience detention of 3+ hours on at least one-fifth of their loads
- Detention rates typically range from $50–$100 per hour
- Industry standard grace period: 2 hours
- Only 3% of drivers collect 90%+ of their detention claims
- 587,000 owner-operators in the United States
- 70% of trucking companies operate only one power unit
- 97% of trucking companies have 10 or fewer trucks

---

## 14. Immediate Next Steps

### Tomorrow
1. Initialize Expo project with TypeScript template
2. Set up Supabase project + create initial schema
3. Implement basic auth flow (email/password)
4. Create main navigation structure

### This Week
5. Get location permissions working (iOS + Android)
6. Build basic geofence proof-of-concept
7. Create detention timer UI
8. Set up landing page for early signups (Carrd or similar)
9. Begin outreach to trucker Facebook groups for beta interest

---

> **BUILD FAST. SHIP FASTER. ITERATE WITH USERS.**
>
> The goal is not a perfect product. The goal is a working product in drivers' hands that solves a real problem. Everything else is iteration.

---

*Document Version: 2.0*
*Last Updated: January 9, 2026*
*Status: Ready for Development*
