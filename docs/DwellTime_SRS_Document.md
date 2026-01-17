# DwellTime: Software Requirements Specification

> **Architecture**: Mobile-first React Native + Expo with Supabase backend

---

## System Design

### High-Level System Overview (Hybrid Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   iOS App       │  │   Android App   │  │   Web Dashboard │  │
│  │   (Expo)        │  │   (Expo)        │  │   (Next.js)     │  │
│  │                 │  │                 │  │   [Phase 2]     │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│           └────────────────────┼────────────────────┘           │
│                                │                                │
│                    ┌───────────┴────────────┐                    │
│                    │   Supabase Client     │                    │
│                    │   (SDK + TanStack)    │                    │
│                    └───────────┬────────────┘                    │
├────────────────────────────────┼────────────────────────────────┤
                                 │
                                 │ HTTPS / WebSocket
                                 │
├────────────────────────────────┼────────────────────────────────┤
│                    SUPABASE (Auth + DB + API)                   │
├────────────────────────────────┼────────────────────────────────┤
│                    ┌───────────┴────────────┐                    │
│                    │      Supabase         │                    │
│                    │     ($25/mo Pro)      │                    │
│                    └───────────┬────────────┘                    │
│                                │                                │
│  ┌──────────────┬──────────────┼──────────────┬─────────────┐  │
│  │              │              │              │              │  │
│  ▼              ▼              ▼              ▼              ▼  │
│ ┌────┐      ┌────────┐    ┌─────────┐    ┌─────────┐   ┌──────┐ │
│ │Auth│      │Postgres│    │Realtime │    │Edge     │   │Auto  │ │
│ │    │      │   DB   │    │(WebSock)│    │Functions│   │API   │ │
│ └────┘      └────────┘    └─────────┘    └─────────┘   └──────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│                         CLOUDFLARE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │       R2        │  │      CDN        │  │      DNS        │  │
│  │  (Object Store) │  │  (Edge Cache)   │  │   (Routing)     │  │
│  │                 │  │                 │  │                 │  │
│  │  • Photos       │  │  • Facility     │  │  • Domain       │  │
│  │  • Invoice PDFs │  │    ratings      │  │  • SSL          │  │
│  │  • GPS archives │  │  • Static       │  │                 │  │
│  │                 │  │    assets       │  │                 │  │
│  │  $0 EGRESS      │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│                       UPSTASH REDIS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Serverless Redis                       │    │
│  │                   (Pay-per-request)                     │    │
│  │                                                         │    │
│  │  • Facility rating cache (TTL: 5 min)                   │    │
│  │  • Active detention state (hot data)                    │    │
│  │  • Rate limiting                                        │    │
│  │  • Session cache                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Google Maps │  │   Stripe    │  │ Expo Push   │              │
│  │     API     │  │  Payments   │  │   Service   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Why Hybrid Architecture?

| Component | Service | Why Not All-Supabase? |
|-----------|---------|----------------------|
| **Auth** | Supabase | Built-in, secure, no extra work |
| **Database** | Supabase Postgres | Relational data, PostGIS, RLS |
| **Photo Storage** | Cloudflare R2 | **$0 egress** vs Supabase $0.09/GB |
| **Cache** | Upstash Redis | Serverless, cheaper than always-on |
| **CDN** | Cloudflare | Free tier, edge caching |

**Cost Savings at Scale:**
```
10,000 users, 2TB photos, moderate reads:

Supabase Storage:  $42/mo storage + $180/mo egress = $222/mo
Cloudflare R2:     $30/mo storage + $0 egress      = $30/mo
                                            SAVINGS: $192/mo
```

### Core System Components

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| Mobile App | React Native + Expo | UI, offline support, GPS tracking, camera |
| State Management | Zustand + TanStack Query | Local state, server state, caching |
| Navigation | Expo Router | File-based routing, deep linking |
| Backend API | Supabase (auto-generated) | REST endpoints, RLS policies |
| Database | Supabase Postgres | Core data, GPS logs, events, users |
| Authentication | Supabase Auth | Email/password, sessions, JWT |
| File Storage | **Cloudflare R2** | Photos, PDFs (zero egress) |
| Cache Layer | **Upstash Redis** | Facility ratings, hot data, sessions |
| Realtime | Supabase Realtime | Live timer sync (fleet view - Phase 2) |
| Edge Functions | Supabase Edge Functions | PDF generation, email, geocoding |
| CDN | **Cloudflare** | Static assets, facility data cache |
| Push Notifications | Expo Push | Geofence alerts, reminders |
| Maps/Geocoding | Google Maps API | Facility lookup, geofencing |
| Payments | Stripe | Subscriptions |

### Data Storage Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HOT (Redis)              WARM (Postgres)       COLD (R2)       │
│  ──────────              ───────────────       ─────────       │
│  • Active detentions      • All events          • GPS archives  │
│  • Facility cache         • All reviews         • Old invoices  │
│  • User sessions          • GPS logs (<90d)     • Backups       │
│  • Rate limiting          • User profiles       • Audit logs    │
│                                                                 │
│  TTL: 5min-24hr           Retention: 90 days    Retention: 7yrs │
│  Access: <5ms             Access: <50ms         Access: <500ms  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ARCHIVAL JOBS (Supabase Edge Function, weekly)                 │
│                                                                 │
│  • GPS logs > 90 days → compress → upload to R2 as Parquet      │
│  • Invoice PDFs always stored in R2 (never Postgres)            │
│  • Photos uploaded directly to R2 via presigned URLs            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Pattern

### Pattern: Feature-Based Modular Architecture

```
src/
├── app/                      # Expo Router (file-based routes)
│   ├── (tabs)/               # Tab navigator group
│   │   ├── index.tsx         # Home tab
│   │   ├── facilities.tsx    # Facilities tab
│   │   ├── history.tsx       # History tab
│   │   └── profile.tsx       # Profile tab
│   ├── detention/
│   │   ├── [id].tsx          # Detention detail
│   │   └── active.tsx        # Active detention screen
│   ├── facility/
│   │   └── [id].tsx          # Facility detail
│   ├── invoice/
│   │   └── [id].tsx          # Invoice preview
│   └── _layout.tsx           # Root layout
│
├── features/                 # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── store.ts
│   ├── detention/
│   │   ├── components/
│   │   │   ├── DetentionTimer.tsx
│   │   │   ├── DetentionCard.tsx
│   │   │   └── EvidenceCapture.tsx
│   │   ├── hooks/
│   │   │   ├── useDetentionTimer.ts
│   │   │   ├── useGeofence.ts
│   │   │   └── useDetentionMutations.ts
│   │   ├── services/
│   │   │   └── detentionService.ts
│   │   └── store.ts
│   ├── facilities/
│   ├── invoices/
│   └── profile/
│
├── shared/                   # Shared utilities
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── hooks/                # Shared hooks
│   │   ├── useLocation.ts
│   │   └── useNotifications.ts
│   ├── lib/                  # Utilities
│   │   ├── supabase.ts       # Supabase client
│   │   ├── queryClient.ts    # TanStack Query client
│   │   └── storage.ts        # Async storage helpers
│   └── types/                # TypeScript types
│       └── database.ts       # Generated Supabase types
│
├── constants/                # App constants
│   ├── colors.ts
│   └── config.ts
│
└── assets/                   # Static assets
    ├── images/
    └── fonts/
```

### Key Architecture Principles

- **Feature Isolation**: Each feature is self-contained with its own components, hooks, services, and state
- **Shared Components**: Common UI components live in `shared/components`
- **Colocation**: Related code stays together (component + hook + service)
- **Type Safety**: Full TypeScript with generated Supabase types
- **Offline-First**: TanStack Query caching + Zustand persistence

---

## State Management

### State Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STATE LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    SERVER STATE                         │    │
│  │                  (TanStack Query)                       │    │
│  │                                                         │    │
│  │  • Detention events from Supabase                       │    │
│  │  • Facility data and ratings                            │    │
│  │  • User profile and settings                            │    │
│  │  • Invoice history                                      │    │
│  │                                                         │    │
│  │  Features: Caching, background refetch, optimistic      │    │
│  │  updates, offline persistence                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CLIENT STATE                         │    │
│  │                     (Zustand)                           │    │
│  │                                                         │    │
│  │  • Active detention timer state                         │    │
│  │  • Current GPS coordinates                              │    │
│  │  • UI state (modals, toasts)                            │    │
│  │  • Offline queue (pending uploads)                      │    │
│  │  • Theme preference (light/dark)                        │    │
│  │                                                         │    │
│  │  Features: Persist to AsyncStorage, subscribe to        │    │
│  │  slices, computed values                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    LOCAL STATE                          │    │
│  │                 (React useState)                        │    │
│  │                                                         │    │
│  │  • Form inputs                                          │    │
│  │  • Component-specific UI state                          │    │
│  │  • Ephemeral state (hover, focus)                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Zustand Store Structure

```typescript
// stores/detentionStore.ts
interface DetentionState {
  // Active detention state
  activeDetention: {
    id: string | null;
    facilityId: string | null;
    facilityName: string | null;
    arrivalTime: Date | null;
    gracePeriodEnd: Date | null;
    detentionStart: Date | null;
    isInGracePeriod: boolean;
    isTracking: boolean;
  };

  // GPS state
  currentLocation: {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: Date;
  } | null;

  // Offline queue
  pendingUploads: {
    photos: PendingPhoto[];
    gpsLogs: PendingGpsLog[];
  };

  // Actions
  startTracking: (facility: Facility) => void;
  endTracking: () => void;
  updateLocation: (location: Location) => void;
  addPendingPhoto: (photo: PendingPhoto) => void;
  syncPendingUploads: () => Promise<void>;
}

// stores/uiStore.ts
interface UIState {
  theme: 'light' | 'dark' | 'system';
  isOnline: boolean;
  activeModal: string | null;
  toast: ToastMessage | null;

  setTheme: (theme: Theme) => void;
  showToast: (message: ToastMessage) => void;
  dismissToast: () => void;
}

// stores/authStore.ts
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

### TanStack Query Keys Structure

```typescript
// Query key factory
export const queryKeys = {
  // User
  user: ['user'] as const,
  userSettings: ['user', 'settings'] as const,

  // Detention
  detentions: ['detentions'] as const,
  detentionsList: (filters: DetentionFilters) =>
    ['detentions', 'list', filters] as const,
  detentionDetail: (id: string) =>
    ['detentions', 'detail', id] as const,
  activeDetention: ['detentions', 'active'] as const,

  // Facilities
  facilities: ['facilities'] as const,
  facilitySearch: (query: string) =>
    ['facilities', 'search', query] as const,
  facilityDetail: (id: string) =>
    ['facilities', 'detail', id] as const,
  facilityReviews: (id: string) =>
    ['facilities', 'reviews', id] as const,

  // Invoices
  invoices: ['invoices'] as const,
  invoiceDetail: (id: string) =>
    ['invoices', 'detail', id] as const,
};
```

---

## Data Flow

### Detention Tracking Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    DETENTION TRACKING FLOW                       │
└──────────────────────────────────────────────────────────────────┘

1. GEOFENCE DETECTION
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  expo-      │────▶│  Geofence   │────▶│   Push      │
   │  location   │     │  Service    │     │   Notif     │
   └─────────────┘     └─────────────┘     └─────────────┘
         │                                        │
         │                                        ▼
         │                              ┌─────────────────┐
         │                              │ "Arrived at     │
         │                              │  [Facility]"    │
         │                              └────────┬────────┘
         │                                       │
         ▼                                       ▼
2. USER CONFIRMS ARRIVAL
   ┌─────────────────────────────────────────────────────────┐
   │                    HOME SCREEN                      │
   │  ┌─────────────────────────────────────────────────┐  │
   │  │  You've arrived at Walmart DC #4523           │  │
   │  │  [ Start Tracking ]  [ Not Here ]             │  │
   │  └─────────────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────────────┘
         │
         │ User taps "Start Tracking"
         ▼
3. CREATE DETENTION RECORD
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Zustand    │────▶│  TanStack   │────▶│  Supabase   │
   │  (local)    │     │  Mutation   │     │  INSERT     │
   └─────────────┘     └─────────────┘     └─────────────┘
         │
         │ Optimistic update
         ▼
4. GRACE PERIOD COUNTDOWN
   ┌─────────────────────────────────────────────────────────┐
   │                 ACTIVE TRACKING                     │
   │  ┌─────────────────────────────────────────────────┐  │
   │  │  Grace Period: 01:45:32 remaining             │  │
   │  │  Walmart DC #4523                             │  │
   │  └─────────────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────────────┘
         │
         │ Timer expires (2 hours)
         ▼
5. DETENTION BEGINS
   ┌─────────────┐     ┌─────────────┐
   │  Update     │────▶│  Push       │
   │  Supabase   │     │  Notif      │
   └─────────────┘     └─────────────┘
         │
         ▼
6. GPS LOGGING (every 5 min)
   ┌─────────────────────────────────────────────────────────┐
   │            BACKGROUND TASK (expo-task-manager)      │
   │                                                     │
   │   ┌─────────┐    ┌─────────┐    ┌─────────────┐    │
   │   │  Get    │───▶│  Queue  │───▶│  Batch      │    │
   │   │  GPS    │    │  Local  │    │  Upload     │    │
   │   └─────────┘    └─────────┘    └─────────────┘    │
   └─────────────────────────────────────────────────────────┘
         │
         │ User ends detention
         ▼
7. SUMMARY & INVOICE
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Calculate  │────▶│  Show       │────▶│  Generate   │
   │  Total      │     │  Summary    │     │  Invoice    │
   └─────────────┘     └─────────────┘     └─────────────┘
```

### Offline Data Sync Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      OFFLINE SYNC FLOW                           │
└──────────────────────────────────────────────────────────────────┘

1. ACTION WHILE OFFLINE
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  User       │────▶│  Zustand    │────▶│  AsyncStorage│
   │  Action     │     │  Store      │     │  Persist    │
   └─────────────┘     └─────────────┘     └─────────────┘
                             │
                             │ Add to pending queue
                             ▼
                       ┌─────────────┐
                       │  Pending    │
                       │  Queue      │
                       │  [photo1,   │
                       │   gps1,     │
                       │   gps2...]  │
                       └─────────────┘

2. CONNECTION RESTORED
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  NetInfo    │────▶│  Sync       │────▶│  Process    │
   │  Event      │     │  Trigger    │     │  Queue      │
   └─────────────┘     └─────────────┘     └─────────────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │  Supabase   │
                                          │  Batch      │
                                          │  Insert     │
                                          └─────────────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │  Clear      │
                                          │  Queue      │
                                          └─────────────┘
```

---

## Technical Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Bun | 1.0+ | Local development, scripts |
| **Language** | TypeScript | 5.0+ | Type safety |
| **Mobile Framework** | React Native | 0.73+ | Cross-platform mobile |
| **Development Platform** | Expo | SDK 50+ | Build tooling, native APIs |
| **Routing** | Expo Router | 3.0+ | File-based navigation |
| **Server State** | TanStack Query | 5.0+ | API caching, sync |
| **Client State** | Zustand | 4.5+ | Local state management |
| **Backend** | Supabase | Latest | Auth, DB, Edge Functions |
| **Database** | PostgreSQL | 15+ | Via Supabase |
| **Edge Functions** | Deno | Latest | Via Supabase |
| **Cache** | Upstash Redis | Latest | Serverless caching |
| **Object Storage** | Cloudflare R2 | Latest | Photos, PDFs |

### Hybrid Architecture Services

| Service | Purpose | Pricing | Why Chosen |
|---------|---------|---------|------------|
| **Supabase** | Auth + Postgres + Edge Functions | $25/mo (Pro) | Built-in auth, Postgres, fast to ship |
| **Cloudflare R2** | Photo & PDF storage | ~$0.015/GB + $0 egress | Zero egress fees |
| **Upstash Redis** | Caching, rate limiting | Pay-per-request (~$10/mo) | Serverless, no idle costs |
| **Cloudflare CDN** | Edge caching, DNS | Free | Global distribution |

### Estimated Monthly Costs

| Scale | Supabase | R2 | Upstash | Total |
|-------|----------|-----|---------|-------|
| 500 users | $25 | $2 | $0 | **~$27/mo** |
| 1,000 users | $25 | $5 | $5 | **~$35/mo** |
| 5,000 users | $25 | $20 | $10 | **~$55/mo** |
| 10,000 users | $75 | $40 | $15 | **~$130/mo** |

### Mobile-Specific Libraries

| Library | Purpose |
|---------|---------|
| expo-location | GPS, geofencing |
| expo-task-manager | Background tasks |
| expo-camera | Photo capture |
| expo-file-system | Local file handling |
| expo-notifications | Push notifications |
| expo-secure-store | Secure credential storage |
| expo-image | Optimized image display |
| react-native-maps | Map display |
| @react-native-async-storage/async-storage | Persistent storage |
| react-native-reanimated | Animations |
| react-native-gesture-handler | Touch gestures |

### Storage Integration Libraries

| Library | Purpose |
|---------|---------|
| @supabase/supabase-js | Supabase client (auth, db, functions) |
| @upstash/redis | Redis client for caching |
| aws4fetch | S3-compatible R2 uploads (signed URLs) |

### Development Tools

| Tool | Purpose |
|------|---------|
| Cursor | AI-assisted IDE |
| Claude Code (Opus 4.5) | AI pair programming |
| Bun | Package management, scripts |
| EAS Build | Cloud builds for iOS/Android |
| EAS Submit | App store submissions |
| Supabase CLI | Local development, migrations |
| Wrangler | Cloudflare R2 management |
| TypeScript | Type checking |
| ESLint + Prettier | Code quality |

### External Services

| Service | Purpose | Tier |
|---------|---------|------|
| Supabase | Auth, Database, Edge Functions | Free → Pro ($25/mo) |
| Cloudflare R2 | Object storage | Pay as you go |
| Upstash Redis | Serverless cache | Pay as you go |
| Expo EAS | Build & submit | Free → Production |
| Google Maps Platform | Geocoding, maps | Pay as you go |
| Stripe | Payments | Pay as you go |
| Sentry | Error tracking | Free → Team |

### Environment Variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # Server-side only

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=dwelltime-uploads
R2_PUBLIC_URL=https://uploads.dwelltime.app

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# External Services
GOOGLE_MAPS_API_KEY=xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PUBLISHABLE_KEY=pk_xxx
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx

# App Config
EXPO_PUBLIC_APP_ENV=development|staging|production
```

---

## Authentication Process

### Auth Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
└──────────────────────────────────────────────────────────────────┘

1. APP LAUNCH
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  App        │────▶│  Check      │────▶│  Session    │
   │  Start      │     │  Session    │     │  Valid?     │
   └─────────────┘     └─────────────┘     └───────┬─────┘
                                                  │
                              ┌───────────────────┴───────────────┐
                              │                                     │
                              ▼                                     ▼
                       ┌─────────────┐                       ┌─────────────┐
                       │    YES      │                       │    NO       │
                       │  Go to Home │                       │  Go to Auth │
                       └─────────────┘                       └─────────────┘

2. SIGN UP FLOW
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Email +    │────▶│  Supabase   │────▶│  Email      │
   │  Password   │     │  signUp()   │     │  Confirm    │
   └─────────────┘     └─────────────┘     └─────────────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │  User       │
                                           │  Verified   │
                                           └─────────────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │  Create     │
                                           │  Profile    │
                                           └─────────────┘

3. SIGN IN FLOW
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Email +    │────▶│  Supabase   │────▶│  Store      │
   │  Password   │     │  signIn()   │     │  Session    │
   └─────────────┘     └─────────────┘     └─────────────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │  Redirect   │
                                           │  to Home    │
                                           └─────────────┘

4. SESSION REFRESH
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Token      │────▶│  Supabase   │────▶│  New        │
   │  Expired    │     │  refresh()  │     │  Token      │
   └─────────────┘     └─────────────┘     └─────────────┘

5. SIGN OUT
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  User       │────▶│  Clear      │────▶│  Redirect   │
   │  Sign Out   │     │  Session    │     │  to Auth    │
   └─────────────┘     └─────────────┘     └─────────────┘
```

### Auth Implementation

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Protected Routes

```typescript
// app/_layout.tsx
export default function RootLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      {session ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="auth" />
      )}
    </Stack>
  );
}
```

---

## Route Design

### Expo Router File Structure

```
app/
├── _layout.tsx                 # Root layout (auth check)
├── index.tsx                   # Redirect based on auth
│
├── auth/                       # Auth screens (unauthenticated)
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── forgot-password.tsx
│   └── verify-email.tsx
│
├── (tabs)/                     # Main app (authenticated)
│   ├── _layout.tsx             # Tab navigator
│   ├── index.tsx               # Home tab
│   ├── facilities/
│   │   ├── index.tsx           # Search/list
│   │   └── [id].tsx            # Facility detail
│   ├── history/
│   │   ├── index.tsx           # Events list
│   │   └── [id].tsx            # Event detail
│   └── profile/
│       ├── index.tsx           # Profile main
│       ├── settings.tsx        # App settings
│       ├── detention-settings.tsx
│       ├── invoice-settings.tsx
│       └── subscription.tsx
│
├── detention/                  # Detention flows (modals/stacks)
│   ├── active.tsx              # Active detention screen
│   ├── summary/[id].tsx        # Post-detention summary
│   ├── evidence/[id].tsx       # Add evidence
│   └── confirm-end.tsx         # End confirmation modal
│
├── invoice/
│   ├── preview/[id].tsx        # Invoice preview
│   ├── customize/[id].tsx      # Edit before send
│   └── send/[id].tsx           # Send options
│
├── rating/
│   └── [facilityId].tsx        # Rate facility
│
└── onboarding/                 # First-time user flow
    ├── _layout.tsx
    ├── welcome.tsx
    ├── permissions.tsx         # Location permission
    └── profile-setup.tsx
```

### Route Table

| Route | Screen | Auth | Description |
|-------|--------|------|-------------|
| `/auth/sign-in` | SignIn | No | Email/password login |
| `/auth/sign-up` | SignUp | No | Create account |
| `/(tabs)` | TabNavigator | Yes | Main app container |
| `/(tabs)/` | Home | Yes | Dashboard, active status |
| `/(tabs)/facilities` | FacilitySearch | Yes | Search facilities |
| `/(tabs)/facilities/[id]` | FacilityDetail | Yes | Facility ratings/reviews |
| `/(tabs)/history` | HistoryList | Yes | Past detentions |
| `/(tabs)/history/[id]` | DetentionDetail | Yes | Single event details |
| `/(tabs)/profile` | Profile | Yes | User settings |
| `/detention/active` | ActiveDetention | Yes | Live tracking view |
| `/detention/summary/[id]` | Summary | Yes | Post-detention summary |
| `/invoice/preview/[id]` | InvoicePreview | Yes | View invoice |
| `/rating/[facilityId]` | RateFacility | Yes | Submit rating |

### Deep Linking

```typescript
// app.json
{
  "expo": {
    "scheme": "dwelltime",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "dwelltime" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}

// Deep link examples:
// dwelltime://facilities/abc123
// dwelltime://detention/active
// dwelltime://invoice/xyz789
```

---

## API Design

### Supabase Auto-Generated API

Supabase automatically generates REST and GraphQL APIs from database tables. We use the REST API via the Supabase JS client.

### API Endpoints (via Supabase Client)

```typescript
// All API calls use the Supabase client
import { supabase } from '@/lib/supabase';

// Examples of API patterns:

// GET - List with filters
const { data, error } = await supabase
  .from('detention_events')
  .select('*, facilities(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(0, 19);

// GET - Single record
const { data, error } = await supabase
  .from('detention_events')
  .select('*, facilities(*), gps_logs(*), photos(*)')
  .eq('id', eventId)
  .single();

// POST - Create
const { data, error } = await supabase
  .from('detention_events')
  .insert({
    user_id: userId,
    facility_id: facilityId,
    arrival_time: new Date().toISOString(),
    status: 'active'
  })
  .select()
  .single();

// PATCH - Update
const { data, error } = await supabase
  .from('detention_events')
  .update({
    departure_time: new Date().toISOString(),
    status: 'completed'
  })
  .eq('id', eventId)
  .select()
  .single();

// DELETE
const { error } = await supabase
  .from('detention_events')
  .delete()
  .eq('id', eventId);
```

### Edge Functions (Custom API Endpoints)

```typescript
// supabase/functions/generate-invoice/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { detentionEventId } = await req.json();

  // Generate PDF
  // Upload to storage
  // Return URL

  return new Response(
    JSON.stringify({ invoiceUrl: '...' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Edge Function Endpoints

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| `/generate-invoice` | POST | Create PDF invoice | `{ detentionEventId }` | `{ invoiceUrl, invoiceId }` |
| `/send-invoice` | POST | Email invoice | `{ invoiceId, recipientEmail }` | `{ success, messageId }` |
| `/geocode-facility` | POST | Lookup facility by address | `{ address }` | `{ lat, lng, formattedAddress }` |
| `/calculate-detention` | POST | Calculate amount | `{ detentionEventId }` | `{ minutes, amount }` |
| `/r2-presigned-url` | POST | Get upload URL for R2 | `{ fileName, contentType }` | `{ uploadUrl, publicUrl }` |

### API Response Patterns

```typescript
// Success response
{
  data: { ... },
  error: null
}

// Error response
{
  data: null,
  error: {
    message: "...",
    code: "PGRST116",
    details: "...",
    hint: "..."
  }
}
```

### Row Level Security (RLS) Policies

```sql
-- Users can only see their own detention events
CREATE POLICY "Users can view own detention_events"
ON detention_events FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own detention events
CREATE POLICY "Users can insert own detention_events"
ON detention_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own detention events
CREATE POLICY "Users can update own detention_events"
ON detention_events FOR UPDATE
USING (auth.uid() = user_id);

-- Facilities are public read
CREATE POLICY "Facilities are viewable by all"
ON facilities FOR SELECT
USING (true);

-- Reviews require authenticated user
CREATE POLICY "Users can insert own reviews"
ON facility_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## Database Design ERD

### Table Definitions

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR,
  company_name VARCHAR,
  phone VARCHAR,
  hourly_rate DECIMAL(10,2) DEFAULT 75.00,
  grace_period_mins INTEGER DEFAULT 120,
  invoice_logo_url VARCHAR,
  invoice_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### facilities
```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR(2),
  zip VARCHAR(10),
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  facility_type VARCHAR CHECK (facility_type IN ('shipper', 'receiver', 'both', 'unknown')) DEFAULT 'unknown',

  -- Detention Stats
  avg_wait_minutes_pickup INTEGER DEFAULT 0,
  avg_wait_minutes_delivery INTEGER DEFAULT 0,
  avg_detention_minutes_pickup INTEGER DEFAULT 0,
  avg_detention_minutes_delivery INTEGER DEFAULT 0,

  -- Ratings
  avg_rating DECIMAL(2,1) DEFAULT 0,
  avg_rating_wait_time DECIMAL(2,1) DEFAULT 0,
  avg_rating_staff DECIMAL(2,1) DEFAULT 0,
  avg_rating_restrooms DECIMAL(2,1) DEFAULT 0,
  avg_rating_parking DECIMAL(2,1) DEFAULT 0,
  avg_rating_safety DECIMAL(2,1) DEFAULT 0,
  avg_rating_cleanliness DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- Amenities
  overnight_parking BOOLEAN,
  parking_spaces INTEGER,
  restrooms BOOLEAN,
  driver_lounge BOOLEAN,
  water_available BOOLEAN,
  vending_machines BOOLEAN,
  wifi_available BOOLEAN,
  showers_available BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_facilities_location ON facilities USING GIST (
  ll_to_earth(lat, lng)
);
CREATE INDEX idx_facilities_name ON facilities (name);
```

#### detention_events
```sql
CREATE TABLE detention_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id),

  -- Event Classification
  event_type VARCHAR CHECK (event_type IN ('pickup', 'delivery')) NOT NULL,
  load_reference VARCHAR,  -- BOL number

  -- Timestamps
  arrival_time TIMESTAMPTZ NOT NULL,
  departure_time TIMESTAMPTZ,
  grace_period_end TIMESTAMPTZ,
  detention_start TIMESTAMPTZ,

  -- Calculated Values
  detention_minutes INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  total_amount DECIMAL(10,2) DEFAULT 0,

  -- Status
  status VARCHAR CHECK (status IN ('active', 'completed', 'invoiced', 'paid')) DEFAULT 'active',
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_detention_user ON detention_events (user_id);
CREATE INDEX idx_detention_status ON detention_events (status);
CREATE INDEX idx_detention_facility ON detention_events (facility_id);
```

#### gps_logs
```sql
CREATE TABLE gps_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detention_event_id UUID NOT NULL REFERENCES detention_events(id) ON DELETE CASCADE,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  accuracy DECIMAL(10,2),
  timestamp TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_gps_event ON gps_logs (detention_event_id);
```

#### photos
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detention_event_id UUID NOT NULL REFERENCES detention_events(id) ON DELETE CASCADE,
  storage_url VARCHAR NOT NULL,
  category VARCHAR CHECK (category IN ('dock', 'bol', 'conditions', 'checkin', 'other')) DEFAULT 'other',
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  timestamp TIMESTAMPTZ,
  caption TEXT
);

CREATE INDEX idx_photos_event ON photos (detention_event_id);
```

#### facility_reviews
```sql
CREATE TABLE facility_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  detention_event_id UUID REFERENCES detention_events(id),

  -- Ratings (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  wait_time_rating INTEGER CHECK (wait_time_rating BETWEEN 1 AND 5),
  staff_rating INTEGER CHECK (staff_rating BETWEEN 1 AND 5),
  restroom_rating INTEGER CHECK (restroom_rating BETWEEN 1 AND 5),
  parking_rating INTEGER CHECK (parking_rating BETWEEN 1 AND 5),
  safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),

  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, detention_event_id)
);

CREATE INDEX idx_reviews_facility ON facility_reviews (facility_id);
CREATE INDEX idx_reviews_created ON facility_reviews (created_at DESC);
```

#### invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_number VARCHAR UNIQUE NOT NULL,
  detention_event_ids UUID[] NOT NULL,
  recipient_email VARCHAR,
  total_amount DECIMAL(10,2) NOT NULL,
  pdf_url VARCHAR,
  status VARCHAR CHECK (status IN ('draft', 'sent', 'paid')) DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices (user_id);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  tier VARCHAR CHECK (tier IN ('free', 'pro', 'fleet', 'enterprise')) DEFAULT 'free',
  status VARCHAR CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);
```

### Database Functions

```sql
-- Update facility averages when review is added
CREATE OR REPLACE FUNCTION update_facility_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE facilities
  SET
    avg_rating = (
      SELECT AVG(overall_rating)
      FROM facility_reviews
      WHERE facility_id = NEW.facility_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM facility_reviews
      WHERE facility_id = NEW.facility_id
    ),
    updated_at = NOW()
  WHERE id = NEW.facility_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_insert
AFTER INSERT ON facility_reviews
FOR EACH ROW EXECUTE FUNCTION update_facility_stats();

-- Calculate detention amount
CREATE OR REPLACE FUNCTION calculate_detention_amount(event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  event detention_events%ROWTYPE;
  minutes INTEGER;
  amount DECIMAL;
BEGIN
  SELECT * INTO event FROM detention_events WHERE id = event_id;

  IF event.detention_start IS NULL THEN
    RETURN 0;
  END IF;

  minutes := EXTRACT(EPOCH FROM (
    COALESCE(event.departure_time, NOW()) - event.detention_start
  )) / 60;

  amount := (minutes / 60.0) * event.hourly_rate;

  RETURN ROUND(amount, 2);
END;
$$ LANGUAGE plpgsql;
```

---

## Summary

This Software Requirements Specification defines a **mobile-first hybrid architecture**:

### Core Stack
- **React Native + Expo** for cross-platform mobile (iOS/Android)
- **TypeScript** for type safety
- **TanStack Query + Zustand** for state management
- **Expo Router** for file-based navigation

### Hybrid Backend (Cost-Optimized)
- **Supabase** for auth, database (Postgres), and edge functions
- **Cloudflare R2** for photo/PDF storage (zero egress fees)
- **Upstash Redis** for caching (serverless, pay-per-request)
- **Cloudflare CDN** for edge caching and DNS

### Architecture Priorities

1. **Offline-first**: Critical for truck drivers with spotty connectivity
2. **Cost-efficient**: Zero egress fees on photo storage (R2)
3. **Type safety**: Generated types from Supabase, end-to-end TypeScript
4. **Scalability**: Database designed for fleet and enterprise customers

---

*Document Version: 2.0*
*Last Updated: January 9, 2026*
*Architecture: Hybrid (Supabase + Cloudflare R2 + Upstash Redis)*
*Companion to: DwellTime PRD v2.1, UI Design v1.0*
