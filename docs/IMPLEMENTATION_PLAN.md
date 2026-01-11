# DwellTime MVP Implementation Plan

> **Co-Founder/CTO**: Claude (Opus 4.5)
> **Start Date**: January 10, 2026
> **Target MVP**: 6-8 weeks
> **Architecture**: React Native (Expo) + Supabase + Cloudflare R2 + Upstash Redis

---

## Executive Summary

DwellTime is a GPS-verified detention tracking platform for trucking professionals. This plan follows the PRD roadmap with granular task breakdowns for systematic execution.

---

## Phase 1: Foundation (Week 1-2)

### Week 1: Project Setup + Authentication

#### 1.1 Project Initialization
- [x] **1.1.1** Create new Expo project with TypeScript template (`npx create-expo-app@latest DwellTime --template expo-template-blank-typescript`)
- [x] **1.1.2** ~~Configure Bun as package manager~~ → Reverted to npm (Windows permission issues)
- [x] **1.1.3** Set up project folder structure per SRS:
  ```
  src/
  ├── app/           # Expo Router
  ├── features/      # Feature modules
  ├── shared/        # Shared components/hooks/lib
  ├── constants/     # App constants
  └── assets/        # Static assets
  ```
- [x] **1.1.4** Configure TypeScript (strict mode, path aliases)
- [x] **1.1.5** Install and configure ESLint + Prettier
- [x] **1.1.6** Create .env.example and .gitignore
- [x] **1.1.7** Initialize Git repository with initial commit

#### 1.2 Supabase Setup
- [x] **1.2.1** Create new Supabase project (user created via dashboard)
- [x] **1.2.2** Install Supabase client (`npm install @supabase/supabase-js`)
- [x] **1.2.3** Install expo-secure-store for token storage
- [x] **1.2.4** Create `src/shared/lib/supabase.ts` with configured client
- [x] **1.2.5** Generate TypeScript types from Supabase schema
- [x] **1.2.6** Create initial database schema migration:
  - `users` table
  - `facilities` table
  - `detention_events` table
  - `gps_logs` table
  - `photos` table
  - `facility_ratings` table
- [x] **1.2.7** Set up Row Level Security (RLS) policies for all tables
- [x] **1.2.8** Configure Supabase Auth (email/password provider)

#### 1.3 State Management Setup
- [x] **1.3.1** Install Zustand (`npm install zustand`)
- [x] **1.3.2** Install TanStack Query (`npm install @tanstack/react-query`)
- [x] **1.3.3** Create `src/shared/lib/queryClient.ts`
- [x] **1.3.4** Create auth store (`src/features/auth/store.ts`)
- [x] **1.3.5** Create UI store (`src/shared/stores/uiStore.ts`)
- [x] **1.3.6** Set up AsyncStorage persistence for Zustand

#### 1.4 Navigation Structure
- [x] **1.4.1** Install Expo Router (`npm install expo-router`)
- [x] **1.4.2** Configure app.json for Expo Router
- [x] **1.4.3** Create root layout (`src/app/_layout.tsx`)
- [x] **1.4.4** Create auth screens group (`src/app/auth/`)
  - `sign-in.tsx`
  - `sign-up.tsx`
  - `forgot-password.tsx`
- [x] **1.4.5** Create main tabs group (`src/app/(tabs)/`)
  - `_layout.tsx` (tab navigator)
  - `index.tsx` (Home)
  - `facilities.tsx` (placeholder)
  - `history.tsx` (placeholder)
  - `profile.tsx` (placeholder)
- [x] **1.4.6** Implement auth guard in root layout

#### 1.5 Authentication Flow
- [x] **1.5.1** Create `AuthProvider` component with session listener (AuthStateListener in _layout.tsx)
- [x] **1.5.2** Build Sign In screen (email + password inputs, submit button)
- [x] **1.5.3** Build Sign Up screen (email, password, confirm password)
- [x] **1.5.4** Implement sign in logic with Supabase
- [x] **1.5.5** Implement sign up logic with email verification
- [x] **1.5.6** Implement sign out functionality (Profile screen)
- [x] **1.5.7** Add loading states and error handling
- [ ] **1.5.8** Test auth flow on both iOS and Android

#### 1.6 Quick Onboarding (First Launch Only)
- [ ] **1.6.1** Create 30-second intro video explaining core value prop
- [ ] **1.6.2** Build video player modal with skip/close button (X in corner)
- [ ] **1.6.3** Track first launch in AsyncStorage to show only once
- [ ] **1.6.4** Video covers: "Track time → Generate invoice → Get paid"
- [ ] **1.6.5** Optional: Add "Don't show again" checkbox

#### 1.7 Basic UI Components
- [x] **1.7.1** Install React Native Reanimated + Gesture Handler
- [x] **1.7.2** Create design tokens file (`src/constants/colors.ts`, `typography.ts`)
- [x] **1.7.3** Build Button component (primary, secondary, outline, ghost, danger variants)
- [x] **1.7.4** Build Input component (text, password, with label/error states)
- [x] **1.7.5** Build Card component
- [x] **1.7.6** Build LoadingSpinner component
- [x] **1.7.7** Build Toast/notification component (ToastContainer with animations)
- [x] **1.7.8** Implement dark mode toggle and theme provider (toggleTheme in uiStore, used in Profile)

---

### Week 2: Geofencing + Timer

#### 2.0 CRITICAL: Background Location Library Evaluation (Day 1-2)
> **Decision Point**: Before committing to expo-location, evaluate alternatives for battery-conscious tracking

- [ ] **2.0.1** Research TransistorSoft react-native-background-geolocation ($300/yr license)
- [ ] **2.0.2** Test expo-location background tracking on physical device (iOS + Android)
- [ ] **2.0.3** Measure battery drain over 4-hour test (target: <10% drain)
- [ ] **2.0.4** Test behavior when app is force-closed by OS
- [ ] **2.0.5** Document findings and make library decision
- [ ] **2.0.6** If TransistorSoft chosen: Purchase license, configure dev build

**Decision Criteria**:
- Battery drain < 10% over 8-hour shift
- Survives OS battery optimization (Xiaomi, Huawei, Samsung)
- Reliable geofence detection within 60 seconds
- Works when app is backgrounded/locked

#### 2.1 Location Permissions
- [x] **2.1.1** Install expo-location library
- [x] **2.1.2** Install expo-task-manager (for background tasks)
- [ ] **2.1.3** Create permissions request flow UI with explanation modal
- [ ] **2.1.4** Configure iOS Info.plist location usage descriptions
- [ ] **2.1.5** Configure Android permissions in app.json
- [x] **2.1.6** Create location service with permission handling (`src/features/detention/services/locationService.ts`)
- [ ] **2.1.7** Test permissions flow on both platforms
- [ ] **2.1.8** Add battery optimization whitelist prompt for Android

#### 2.2 Database Schema - Detention
- [x] **2.2.1** Create `facilities` table migration
- [x] **2.2.2** Create `detention_events` table migration
- [x] **2.2.3** Create `gps_logs` table migration
- [x] **2.2.4** Set up RLS policies for detention tables
- [ ] **2.2.5** Create database function: `calculate_detention_amount`
- [x] **2.2.6** Seed 5 initial facilities (Amazon, Walmart, Port of LA, BNSF, Costco)

#### 2.3 Geofence Detection
- [x] **2.3.1** Create location service with geofencing (`src/features/detention/services/locationService.ts`)
- [x] **2.3.2** Implement facility proximity detection (Haversine distance calculation)
- [x] **2.3.3** Create geo utilities with tests (`src/features/detention/utils/geoUtils.ts` - 11 tests)
- [ ] **2.3.4** Set up background geofence monitoring task
- [x] **2.3.5** Create arrival detection logic (isInsideGeofence)
- [x] **2.3.6** Create departure detection logic (isInsideGeofence)
- [ ] **2.3.7** Test geofence triggers on physical device

#### 2.4 Detention Timer
- [x] **2.4.1** Create detention store (`src/features/detention/store.ts`)
  - Active detention state
  - Timer state
  - GPS logging state
- [x] **2.4.2** Create `useDetentionTimer` hook with 1-second updates
- [x] **2.4.3** Implement grace period countdown (configurable, default 2 hours)
- [x] **2.4.4** Implement detention timer (starts after grace period)
- [x] **2.4.5** Create TimerDisplay component (HH:MM:SS format)
- [x] **2.4.6** Implement timer persistence (survives app restart) - AsyncStorage with Zustand persist
- [x] **2.4.7** Add "money earned" real-time calculation display
- [x] **2.4.8** Create timer utilities with tests (`src/features/detention/utils/timerUtils.ts` - 17 tests)

#### 2.5 Home Screen - Active Tracking
- [x] **2.5.1** Build StatusCard component (inactive state)
- [x] **2.5.2** Build StatusCard component (active tracking state with timer)
- [x] **2.5.3** Build "Start Tracking" button with timer integration
- [x] **2.5.4** Build "End Detention" button with confirmation dialog
- [ ] **2.5.5** Create facility selection/confirmation modal
- [ ] **2.5.6** Display current location and detected facility
- [ ] **2.5.7** Add manual start option (for GPS fallback)

#### 2.6 GPS Logging
- [x] **2.6.1** Create GPS logging service (useDetentionTracking hook + detention store)
- [x] **2.6.2** Implement 5-minute interval logging during detention
- [x] **2.6.3** Store GPS logs locally (offline support) - pendingGpsLogs in store
- [x] **2.6.4** Implement batch upload to Supabase when online
- [x] **2.6.5** Create offline queue with sync indicator
- [ ] **2.6.6** Test background GPS logging

#### 2.7 Push Notifications (Configurable)
- [ ] **2.7.1** Install expo-notifications
- [ ] **2.7.2** Configure push notification permissions
- [ ] **2.7.3** Implement "Arrived at facility" notification (CRITICAL - always on)
- [ ] **2.7.4** Implement "Grace period ending" notification (CRITICAL - always on)
- [ ] **2.7.5** Implement "Detention started" notification (optional, default on)
- [ ] **2.7.6** Create notification preferences screen in Settings
- [ ] **2.7.7** Store notification preferences in user profile
- [ ] **2.7.8** Test notifications on both platforms

#### 2.8 Offline Sync Architecture
- [x] **2.8.1** Design offline data model (pendingGpsLogs, pendingPhotos in Zustand store)
- [x] **2.8.2** Implement local storage for offline detention events (AsyncStorage with Zustand persist)
- [x] **2.8.3** Create sync queue for pending GPS logs and photos
- [ ] **2.8.4** Implement conflict resolution (last-write-wins with timestamps)
- [ ] **2.8.5** Build sync status indicator in header (shows when syncing/offline)
- [ ] **2.8.6** Add "Still at facility?" popup when offline >30 mins then signal returns
- [ ] **2.8.7** Test 24-hour offline scenario end-to-end

#### 2.9 Evidence Chain & Immutability
- [x] **2.9.1** Add `verification_code` field to detention_events table (migration 002)
- [x] **2.9.2** Generate verification code on event creation (8-char alphanumeric in store)
- [x] **2.9.3** Add `evidence_hash` field - SHA256 of GPS logs + timestamps + photos (migration 002)
- [ ] **2.9.4** Create evidence summary JSON structure (portable proof)
- [x] **2.9.5** Ensure GPS logs have `created_at` timestamps that cannot be backdated
- [ ] **2.9.6** Add EXIF metadata preservation for photos (GPS coords, timestamp)

---

## Phase 2: Core Features (Week 3-4)

### Week 3: Evidence Capture

#### 3.1 Camera Integration
- [ ] **3.1.1** Install expo-camera
- [ ] **3.1.2** Install expo-image-picker (for gallery access)
- [ ] **3.1.3** Create camera screen/modal
- [ ] **3.1.4** Implement photo capture with preview
- [ ] **3.1.5** Add GPS coordinates to photo metadata
- [ ] **3.1.6** Add timestamp watermark to photos
- [ ] **3.1.7** Create photo category selector (dock, BOL, conditions, check-in, other)

#### 3.2 Photo Storage (Cloudflare R2)
- [ ] **3.2.1** Set up Cloudflare R2 bucket
- [ ] **3.2.2** Create Supabase Edge Function for presigned URLs
- [ ] **3.2.3** Create `photos` table migration
- [ ] **3.2.4** Implement direct upload from app to R2
- [ ] **3.2.5** Store photo references in Supabase
- [ ] **3.2.6** Implement offline photo queue
- [ ] **3.2.7** Create photo gallery component for detention detail

#### 3.3 Notes Feature
- [ ] **3.3.1** Add notes field to detention_events table
- [ ] **3.3.2** Create notes input UI (expandable text area)
- [ ] **3.3.3** Implement save notes functionality
- [ ] **3.3.4** Add character limit with counter

#### 3.4 Evidence Binding
- [ ] **3.4.1** Link photos to detention events
- [ ] **3.4.2** Create evidence summary view
- [ ] **3.4.3** Display all evidence on detention detail screen

#### 3.5 Digital Departure Signature (Optional)
- [ ] **3.5.1** Create signature capture component (react-native-signature-canvas)
- [ ] **3.5.2** Add "Request Signature" button on end detention flow
- [ ] **3.5.3** Store signature image with timestamp in event record
- [ ] **3.5.4** Make signature optional (many won't sign, that's okay)
- [ ] **3.5.5** Include signature in PDF invoice when available

---

### Week 4: Invoice Generation & Verification Portal

#### 4.1 Invoice Data Model
- [ ] **4.1.1** Create `invoices` table migration
- [ ] **4.1.2** Implement invoice number generation (sequential)
- [ ] **4.1.3** Link invoices to detention events (support multi-stop)

#### 4.2 PDF Generation with Verification
- [ ] **4.2.1** Install react-native-pdf-lib or expo-print
- [ ] **4.2.2** Install react-native-qrcode-svg for QR code generation
- [ ] **4.2.3** Design invoice PDF template with:
  - Driver info & company branding
  - Facility details with address
  - Arrival/departure times (with timezone)
  - Detention calculation breakdown
  - GPS breadcrumb summary (coordinates list)
  - Photo thumbnails with timestamps
  - **QR code linking to verification portal**
  - **Verification code printed in footer**
- [ ] **4.2.4** Store generated PDFs in Cloudflare R2
- [ ] **4.2.5** Create invoice preview screen
- [ ] **4.2.6** Add "Verified by DwellTime" badge with verification URL

#### 4.3 Verification Portal (Minimal Web)
> **Purpose**: Single-page web endpoint for shippers to verify detention claims
> **URL**: `verify.dwelltime.app/{verification_code}`

- [ ] **4.3.1** Create Next.js or simple static site for verification portal
- [ ] **4.3.2** Deploy to Cloudflare Pages (free, fast)
- [ ] **4.3.3** Build verification lookup page:
  - Input: verification code (8 chars)
  - Output: Event summary (facility, times, duration, amount)
- [ ] **4.3.4** Display GPS breadcrumb trail on map
- [ ] **4.3.5** Display photo thumbnails (click to enlarge)
- [ ] **4.3.6** Show "Evidence recorded at [timestamp]" for each data point
- [ ] **4.3.7** Add "This detention event was verified by DwellTime" badge
- [ ] **4.3.8** Mobile-responsive design (shippers may check on phone)
- [ ] **4.3.9** Rate limit to prevent scraping (10 requests/min per IP)

#### 4.4 Invoice Customization
- [ ] **4.4.1** Add hourly rate setting to user profile
- [ ] **4.4.2** Add grace period setting to user profile
- [ ] **4.4.3** Add company name/logo upload
- [ ] **4.4.4** Add custom terms/notes field
- [ ] **4.4.5** Create invoice settings screen in Profile

#### 4.5 Invoice Delivery
- [ ] **4.5.1** Implement email sending (via Supabase Edge Function)
- [ ] **4.5.2** Implement "Save to Device" (PDF download)
- [ ] **4.5.3** Implement "Share" (system share sheet)
- [ ] **4.5.4** Add sent confirmation with timestamp
- [ ] **4.5.5** Track invoice status (draft, sent, paid)

#### 4.6 Detention Summary Screen
- [ ] **4.6.1** Build post-detention summary layout
- [ ] **4.6.2** Display detention stats (time, amount, facility)
- [ ] **4.6.3** Show evidence thumbnails
- [ ] **4.6.4** Add "Generate Invoice" CTA
- [ ] **4.6.5** Add "Rate Facility" CTA
- [ ] **4.6.6** Display verification code prominently (for driver reference)

---

## Phase 3: Intelligence + Polish (Week 5-6)

### Week 5: Facility Intelligence

#### 5.1 Facility Search
- [ ] **5.1.1** Create facility search API endpoint
- [ ] **5.1.2** Build search screen with input
- [ ] **5.1.3** Implement search by name/address
- [ ] **5.1.4** Implement proximity search (nearby facilities)
- [ ] **5.1.5** Create facility list item component
- [ ] **5.1.6** Add caching with Upstash Redis (set up account)

#### 5.2 Facility Detail
- [ ] **5.2.1** Build facility detail screen
- [ ] **5.2.2** Display aggregate ratings (overall + categories)
- [ ] **5.2.3** Display average wait times (pickup vs delivery)
- [ ] **5.2.4** Display amenities list with icons
- [ ] **5.2.5** Show recent reviews
- [ ] **5.2.6** Add "Get Directions" button (open maps app)

#### 5.3 Rating System
- [ ] **5.3.1** Create `facility_reviews` table (if not exists)
- [ ] **5.3.2** Build rating submission screen
- [ ] **5.3.3** Implement 5-star overall rating
- [ ] **5.3.4** Implement category ratings (wait time, staff, restrooms, parking, safety, cleanliness)
- [ ] **5.3.5** Add optional text review
- [ ] **5.3.6** Create rating prompt after ending detention
- [ ] **5.3.7** Update facility aggregates on new review (trigger)

#### 5.4 Map View
- [ ] **5.4.1** Install react-native-maps
- [ ] **5.4.2** Configure Google Maps API key
- [ ] **5.4.3** Build map view for facility search
- [ ] **5.4.4** Display facility markers with rating colors
- [ ] **5.4.5** Implement marker tap to show facility info

---

### Week 6: Payments + Polish

#### 6.1 Stripe Integration
- [ ] **6.1.1** Create Stripe account and get API keys
- [ ] **6.1.2** Install Stripe React Native SDK
- [ ] **6.1.3** Create Supabase Edge Functions for Stripe webhooks
- [ ] **6.1.4** Implement subscription tiers (Free, Pro $29/mo)
- [ ] **6.1.5** Build subscription screen
- [ ] **6.1.6** Implement paywall for Pro features
- [ ] **6.1.7** Handle subscription status changes

#### 6.2 History Screen
- [ ] **6.2.1** Build detention history list
- [ ] **6.2.2** Implement filters (date range, status, facility)
- [ ] **6.2.3** Display summary stats (total hours, total earned)
- [ ] **6.2.4** Create event detail view
- [ ] **6.2.5** Implement CSV export
- [ ] **6.2.6** Add search functionality

#### 6.3 Profile Screen
- [ ] **6.3.1** Build profile overview
- [ ] **6.3.2** Add account settings section
- [ ] **6.3.3** Add detention settings section
- [ ] **6.3.4** Add invoice customization section
- [ ] **6.3.5** Add appearance toggle (light/dark mode)
- [ ] **6.3.6** Add subscription management
- [ ] **6.3.7** Add sign out button

#### 6.4 UI Polish
- [ ] **6.4.1** Audit all screens for consistency
- [ ] **6.4.2** Add loading skeletons
- [ ] **6.4.3** Add empty states with illustrations
- [ ] **6.4.4** Implement pull-to-refresh everywhere
- [ ] **6.4.5** Add haptic feedback for key actions
- [ ] **6.4.6** Test dark mode on all screens
- [ ] **6.4.7** Verify accessibility (contrast, touch targets)

#### 6.5 Bug Fixes & Performance
- [ ] **6.5.1** Profile app performance
- [ ] **6.5.2** Optimize list rendering (FlashList)
- [ ] **6.5.3** Fix any crash reports
- [ ] **6.5.4** Memory leak audit
- [ ] **6.5.5** Test offline functionality end-to-end

---

## Phase 4: Launch (Week 7-8)

### Week 7: Beta Testing

#### 7.1 Build Preparation
- [ ] **7.1.1** Set up EAS Build
- [ ] **7.1.2** Configure iOS build (create Apple Developer account if needed)
- [ ] **7.1.3** Configure Android build
- [ ] **7.1.4** Create production Supabase environment
- [ ] **7.1.5** Set up production environment variables
- [ ] **7.1.6** Generate iOS TestFlight build
- [ ] **7.1.7** Generate Android APK/AAB

#### 7.2 Beta Distribution
- [ ] **7.2.1** Upload to TestFlight
- [ ] **7.2.2** Distribute Android APK to testers
- [ ] **7.2.3** Recruit 10+ beta testers (trucking community)
- [ ] **7.2.4** Create feedback collection form
- [ ] **7.2.5** Set up crash reporting (Sentry)

#### 7.3 Beta Feedback Integration
- [ ] **7.3.1** Collect feedback for 5-7 days
- [ ] **7.3.2** Prioritize critical bugs
- [ ] **7.3.3** Implement high-priority fixes
- [ ] **7.3.4** Second beta build if needed

---

### Week 8: Public Launch

#### 8.1 App Store Submission
- [ ] **8.1.1** Prepare App Store screenshots (6 screens)
- [ ] **8.1.2** Write App Store description
- [ ] **8.1.3** Create app preview video (optional)
- [ ] **8.1.4** Submit to Apple App Store Review
- [ ] **8.1.5** Submit to Google Play Store

#### 8.2 Landing Page
- [ ] **8.2.1** Create landing page (Carrd, Framer, or custom)
- [ ] **8.2.2** Set up email capture for waitlist
- [ ] **8.2.3** Add links to app stores

#### 8.3 Launch Marketing
- [ ] **8.3.1** Post to trucker Facebook groups
- [ ] **8.3.2** Reach out to trucking YouTubers
- [ ] **8.3.3** Create launch announcement post
- [ ] **8.3.4** Set up basic analytics tracking

---

## Critical Files Reference

| Category | Key Files |
|----------|-----------|
| **Entry** | `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx` |
| **Auth** | `src/features/auth/`, `src/shared/lib/supabase.ts` |
| **Detention** | `src/features/detention/store.ts`, `src/features/detention/hooks/` |
| **Facilities** | `src/features/facilities/` |
| **Invoices** | `src/features/invoices/` |
| **UI** | `src/shared/components/`, `src/constants/colors.ts` |
| **Verification Portal** | `verify-portal/` (separate Next.js/static site) |
| **Config** | `app.json`, `tsconfig.json`, `.env` |

---

## Verification Checklist (End of Each Phase)

### After Phase 1 (Week 2)
- [ ] User can sign up, sign in, sign out
- [x] Timer logic implemented with grace period (tests passing)
- [x] Geofence detection logic implemented (tests passing)
- [ ] App detects when user enters known facility geofence (live test)
- [ ] GPS coordinates logged every 5 minutes during detention
- [ ] App works in background (timer continues)
- [ ] Test on both iOS Simulator and Android Emulator

### After Phase 2 (Week 4)
- [ ] User can capture photos with GPS/timestamp
- [ ] Photos upload and display in detention detail
- [ ] Professional PDF invoice generates with all data
- [ ] **PDF includes QR code and verification code**
- [ ] Invoice can be emailed or saved
- [ ] **Verification portal live at verify.dwelltime.app**
- [ ] **Shipper can enter code and see GPS breadcrumb + photos**
- [ ] Test invoice with real detention data
- [ ] Digital signature capture works (optional feature)

### After Phase 3 (Week 6)
- [ ] Facility search returns results
- [ ] Facility detail shows ratings and amenities
- [ ] User can submit rating after detention
- [ ] Stripe payment flow works
- [ ] Pro features locked behind paywall
- [ ] History shows all past detentions with filters

### After Phase 4 (Week 8)
- [ ] Beta testers successfully tracked detention
- [ ] No critical crashes in Sentry
- [ ] App approved in both app stores
- [ ] Landing page live with store links

---

## Dependencies & External Accounts Needed

| Service | Purpose | Setup Priority |
|---------|---------|----------------|
| **Supabase** | Auth, Database, Edge Functions | Week 1 |
| **Apple Developer** | iOS builds, TestFlight, App Store | Week 1 |
| **Google Play Console** | Android distribution | Week 1 |
| **Cloudflare** | R2 storage, CDN, **Pages (verification portal)** | Week 3-4 |
| **Upstash** | Redis caching | Week 5 |
| **Stripe** | Payments | Week 6 |
| **Google Cloud** | Maps API | Week 5 |
| **Sentry** | Error tracking | Week 7 |
| **EAS** | Expo builds | Week 7 |

---

## Appendix A: Pre-Launch Checklist (Week 8)

### Technical Requirements
- [ ] App tested on iOS 15+ and Android 10+
- [ ] Background GPS tracking battery usage < 10% per day
- [ ] Crash-free rate > 99.5%
- [ ] API response times < 500ms
- [ ] Offline mode tested for 24+ hours

### Legal & Compliance
- [ ] Privacy policy published (location tracking disclosed)
- [ ] Terms of service finalized
- [ ] GDPR and CCPA compliance review
- [ ] Data retention policy documented (GPS logs, photos)
- [ ] App Store location permission justification prepared

### Marketing Assets
- [ ] App Store screenshots (6 screens, iPhone + Android)
- [ ] App Store description and keywords
- [ ] Landing page live at dwelltime.app
- [ ] Social media accounts created
- [ ] Press kit prepared (logo, screenshots, founder bio)

---

## Appendix B: Launch Day Plan

### Hour-by-Hour
- **6 AM**: Verify app live in both stores
- **8 AM**: Post launch announcement in 10+ trucking Facebook groups
- **9 AM**: Email beta testers with thank you + store links
- **10 AM**: Activate Sentry monitoring, set up alerts
- **12 PM**: First metrics check (downloads, signups, crashes)
- **6 PM**: End-of-day metrics review
- **Ongoing**: Respond to user support within 2 hours

### First Week
- Daily metrics review (signups, events, crashes, feedback)
- Monitor App Store reviews, respond to all
- Bug triage: Critical = same day, High = 48 hours

---

## Appendix C: Success Metrics with Thresholds

| Metric | Target | Critical Threshold (Red Line) |
|--------|--------|-------------------------------|
| Month 1 Active Users | 200 | 100 minimum |
| Month 1 Detention Events | 500 | 250 minimum |
| Month 3 Paid Conversion | 15% | 10% minimum |
| Crash-free Rate | 99.5% | 99% minimum |
| GPS Accuracy Rate | 95% | 90% minimum |
| Invoice Generation Success | 98% | 95% minimum |
| Week 1 Retention | 40% | 25% minimum |
| NPS Score | 50+ | 30 minimum |

---

## Appendix D: Leading Indicators

Early signals that predict long-term success:

| Indicator | Target | Why It Matters |
|-----------|--------|----------------|
| **Week 1 Retention** | >40% | Users who return within 7 days = sticky product |
| **Facility Review Rate** | >30% | % of events followed by review = engaged users |
| **Repeat Event Tracking** | >6/month | Avg events per user = core value delivery |
| **Referral Rate** | >20% | Users who share invoices/invite = organic growth |

---

## Appendix E: Year 1 Success Definition

DwellTime is successful if, by end of Year 1, we have:

- [ ] 3,500 active users (500 paid)
- [ ] $150,000 ARR
- [ ] $5 million in documented detention fees
- [ ] 10,000+ facilities in database with verified data
- [ ] Positive unit economics (LTV > 3x CAC)
- [ ] < 5% monthly churn rate
- [ ] NPS score > 50

---

## Appendix F: Configuration Defaults

| Setting | Default Value | User Configurable |
|---------|---------------|-------------------|
| Grace Period | 120 minutes | Yes |
| Hourly Rate | $75/hr | Yes |
| Geofence Radius | 200m | Yes (100-500m) |
| GPS Log Interval | 5 minutes | No |
| Photo Limit (Free) | 5 per event | No |
| Photo Limit (Pro) | 10 per event | No |
| Free Tier Events | 3 per month | No |

---

## Appendix G: Voice Commands (MVP Scope)

Basic voice commands for hands-free operation:

| Command | Action |
|---------|--------|
| "Hey DwellTime, start tracking" | Begin detention at current location |
| "Hey DwellTime, stop tracking" | End current detention event |
| "Hey DwellTime, take photo" | Open camera for evidence capture |
| "Hey DwellTime, how much?" | Speak current detention value |

**Implementation**: Use expo-speech for text-to-speech, react-native-voice for recognition

---

*Plan Version: 1.2*
*Created: January 10, 2026*
*Updated: January 10, 2026 - Added Verification Portal & Evidence Chain for credibility*
*Status: In Progress*

---

## New in v1.2: Credibility & Verification Layer

Added to address the critical question: "How does a driver prove detention to a shipper?"

### Key Additions:
1. **Evidence Chain (2.9)** - Immutable verification codes, evidence hashing, timestamp integrity
2. **Digital Signature (3.5)** - Optional departure signature capture
3. **Verification Portal (4.3)** - Single-page web at `verify.dwelltime.app/{code}`
4. **QR Code on Invoice (4.2)** - Shipper can scan to verify instantly

This provides **trustless verification** - shippers don't need to trust the driver's word, they can independently verify the GPS trail and photos.
