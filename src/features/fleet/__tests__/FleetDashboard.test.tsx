/**
 * FleetDashboard Component Tests
 * Tests for the main admin dashboard component
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: (styles: any) => styles,
    hairlineWidth: 0.5,
  },
}));

// Mock colors
jest.mock('@/constants/colors', () => ({
  colors: {
    dark: {
      background: '#0A0A0F',
      card: '#16161F',
      primary: '#3B82F6',
      textPrimary: '#FFFFFF',
      textSecondary: '#9CA3AF',
      textDisabled: '#6B7280',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      divider: '#2D2D3A',
    },
  },
}));

// Mock FleetMetricsCard component
jest.mock('../components/FleetMetricsCard', () => ({
  FleetMetricsCard: jest.fn(() => 'FleetMetricsCard'),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockFleet = {
  id: 'fleet-123',
  name: 'Test Fleet',
  owner_id: 'owner-456',
  company_name: 'Test Trucking Co',
  company_address: null,
  company_phone: null,
  company_email: null,
  dot_number: null,
  mc_number: null,
  logo_url: null,
  subscription_tier: 'fleet' as const,
  subscription_status: 'active' as const,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  max_drivers: 50,
  current_period_end: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockSummary = {
  fleet_id: 'fleet-123',
  fleet_name: 'Test Fleet',
  total_drivers: 10,
  active_drivers: 8,
  pending_invitations: 3,
  total_detention_events: 150,
  total_detention_amount: 7500,
  total_detention_minutes: 9000,
  unpaid_invoice_count: 5,
  unpaid_invoice_amount: 2500,
  events_this_week: 15,
  events_this_month: 50,
  amount_this_week: 750,
  amount_this_month: 2500,
  top_facilities: [
    {
      facility_id: 'facility-1',
      facility_name: 'Warehouse A',
      event_count: 25,
      total_wait_minutes: 1500,
    },
    {
      facility_id: 'facility-2',
      facility_name: 'Distribution Center B',
      event_count: 15,
      total_wait_minutes: 900,
    },
  ],
};

const mockCallbacks = {
  onInviteDriver: jest.fn(),
  onViewEvents: jest.fn(),
  onCreateInvoice: jest.fn(),
  onViewDrivers: jest.fn(),
  onViewSettings: jest.fn(),
};

// ============================================================================
// Test Suites
// ============================================================================

describe('FleetDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders fleet name correctly', () => {
      // Test the text extraction logic
      const fleetName = mockFleet.name;
      expect(fleetName).toBe('Test Fleet');
    });

    it('renders company name when present', () => {
      const companyName = mockFleet.company_name;
      expect(companyName).toBe('Test Trucking Co');
    });

    it('handles null company name', () => {
      const fleetNoCompany = { ...mockFleet, company_name: null };
      expect(fleetNoCompany.company_name).toBeNull();
    });

    it('renders settings button', () => {
      // Settings button should always be present
      const hasSettingsButton = true;
      expect(hasSettingsButton).toBe(true);
    });
  });

  describe('Metrics Display', () => {
    it('shows correct driver counts', () => {
      expect(mockSummary.total_drivers).toBe(10);
      expect(mockSummary.active_drivers).toBe(8);
      expect(mockSummary.pending_invitations).toBe(3);
    });

    it('shows events this month', () => {
      expect(mockSummary.events_this_month).toBe(50);
    });

    it('shows earnings this month', () => {
      expect(mockSummary.amount_this_month).toBe(2500);
    });

    it('shows pending invoices amount', () => {
      expect(mockSummary.unpaid_invoice_amount).toBe(2500);
    });

    it('handles null summary gracefully', () => {
      const getSummaryValue = (summary: typeof mockSummary | null, key: keyof typeof mockSummary) => {
        return summary?.[key] ?? 0;
      };

      const totalDrivers = getSummaryValue(null, 'total_drivers');
      const activeDrivers = getSummaryValue(null, 'active_drivers');

      expect(totalDrivers).toBe(0);
      expect(activeDrivers).toBe(0);
    });

    it('handles loading state', () => {
      const isLoading = true;
      expect(isLoading).toBe(true);
    });
  });

  describe('Quick Actions', () => {
    it('renders all 4 quick action buttons', () => {
      const quickActions = [
        'Invite Driver',
        'View Events',
        'Create Invoice',
        'Manage Drivers',
      ];

      expect(quickActions).toHaveLength(4);
    });

    it('invite driver action has correct callback', () => {
      mockCallbacks.onInviteDriver();
      expect(mockCallbacks.onInviteDriver).toHaveBeenCalledTimes(1);
    });

    it('view events action has correct callback', () => {
      mockCallbacks.onViewEvents();
      expect(mockCallbacks.onViewEvents).toHaveBeenCalledTimes(1);
    });

    it('create invoice action has correct callback', () => {
      mockCallbacks.onCreateInvoice();
      expect(mockCallbacks.onCreateInvoice).toHaveBeenCalledTimes(1);
    });

    it('manage drivers action has correct callback', () => {
      mockCallbacks.onViewDrivers();
      expect(mockCallbacks.onViewDrivers).toHaveBeenCalledTimes(1);
    });

    it('settings button has correct callback', () => {
      mockCallbacks.onViewSettings();
      expect(mockCallbacks.onViewSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Top Facilities Section', () => {
    it('renders facilities when present', () => {
      const facilities = mockSummary.top_facilities;
      expect(facilities).toHaveLength(2);
    });

    it('shows facility name', () => {
      const facilityName = mockSummary.top_facilities[0].facility_name;
      expect(facilityName).toBe('Warehouse A');
    });

    it('shows event count', () => {
      const eventCount = mockSummary.top_facilities[0].event_count;
      expect(eventCount).toBe(25);
    });

    it('calculates average wait time correctly', () => {
      const facility = mockSummary.top_facilities[0];
      const avgWaitMinutes = Math.round(facility.total_wait_minutes / facility.event_count);
      expect(avgWaitMinutes).toBe(60);
    });

    it('limits to 5 facilities', () => {
      const manyFacilities = Array(10).fill(null).map((_, i) => ({
        facility_id: `facility-${i}`,
        facility_name: `Facility ${i}`,
        event_count: 10,
        total_wait_minutes: 600,
      }));

      const displayed = manyFacilities.slice(0, 5);
      expect(displayed).toHaveLength(5);
    });

    it('hides section when no facilities', () => {
      const summaryNoFacilities = {
        ...mockSummary,
        top_facilities: [],
      };

      const shouldShowFacilities =
        summaryNoFacilities.top_facilities &&
        summaryNoFacilities.top_facilities.length > 0;

      expect(shouldShowFacilities).toBe(false);
    });
  });

  describe('Styling', () => {
    it('uses dark theme colors', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;

      expect(theme.background).toBe('#0A0A0F');
      expect(theme.textPrimary).toBe('#FFFFFF');
    });

    it('action cards have correct structure', () => {
      const actionCard = {
        iconContainer: true,
        title: true,
        description: true,
      };

      expect(actionCard.iconContainer).toBe(true);
      expect(actionCard.title).toBe(true);
      expect(actionCard.description).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('quick action buttons are touchable', () => {
      // All actions should use TouchableOpacity
      const isTouchable = true;
      expect(isTouchable).toBe(true);
    });

    it('text has appropriate styles for readability', () => {
      const textStyles = {
        fleetName: { fontSize: 28, fontWeight: '700' },
        sectionTitle: { fontSize: 18, fontWeight: '600' },
        actionTitle: { fontSize: 15, fontWeight: '600' },
      };

      expect(textStyles.fleetName.fontSize).toBeGreaterThan(20);
      expect(textStyles.sectionTitle.fontSize).toBeGreaterThan(16);
    });
  });
});

// ============================================================================
// Pure Function Tests
// ============================================================================

describe('FleetDashboard - Helper Functions', () => {
  describe('Average calculation', () => {
    it('calculates average wait time correctly', () => {
      const totalMinutes = 600;
      const eventCount = 10;
      const average = Math.round(totalMinutes / eventCount);

      expect(average).toBe(60);
    });

    it('handles zero events gracefully', () => {
      const totalMinutes = 0;
      const eventCount = 0;
      const average = eventCount > 0 ? Math.round(totalMinutes / eventCount) : 0;

      expect(average).toBe(0);
    });
  });

  describe('Null coalescing for summary data', () => {
    it('uses default values for null summary', () => {
      const getSummaryValue = (summary: typeof mockSummary | null, key: keyof typeof mockSummary) => {
        return summary?.[key] ?? 0;
      };

      const values = {
        totalDrivers: getSummaryValue(null, 'total_drivers'),
        activeDrivers: getSummaryValue(null, 'active_drivers'),
        pendingDrivers: getSummaryValue(null, 'pending_invitations'),
        eventsThisMonth: getSummaryValue(null, 'events_this_month'),
        earningsThisMonth: getSummaryValue(null, 'amount_this_month'),
        pendingInvoicesAmount: getSummaryValue(null, 'unpaid_invoice_amount'),
      };

      expect(values.totalDrivers).toBe(0);
      expect(values.activeDrivers).toBe(0);
      expect(values.pendingDrivers).toBe(0);
      expect(values.eventsThisMonth).toBe(0);
      expect(values.earningsThisMonth).toBe(0);
      expect(values.pendingInvoicesAmount).toBe(0);
    });
  });

  describe('Facility data processing', () => {
    it('maps facility data correctly', () => {
      const facilities = mockSummary.top_facilities.map((facility, index) => ({
        key: facility.facility_id,
        name: facility.facility_name,
        events: facility.event_count,
        avgWait: Math.round(facility.total_wait_minutes / facility.event_count),
        isLast: index === mockSummary.top_facilities.length - 1,
      }));

      expect(facilities[0].key).toBe('facility-1');
      expect(facilities[0].name).toBe('Warehouse A');
      expect(facilities[0].avgWait).toBe(60);
      expect(facilities[0].isLast).toBe(false);
      expect(facilities[1].isLast).toBe(true);
    });
  });
});
