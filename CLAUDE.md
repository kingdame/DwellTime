# Claude Development Notes

## Session Notes

### January 16, 2026 (Session 2)
- **Wired up all pages, routes, hooks, and functionality**
- All tabs now use real Convex data (no more mock user IDs)
- Auth sync implemented (Clerk → Convex user database)
- New invoice routes added (`/invoice/[id]`, `/invoice/send`)
- Sign out functionality added to Profile tab

### January 16, 2026 (Session 1)
- **Supabase → Clerk + Convex Migration COMPLETED**
- All unit tests rewritten for pure utility functions
- Deleted `/supabase` and `/src-backup` folders

---

## Important Rules

### Terminal Output Logging

**All builds, tests, and installs must be piped to `,context/terminal/`**

This ensures terminal output is captured and preserved for debugging and context tracking.

Example usage:
```bash
# Builds
npm run build 2>&1 | tee ,context/terminal/build.log

# Tests  
npm test 2>&1 | tee ,context/terminal/test.log

# Installs
npm install 2>&1 | tee ,context/terminal/install.log
```

---

## Current Migration Status

**Migration: Supabase Auth → Clerk + Convex**
**Status: ✅ COMPLETE** (Jan 16, 2026)

### ✅ ALL COMPLETED
- [x] Supabase removed from package.json
- [x] Clerk authentication configured (`@clerk/clerk-expo`)
- [x] Convex backend configured (`convex`)
- [x] All 17 routes migrated to Clerk
- [x] TokenCache using expo-secure-store
- [x] ClerkProvider + ConvexProviderWithClerk in app root
- [x] All 14 Convex tables have `clerkId` field with index
- [x] E2E route verification tests pass
- [x] All unit tests rewritten for pure utility functions (no Supabase mocks)
- [x] `dependencies.test.ts` updated to expect no Supabase
- [x] `/supabase` folder deleted (Edge Functions + migrations)
- [x] `/src-backup` folder deleted

### Test Results
- **12 test suites pass**
- **254 tests pass**
- All E2E and unit tests green

---

## App Wiring Status

**Status: ✅ FULLY CONNECTED** (Jan 16, 2026)

### Auth Flow
- [x] `useAuthSync` hook syncs Clerk user to Convex on sign-in
- [x] `useCurrentUserId()` returns real Convex user ID
- [x] `useCurrentUser()` returns cached user profile
- [x] Sign out button in Profile tab

### Tab Pages Connected
- [x] **Home** - Detention tracking uses Convex mutations
- [x] **Facilities** - Uses real user ID for recent facilities
- [x] **History** - Uses Convex hooks for detention history
- [x] **Invoices** - Uses Convex hooks for invoice management
- [x] **Profile** - Loads real user from Convex, settings update Convex
- [x] **Fleet** - Uses real user ID for fleet operations

### Routes Added
- [x] `/invoice/[id]` - Invoice detail with actions
- [x] `/invoice/send` - Send invoice email screen

### Key Files for Wiring
- `src/features/auth/hooks/useAuthSync.ts` - Clerk → Convex sync
- `src/shared/hooks/convex.ts` - All Convex hooks exports
- `app/_layout.tsx` - Auth sync provider wrapper

---

## PRD Feature Checklist (vs Implementation)

### ✅ Core Features - IMPLEMENTED

| Feature | PRD Requirement | Implementation Status |
|---------|-----------------|----------------------|
| **Geofence Detection** | Auto-detect facility arrival | ✅ `useLocation`, `useDetentionTracking` |
| **Detention Timer** | GPS-verified tracking | ✅ `TimerDisplay`, `useDetentionTimer` |
| **Grace Period** | 2-hour default | ✅ User configurable in profile |
| **Photo Evidence** | Capture with GPS/timestamp | ✅ `evidence` feature module |
| **Photo Categories** | dock, BOL, conditions, checkin | ✅ In Convex schema |
| **Invoice Generation** | PDF with GPS log | ✅ `invoices` feature module |
| **Invoice Email** | Send to broker in-app | ✅ `SendInvoiceModal`, `useEmailContacts` |
| **Facility Ratings** | 1-5 stars + 7 categories | ✅ `facilityReviews` Convex table |
| **Facility Search** | By name/address | ✅ `FacilitySearch`, `useFacilityLookup` |
| **History Dashboard** | List + filters | ✅ `history` feature module |
| **User Profile** | Settings, hourly rate | ✅ `profile` feature module |
| **Subscriptions** | Free/Pro/Fleet tiers | ✅ `billing` feature module |

### ✅ PRD Addendum Features - IMPLEMENTED

| Feature | PRD Requirement | Implementation Status |
|---------|-----------------|----------------------|
| **Payment Reliability** | "Did you get paid?" tracking | ✅ `facilityReviews.gotPaid`, `paymentFollowUps` |
| **Truck Entrance** | Crowdsourced entrance info | ✅ `TruckEntranceCard`, `truckEntranceReports` |
| **Recovery Dashboard** | Track invoiced vs paid | ✅ `recovery` feature module |
| **Invoice Aging** | 14/21/30 day tracking | ✅ `invoiceTracking` table |
| **Email Contacts** | Save broker contacts | ✅ `emailContacts` table, `ContactPicker` |
| **Dual Detention** | Pickup + Delivery | ✅ `eventType` field in `detentionEvents` |

### ✅ Fleet Features - IMPLEMENTED

| Feature | PRD Requirement | Implementation Status |
|---------|-----------------|----------------------|
| **Fleet Dashboard** | View all driver events | ✅ `FleetDashboard` component |
| **Driver Management** | Add/remove drivers | ✅ `FleetDriverList`, `InviteDriverModal` |
| **Fleet Invitations** | Email/code invites | ✅ `fleetInvitations` table |
| **Fleet Invoices** | Consolidated billing | ✅ `fleetInvoices` table |
| **Role Permissions** | Admin vs Driver | ✅ `fleetRole` on users |

### 🔄 Database Schema - ALL TABLES PRESENT

| Table | Purpose | Status |
|-------|---------|--------|
| `users` | User profiles | ✅ |
| `facilities` | Shipper/receiver locations | ✅ |
| `detentionEvents` | Tracking records | ✅ |
| `gpsLogs` | GPS breadcrumbs | ✅ |
| `photos` | Evidence photos | ✅ |
| `facilityReviews` | Ratings + payment tracking | ✅ |
| `invoices` | Generated invoices | ✅ |
| `subscriptions` | Stripe sync | ✅ |
| `invoiceTracking` | Payment follow-up | ✅ |
| `emailContacts` | Quick-send contacts | ✅ |
| `invoiceEmails` | Email send log | ✅ |
| `fleets` | Fleet organizations | ✅ |
| `fleetMembers` | Driver memberships | ✅ |
| `fleetInvitations` | Pending invites | ✅ |
| `fleetInvoices` | Consolidated billing | ✅ |
| `truckEntranceReports` | Crowdsourced entrances | ✅ |
| `paymentFollowUps` | Scheduled check-ins | ✅ |

### ⏳ Future/Phase 2+ Features (NOT YET IMPLEMENTED)

| Feature | PRD Phase | Notes |
|---------|-----------|-------|
| ELD Auto-Capture | Phase 7 | Samsara/Motive integration |
| AI Analytics | Phase 7 | ML predictions, efficiency scores |
| Shipper Portal | Phase 5 | Facility claim system |
| Public API | Phase 6 | REST API for brokers |
| Map View | Phase 2 | Facility map visualization |
| Push Notifications | Phase 1 | Geofence alerts (partially ready) |
| PDF Watermarking | Phase 1 | GPS watermark on photos |

---

## Project Overview

DwellTime Fresh - Expo/React Native app with Convex backend for detention time tracking.

### Key Technologies
- Expo Router (file-based routing)
- Convex (backend/database)
- Clerk (authentication)
- TypeScript

### Project Structure
- `/app` - Expo Router pages
- `/convex` - Convex backend functions and schema
- `/src/features` - Feature-based organization
- `/src/shared` - Shared components, hooks, types

### Key Files
- `src/shared/lib/clerk.ts` - Clerk token cache config
- `src/shared/lib/convex.ts` - Convex client config
- `app/_layout.tsx` - Root layout with providers
- `docs/MIGRATION_TEST_RESULTS.md` - Full migration test report
