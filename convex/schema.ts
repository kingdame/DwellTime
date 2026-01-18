/**
 * DwellTime Convex Schema
 * Converted from Supabase migrations to type-safe Convex schema
 *
 * Tables: 14 total
 * - Core: users, facilities, detentionEvents, gpsLogs, photos, facilityReviews
 * - Billing: invoices, subscriptions, invoiceTracking, emailContacts, invoiceEmails
 * - Fleet: fleets, fleetMembers, fleetInvitations, fleetInvoices
 * - Crowdsourced: truckEntranceReports
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

export default defineSchema({
  // ==========================================================================
  // CORE TABLES
  // ==========================================================================

  /**
   * Users - Core user profiles
   * Migrated from: auth.users + users table
   */
  users: defineTable({
    // Clerk authentication - links this user to their Clerk identity
    clerkId: v.string(),

    // Auth fields
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),

    // Company info
    companyName: v.optional(v.string()),

    // Detention settings
    hourlyRate: v.number(), // Default: 75
    gracePeriodMinutes: v.number(), // Default: 120

    // Invoice customization
    invoiceLogoUrl: v.optional(v.string()),
    invoiceTerms: v.optional(v.string()),

    // Subscription
    subscriptionTier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("small_fleet"),
      v.literal("fleet"),
      v.literal("enterprise")
    ),
    stripeCustomerId: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("trialing"),
        v.literal("active"),
        v.literal("past_due"),
        v.literal("canceled"),
        v.literal("unpaid")
      )
    ),
    subscriptionPeriodEnd: v.optional(v.number()), // Unix timestamp

    // Fleet association
    currentFleetId: v.optional(v.id("fleets")),
    fleetRole: v.optional(v.union(v.literal("admin"), v.literal("driver"))),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_fleet", ["currentFleetId"]),

  /**
   * Facilities - Shipper/receiver locations
   * Migrated from: facilities table
   */
  facilities: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),

    // Geolocation
    lat: v.number(),
    lng: v.number(),

    // Classification
    facilityType: v.union(
      v.literal("shipper"),
      v.literal("receiver"),
      v.literal("both"),
      v.literal("unknown")
    ),

    // Aggregated stats (updated via triggers/mutations)
    avgWaitMinutes: v.optional(v.number()),
    avgRating: v.optional(v.number()),
    totalReviews: v.number(), // Default: 0

    // Amenities
    overnightParking: v.optional(v.boolean()),
    parkingSpaces: v.optional(v.number()),
    restrooms: v.optional(v.boolean()),
    driverLounge: v.optional(v.boolean()),
    waterAvailable: v.optional(v.boolean()),
    vendingMachines: v.optional(v.boolean()),
    wifiAvailable: v.optional(v.boolean()),
    showersAvailable: v.optional(v.boolean()),

    // Truck entrance crowdsourcing (from 005_truck_entrance)
    truckEntranceDifferent: v.optional(v.boolean()),
    truckEntranceAddress: v.optional(v.string()),
    truckEntranceLat: v.optional(v.number()),
    truckEntranceLng: v.optional(v.number()),
    truckEntranceNotes: v.optional(v.string()),
    truckEntranceVerifiedCount: v.optional(v.number()),
    truckEntranceLastUpdatedAt: v.optional(v.number()),
    truckEntranceLastUpdatedBy: v.optional(v.id("users")),
  })
    .index("by_city_state", ["city", "state"])
    .index("by_type", ["facilityType"]),
  // Note: Geo queries in Convex require custom logic or external service

  /**
   * Saved Facilities - User bookmarked/saved facilities
   * Supports both Convex facilities and Google Places
   */
  savedFacilities: defineTable({
    userId: v.id("users"),

    // Reference to Convex facility (if from our database)
    facilityId: v.optional(v.id("facilities")),

    // Google Place ID (if from Google Places API)
    googlePlaceId: v.optional(v.string()),

    // Cached facility info (so we don't need to fetch it every time)
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    lat: v.number(),
    lng: v.number(),
    facilityType: v.optional(
      v.union(
        v.literal("shipper"),
        v.literal("receiver"),
        v.literal("both"),
        v.literal("unknown")
      )
    ),

    // User notes
    notes: v.optional(v.string()),

    // Timestamp
    savedAt: v.number(), // Unix milliseconds
  })
    .index("by_user", ["userId"])
    .index("by_user_facility", ["userId", "facilityId"])
    .index("by_user_google_place", ["userId", "googlePlaceId"]),

  /**
   * Detention Events - Core tracking data
   * Migrated from: detention_events table
   */
  detentionEvents: defineTable({
    userId: v.id("users"),
    facilityId: v.optional(v.id("facilities")),

    // Load info
    loadReference: v.optional(v.string()),
    eventType: v.union(v.literal("pickup"), v.literal("delivery")),

    // Timestamps (Unix milliseconds)
    arrivalTime: v.number(),
    departureTime: v.optional(v.number()),
    gracePeriodEnd: v.optional(v.number()),
    detentionStart: v.optional(v.number()),

    // Calculated values
    detentionMinutes: v.number(), // Default: 0
    hourlyRate: v.number(),
    totalAmount: v.number(), // Default: 0

    // Status
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("invoiced"),
      v.literal("paid")
    ),

    notes: v.optional(v.string()),

    // Fleet association
    fleetId: v.optional(v.id("fleets")),
    fleetMemberId: v.optional(v.id("fleetMembers")),
    fleetVisible: v.optional(v.boolean()), // Default: true
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_facility", ["facilityId"])
    .index("by_fleet", ["fleetId"])
    .index("by_fleet_member", ["fleetMemberId"])
    .index("by_status", ["status"])
    .index("by_arrival", ["arrivalTime"]),

  /**
   * GPS Logs - Location breadcrumbs for detention events
   * Migrated from: gps_logs table
   * High-write table - optimized for append operations
   */
  gpsLogs: defineTable({
    detentionEventId: v.id("detentionEvents"),
    lat: v.number(),
    lng: v.number(),
    accuracy: v.optional(v.number()),
    timestamp: v.number(), // Unix milliseconds
  }).index("by_event", ["detentionEventId"]),

  /**
   * Photos - Evidence photos stored in R2
   * Migrated from: photos table
   */
  photos: defineTable({
    detentionEventId: v.id("detentionEvents"),

    // R2 storage
    storageUrl: v.string(), // R2 URL
    storageKey: v.optional(v.string()), // R2 key for deletion

    // Metadata
    category: v.union(
      v.literal("dock"),
      v.literal("bol"),
      v.literal("conditions"),
      v.literal("checkin"),
      v.literal("other")
    ),

    // Location when photo was taken
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    timestamp: v.optional(v.number()),
    caption: v.optional(v.string()),
  }).index("by_event", ["detentionEventId"]),

  /**
   * Facility Reviews - Driver ratings/feedback
   * Migrated from: facility_reviews table
   */
  facilityReviews: defineTable({
    userId: v.id("users"),
    facilityId: v.id("facilities"),
    detentionEventId: v.optional(v.id("detentionEvents")),

    // Ratings (1-5)
    overallRating: v.number(),
    waitTimeRating: v.optional(v.number()),
    staffRating: v.optional(v.number()),
    restroomRating: v.optional(v.number()),
    parkingRating: v.optional(v.number()),
    safetyRating: v.optional(v.number()),
    cleanlinessRating: v.optional(v.number()),

    comment: v.optional(v.string()),

    // Payment tracking (from 004_payment_reliability)
    gotPaid: v.optional(v.boolean()),
    paymentDays: v.optional(v.number()),
    paymentAmount: v.optional(v.number()),
    partialPayment: v.optional(v.boolean()),
    paymentReportedAt: v.optional(v.number()),
  })
    .index("by_facility", ["facilityId"])
    .index("by_user", ["userId"])
    .index("by_event", ["detentionEventId"]),

  // ==========================================================================
  // BILLING TABLES
  // ==========================================================================

  /**
   * Invoices - Generated invoice documents
   * Migrated from: invoices table
   */
  invoices: defineTable({
    userId: v.id("users"),
    invoiceNumber: v.string(),

    // Related detention events
    detentionEventIds: v.array(v.id("detentionEvents")),

    // Recipient info
    recipientEmail: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    recipientCompany: v.optional(v.string()),

    // Amounts
    totalAmount: v.number(),

    // PDF stored in R2
    pdfUrl: v.optional(v.string()),
    pdfStorageKey: v.optional(v.string()),

    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("partially_paid")
    ),

    sentAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),

    // Fleet association
    fleetId: v.optional(v.id("fleets")),
    fleetInvoiceId: v.optional(v.id("fleetInvoices")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_invoice_number", ["invoiceNumber"])
    .index("by_fleet", ["fleetId"]),

  /**
   * Subscriptions - Stripe subscription sync
   * Migrated from: subscriptions table
   */
  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),

    tier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("small_fleet"),
      v.literal("fleet"),
      v.literal("enterprise")
    ),

    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("incomplete")
    ),

    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"])
    .index("by_status", ["status"]),

  /**
   * Invoice Tracking - Payment tracking and recovery
   * Migrated from: invoice_tracking table (003_invoice_tracking)
   */
  invoiceTracking: defineTable({
    invoiceId: v.id("invoices"),
    userId: v.id("users"),

    // Invoice snapshot
    amountInvoiced: v.number(),
    amountReceived: v.number(), // Default: 0

    // Payment status
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("paid"),
      v.literal("disputed"),
      v.literal("written_off")
    ),

    paymentReceivedAt: v.optional(v.number()),
    daysToPayment: v.optional(v.number()),

    // Follow-up tracking
    reminderCount: v.number(), // Default: 0
    lastReminderAt: v.optional(v.number()),
    nextReminderAt: v.optional(v.number()),

    // Payment follow-up (from 004_payment_reliability)
    followUpSent: v.optional(v.boolean()),
    followUpSentAt: v.optional(v.number()),
    followUpResponse: v.optional(
      v.union(
        v.literal("paid_full"),
        v.literal("paid_partial"),
        v.literal("not_paid"),
        v.literal("pending"),
        v.literal("disputed")
      )
    ),
    followUpRespondedAt: v.optional(v.number()),

    notes: v.optional(v.string()),
  })
    .index("by_invoice", ["invoiceId"])
    .index("by_user", ["userId"])
    .index("by_status", ["paymentStatus"])
    .index("by_next_reminder", ["nextReminderAt"]),

  /**
   * Email Contacts - Quick-send contacts for invoices
   * Migrated from: email_contacts table (002_email_invoice)
   */
  emailContacts: defineTable({
    userId: v.id("users"),
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    contactType: v.optional(
      v.union(
        v.literal("broker"),
        v.literal("shipper"),
        v.literal("dispatcher"),
        v.literal("other")
      )
    ),
    useCount: v.number(), // Default: 0
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_email", ["userId", "email"])
    .index("by_use_count", ["userId", "useCount"]),

  /**
   * Invoice Emails - Email send tracking
   * Migrated from: invoice_emails table (002_email_invoice)
   */
  invoiceEmails: defineTable({
    invoiceId: v.id("invoices"),
    userId: v.id("users"),
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),

    emailType: v.union(
      v.literal("initial"),
      v.literal("reminder"),
      v.literal("follow_up")
    ),

    subject: v.optional(v.string()),
    customMessage: v.optional(v.string()),
    messageId: v.optional(v.string()), // From email provider

    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("bounced"),
      v.literal("delivered")
    ),

    errorMessage: v.optional(v.string()),
    sentAt: v.optional(v.number()),
  })
    .index("by_invoice", ["invoiceId"])
    .index("by_user", ["userId"]),

  // ==========================================================================
  // FLEET TABLES
  // ==========================================================================

  /**
   * Fleets - Fleet organizations
   * Migrated from: fleets table (001_fleet_management)
   */
  fleets: defineTable({
    name: v.string(),
    ownerId: v.id("users"),

    companyName: v.optional(v.string()),
    dotNumber: v.optional(v.string()),
    mcNumber: v.optional(v.string()),
    billingEmail: v.optional(v.string()),
    logoUrl: v.optional(v.string()),

    // Settings
    maxDrivers: v.number(), // Default: 10
    defaultHourlyRate: v.optional(v.number()),
    defaultGracePeriodMinutes: v.optional(v.number()),

    // Subscription
    subscriptionTier: v.optional(
      v.union(
        v.literal("small_fleet"),
        v.literal("fleet"),
        v.literal("enterprise")
      )
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("trialing"),
        v.literal("active"),
        v.literal("past_due"),
        v.literal("canceled"),
        v.literal("unpaid")
      )
    ),
    subscriptionPeriodEnd: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),

    // JSON settings (stored as object)
    settings: v.optional(
      v.object({
        allowMemberInvites: v.optional(v.boolean()),
        requireApprovalForEvents: v.optional(v.boolean()),
        autoConsolidateInvoices: v.optional(v.boolean()),
        invoiceConsolidationPeriod: v.optional(
          v.union(
            v.literal("weekly"),
            v.literal("biweekly"),
            v.literal("monthly")
          )
        ),
        notifyOnNewEvents: v.optional(v.boolean()),
        notifyOnInvoiceReady: v.optional(v.boolean()),
      })
    ),
  })
    .index("by_owner", ["ownerId"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  /**
   * Fleet Members - Driver memberships in fleets
   * Migrated from: fleet_members table (001_fleet_management)
   */
  fleetMembers: defineTable({
    fleetId: v.id("fleets"),
    userId: v.id("users"),

    role: v.union(v.literal("admin"), v.literal("driver")),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("removed")
    ),

    invitedBy: v.optional(v.id("users")),
    invitedAt: v.optional(v.number()),
    joinedAt: v.optional(v.number()),

    // Override fleet defaults for this member
    settingsOverride: v.optional(
      v.object({
        hourlyRate: v.optional(v.number()),
        gracePeriodMinutes: v.optional(v.number()),
      })
    ),
  })
    .index("by_fleet", ["fleetId"])
    .index("by_user", ["userId"])
    .index("by_fleet_user", ["fleetId", "userId"])
    .index("by_fleet_status", ["fleetId", "status"]),

  /**
   * Fleet Invitations - Pending driver invitations
   * Migrated from: fleet_invitations table (001_fleet_management)
   */
  fleetInvitations: defineTable({
    fleetId: v.id("fleets"),
    email: v.string(),
    phone: v.optional(v.string()),
    invitationCode: v.string(),
    role: v.union(v.literal("admin"), v.literal("driver")),
    invitedBy: v.id("users"),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_fleet", ["fleetId"])
    .index("by_email", ["email"])
    .index("by_code", ["invitationCode"]),

  /**
   * Fleet Invoices - Consolidated fleet billing
   * Migrated from: fleet_invoices table (001_fleet_management)
   */
  fleetInvoices: defineTable({
    fleetId: v.id("fleets"),
    invoiceNumber: v.string(),

    // Related items
    invoiceIds: v.array(v.id("invoices")),
    detentionEventIds: v.array(v.id("detentionEvents")),
    driverIds: v.array(v.id("users")),

    // Recipient
    recipientName: v.optional(v.string()),
    recipientCompany: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),

    totalAmount: v.number(),

    // PDF in R2
    pdfUrl: v.optional(v.string()),

    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("partially_paid")
    ),

    dateRangeStart: v.optional(v.number()),
    dateRangeEnd: v.optional(v.number()),
    notes: v.optional(v.string()),

    sentAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    createdBy: v.id("users"),
  })
    .index("by_fleet", ["fleetId"])
    .index("by_status", ["status"])
    .index("by_invoice_number", ["invoiceNumber"]),

  // ==========================================================================
  // CROWDSOURCED DATA
  // ==========================================================================

  /**
   * Truck Entrance Reports - Crowdsourced entrance info
   * Migrated from: truck_entrance_reports table (005_truck_entrance)
   */
  truckEntranceReports: defineTable({
    facilityId: v.id("facilities"),
    userId: v.id("users"),

    reportType: v.union(
      v.literal("new"),
      v.literal("confirm"),
      v.literal("update"),
      v.literal("incorrect")
    ),

    // Entrance details
    entranceDifferent: v.boolean(),
    entranceAddress: v.optional(v.string()),
    entranceLat: v.optional(v.number()),
    entranceLng: v.optional(v.number()),
    entranceNotes: v.optional(v.string()),

    // Verification
    isVerified: v.boolean(), // Default: false
    verifiedAt: v.optional(v.number()),
  })
    .index("by_facility", ["facilityId"])
    .index("by_user", ["userId"]),

  // ==========================================================================
  // PAYMENT FOLLOW-UPS (from 004_payment_reliability)
  // ==========================================================================

  /**
   * Payment Follow-ups - Scheduled payment check-ins
   */
  paymentFollowUps: defineTable({
    userId: v.id("users"),
    invoiceId: v.id("invoices"),
    trackingId: v.optional(v.id("invoiceTracking")),
    facilityId: v.optional(v.id("facilities")),

    scheduledFor: v.number(),
    sentAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),

    response: v.optional(
      v.union(
        v.literal("paid_full"),
        v.literal("paid_partial"),
        v.literal("not_paid"),
        v.literal("pending"),
        v.literal("disputed")
      )
    ),

    paymentAmount: v.optional(v.number()),
    paymentDays: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_invoice", ["invoiceId"])
    .index("by_scheduled", ["scheduledFor"]),
});
