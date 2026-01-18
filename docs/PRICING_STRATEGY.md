# DwellTime Pricing Strategy

> **Version**: 1.0  
> **Last Updated**: January 2026  
> **Status**: Final for MVP

---

## Executive Summary

DwellTime uses a freemium model with simple, transparent pricing designed for the trucking industry's economic realities:

- **Owner-operators** net $60-87K/year with 80-90% failing in year one
- **Drivers already pay** $150-200/month in app subscriptions (DAT, ELD, etc.)
- **Competitor pricing**: Detention Source Lite at $9.99/month

Our strategy: **Slightly premium pricing ($12.99)** justified by unique features no competitor offers.

---

## Individual Driver Pricing

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

### Pricing Rationale

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

## Fleet Pricing (Phase 2)

### No Free Tier for Fleets

Individual drivers get 3 free events/month to try the app and build our data moat.

**Fleets don't get a free tier.** Why:
- 5 drivers × 3 free events = 15 events/month (enough to never pay)
- Fleet owners make business decisions, not personal tryouts
- They already pay for DAT, ELD, insurance apps — subscriptions aren't a barrier
- The dashboard visibility IS the value

**Instead: 14-day free trial** — full access, all features, then converts to paid.

### Fleet Pricing Tiers

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

### Market Coverage

| Tier | Fleet Size | % of Market |
|------|------------|-------------|
| Individual | 1 truck | 70% |
| Small Fleet | 2-5 trucks | ~20% |
| Fleet | 6-10 trucks | ~5% |
| Enterprise | 11+ trucks | ~5% |

**Our standard pricing covers 95% of the market.**

---

## Fleet Admin Permissions

### What Fleet Admins CAN Do

| Permission | Included |
|------------|----------|
| View all driver events | ✓ |
| View all invoices | ✓ |
| See facility ratings | ✓ |
| Export data/reports | ✓ |
| Add/remove drivers | ✓ |
| Set default rates | ✓ |
| Add notes to events | ✓ |

### What Fleet Admins CANNOT Do

| Blocked | Why |
|---------|-----|
| Edit GPS timestamps | Destroys legal defensibility |
| Delete events | Data integrity |
| Stop another driver's tracking | Driver controls their own work |
| Modify invoice after sent | Legal document |

**Drivers control their own data. Admins have visibility, not control.**

---

## Shipper/Facility Pricing (Phase 2)

| Tier | Price | Features |
|------|-------|----------|
| **Basic** | $99/month | Claim facility profile, see ratings and reviews, respond to reviews |
| **Professional** | $249/month | Everything in Basic + average wait time analytics, peak hour reports, driver feedback summaries |
| **Enterprise** | $499/month | Everything in Professional + multi-facility dashboard, benchmarking vs. industry, API access, dedicated support |

### Sales Motion

**Inbound** — facilities discover they have bad ratings and seek to improve them. The data moat creates demand.

---

## Broker/Enterprise Pricing (Phase 3)

| Tier | Price | Features |
|------|-------|----------|
| **Broker API** | $299–$999/month | Facility intelligence API, wait time data feed, integration support (usage-based pricing) |
| **Enterprise Carrier** | $500–$2,000/month | Fleet-wide analytics for 50+ drivers, custom reporting, white-label options, SLA |
| **TMS/ELD Integration** | Custom | API licensing for platform integration, revenue share on referred users |

---

## Feature Matrix by Tier

| Feature | Free | Pro | Small Fleet | Fleet | Enterprise |
|---------|:----:|:---:|:-----------:|:-----:|:----------:|
| **Max Events/Month** | 3 | Unlimited | Unlimited | Unlimited | Unlimited |
| **Storage** | 100 MB | 5 GB | 25 GB | 100 GB | Unlimited |
| **GPS Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Photo Evidence** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **PDF Invoice** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Email Invoice** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Facility Ratings** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Add Ratings** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Full Facility Intelligence** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Payment Reliability Data** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Load Check (Facility Lookup)** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Recovery Dashboard** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Invoice Follow-up Tools** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Nearby Services** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Fleet Dashboard** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Driver Management** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Export Reports** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Company-wide Defaults** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Dedicated Account Rep** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Custom Onboarding** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **White-label Options** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **SLA Guarantees** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Competitive Analysis

### vs Detention Source Lite ($9.99/month)

| Feature | Them | Us |
|---------|:----:|:--:|
| GPS tracking | ✅ | ✅ |
| PDF invoices | ✅ | ✅ |
| Email/share invoice | ✅ | ✅ |
| **Facility ratings** | ❌ | ✅ Full 7-category + overall |
| **Payment reliability** | ❌ | ✅ "73% get paid" |
| **Facility database** | ❌ | ✅ Searchable |
| **Truck entrance info** | ❌ | ✅ Crowdsourced |
| **Invoice aging** | ❌ | ✅ Track & remind |
| **Recovery dashboard** | ❌ | ✅ See your ROI |
| **Free tier** | 30-day trial | 3 events/month forever |

**Our $3 premium is justified by unique data moats.**

### Our Pitch

> "Don't just track detention. Know if you'll get paid — and find the truck entrance."

---

## Revenue Projections

### Phase 1: Driver Revenue (Months 1–6)

| Milestone | Paid Users | MRR |
|-----------|------------|-----|
| Month 3 | 100 drivers | $1,299 |
| Month 6 | 500 drivers | $6,495 |

### Phase 2: Adding Shipper Revenue (Months 6–12)

| Milestone | Drivers | Shippers | MRR |
|-----------|---------|----------|-----|
| Month 9 | 1,000 | 25 facilities | $18,465 |
| Month 12 | 2,000 | 75 facilities | $44,730 |

### Phase 3: Adding Enterprise/Broker Revenue (Year 2)

| Milestone | Drivers | Shippers | Enterprise | MRR |
|-----------|---------|----------|------------|-----|
| Month 18 | 5,000 | 200 facilities | 10 brokers | $125,000+ |
| Month 24 | 10,000 | 500 facilities | 50 brokers | $350,000+ |

---

## Stripe Price IDs

> **Note**: Store these in environment variables

```typescript
interface StripePriceIds {
  pro_monthly: string;      // $12.99/month
  pro_annual: string;       // $99/year
  small_fleet_monthly: string;  // $49.99/month
  small_fleet_annual: string;   // $399/year
  fleet_monthly: string;    // $79.99/month
  fleet_annual: string;     // $649/year
}
```

---

## Implementation Notes

### Subscription Tiers (TypeScript)

```typescript
type SubscriptionTier = 'free' | 'pro' | 'small_fleet' | 'fleet' | 'enterprise';
type BillingInterval = 'monthly' | 'annual';
```

### Key Files

- `src/features/billing/types/index.ts` - Type definitions
- `src/features/billing/services/billingService.ts` - Tier features & utilities
- `src/features/billing/components/PricingCard.tsx` - UI component
- `convex/http.ts` - Stripe webhook handlers

### Annual Savings Calculation

```typescript
function calculateAnnualSavings(monthlyPrice: number, annualPrice: number): number {
  const yearlyAtMonthly = monthlyPrice * 12;
  if (yearlyAtMonthly <= 0) return 0;
  return Math.round(((yearlyAtMonthly - annualPrice) / yearlyAtMonthly) * 100);
}
```

---

## The Three Data Moats

Our pricing is premium because we offer unique value:

1. **Payment Reliability** — "Did you get paid?" data no one else has
2. **Facility Intelligence** — Detailed ratings across 7 categories
3. **Truck Entrance Locations** — Crowdsourced directions to the RIGHT entrance

Every user who contributes makes the platform more valuable for everyone else.

---

*Document Version: 1.0*  
*Companion to: DwellTime PRD v2.1, PRD Addendum v1.0*
