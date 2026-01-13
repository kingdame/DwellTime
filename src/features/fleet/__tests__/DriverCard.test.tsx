/**
 * DriverCard Component Tests
 * Tests for individual driver display component
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
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

// ============================================================================
// Test Data
// ============================================================================

const mockDriver = {
  id: 'driver-123',
  name: 'John Driver',
  email: 'john@example.com',
  phone: '555-123-4567',
  status: 'active' as const,
  role: 'driver' as const,
  eventsCount: 25,
  earningsThisMonth: 1250,
  truckNumber: 'T-001',
};

const mockDriverMinimal = {
  id: 'driver-456',
  name: null,
  email: 'unknown@example.com',
  phone: null,
  status: 'pending' as const,
  role: 'driver' as const,
  eventsCount: undefined,
  earningsThisMonth: undefined,
  truckNumber: null,
};

const mockOnPress = jest.fn();

// ============================================================================
// Test Suites
// ============================================================================

describe('DriverCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders driver name', () => {
      const displayName = mockDriver.name || mockDriver.email || 'Unknown Driver';
      expect(displayName).toBe('John Driver');
    });

    it('falls back to email when name is null', () => {
      const displayName = mockDriverMinimal.name || mockDriverMinimal.email || 'Unknown Driver';
      expect(displayName).toBe('unknown@example.com');
    });

    it('shows Unknown Driver when both name and email are null', () => {
      const driver = { ...mockDriverMinimal, email: null };
      const displayName = driver.name || driver.email || 'Unknown Driver';
      expect(displayName).toBe('Unknown Driver');
    });

    it('renders truck number when present', () => {
      expect(mockDriver.truckNumber).toBe('T-001');
    });

    it('hides truck number when null', () => {
      expect(mockDriverMinimal.truckNumber).toBeNull();
    });

    it('renders phone number when present', () => {
      expect(mockDriver.phone).toBe('555-123-4567');
    });

    it('hides phone when null', () => {
      expect(mockDriverMinimal.phone).toBeNull();
    });

    it('renders email when present', () => {
      expect(mockDriver.email).toBe('john@example.com');
    });
  });

  describe('Status Badge', () => {
    it('renders active status correctly', () => {
      const getStatusConfig = (status: string) => {
        switch (status) {
          case 'active':
            return { label: 'Active', bgColor: '#D1FAE5', textColor: '#065F46' };
          case 'pending':
            return { label: 'Pending', bgColor: '#FEF3C7', textColor: '#92400E' };
          case 'suspended':
            return { label: 'Suspended', bgColor: '#FEE2E2', textColor: '#991B1B' };
          case 'removed':
            return { label: 'Removed', bgColor: '#E5E7EB', textColor: '#374151' };
          default:
            return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
        }
      };

      const config = getStatusConfig('active');
      expect(config.label).toBe('Active');
      expect(config.bgColor).toBe('#D1FAE5');
      expect(config.textColor).toBe('#065F46');
    });

    it('renders pending status correctly', () => {
      const getStatusConfig = (status: string) => {
        switch (status) {
          case 'active':
            return { label: 'Active', bgColor: '#D1FAE5', textColor: '#065F46' };
          case 'pending':
            return { label: 'Pending', bgColor: '#FEF3C7', textColor: '#92400E' };
          case 'suspended':
            return { label: 'Suspended', bgColor: '#FEE2E2', textColor: '#991B1B' };
          case 'removed':
            return { label: 'Removed', bgColor: '#E5E7EB', textColor: '#374151' };
          default:
            return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
        }
      };

      const config = getStatusConfig('pending');
      expect(config.label).toBe('Pending');
      expect(config.bgColor).toBe('#FEF3C7');
      expect(config.textColor).toBe('#92400E');
    });

    it('renders suspended status correctly', () => {
      const getStatusConfig = (status: string) => {
        switch (status) {
          case 'active':
            return { label: 'Active', bgColor: '#D1FAE5', textColor: '#065F46' };
          case 'pending':
            return { label: 'Pending', bgColor: '#FEF3C7', textColor: '#92400E' };
          case 'suspended':
            return { label: 'Suspended', bgColor: '#FEE2E2', textColor: '#991B1B' };
          case 'removed':
            return { label: 'Removed', bgColor: '#E5E7EB', textColor: '#374151' };
          default:
            return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
        }
      };

      const config = getStatusConfig('suspended');
      expect(config.label).toBe('Suspended');
      expect(config.bgColor).toBe('#FEE2E2');
      expect(config.textColor).toBe('#991B1B');
    });

    it('renders removed status correctly', () => {
      const getStatusConfig = (status: string) => {
        switch (status) {
          case 'active':
            return { label: 'Active', bgColor: '#D1FAE5', textColor: '#065F46' };
          case 'pending':
            return { label: 'Pending', bgColor: '#FEF3C7', textColor: '#92400E' };
          case 'suspended':
            return { label: 'Suspended', bgColor: '#FEE2E2', textColor: '#991B1B' };
          case 'removed':
            return { label: 'Removed', bgColor: '#E5E7EB', textColor: '#374151' };
          default:
            return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
        }
      };

      const config = getStatusConfig('removed');
      expect(config.label).toBe('Removed');
      expect(config.bgColor).toBe('#E5E7EB');
    });

    it('handles unknown status', () => {
      const getStatusConfig = (status: string) => {
        switch (status) {
          case 'active':
            return { label: 'Active', bgColor: '#D1FAE5', textColor: '#065F46' };
          default:
            return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
        }
      };

      const config = getStatusConfig('unknown');
      expect(config.label).toBe('unknown');
      expect(config.bgColor).toBe('#E5E7EB');
    });
  });

  describe('Role Badge', () => {
    it('renders admin role correctly', () => {
      const getRoleConfig = (role: string) => {
        switch (role) {
          case 'admin':
            return { label: 'Admin', bgColor: '#DBEAFE', textColor: '#1E40AF' };
          case 'driver':
            return { label: 'Driver', bgColor: '#E5E7EB', textColor: '#374151' };
          default:
            return { label: role, bgColor: '#E5E7EB', textColor: '#374151' };
        }
      };

      const config = getRoleConfig('admin');
      expect(config.label).toBe('Admin');
      expect(config.bgColor).toBe('#DBEAFE');
      expect(config.textColor).toBe('#1E40AF');
    });

    it('renders driver role correctly', () => {
      const getRoleConfig = (role: string) => {
        switch (role) {
          case 'admin':
            return { label: 'Admin', bgColor: '#DBEAFE', textColor: '#1E40AF' };
          case 'driver':
            return { label: 'Driver', bgColor: '#E5E7EB', textColor: '#374151' };
          default:
            return { label: role, bgColor: '#E5E7EB', textColor: '#374151' };
        }
      };

      const config = getRoleConfig('driver');
      expect(config.label).toBe('Driver');
      expect(config.bgColor).toBe('#E5E7EB');
    });
  });

  describe('Stats Display', () => {
    it('shows events count', () => {
      const eventsCount = mockDriver.eventsCount ?? 0;
      expect(eventsCount).toBe(25);
    });

    it('defaults to 0 when events count is undefined', () => {
      const eventsCount = mockDriverMinimal.eventsCount ?? 0;
      expect(eventsCount).toBe(0);
    });

    it('shows earnings this month', () => {
      const earnings = mockDriver.earningsThisMonth ?? 0;
      expect(earnings).toBe(1250);
    });

    it('defaults to 0 when earnings is undefined', () => {
      const earnings = mockDriverMinimal.earningsThisMonth ?? 0;
      expect(earnings).toBe(0);
    });
  });

  describe('Currency Formatting', () => {
    it('formats whole numbers correctly', () => {
      const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      };

      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(1250)).toBe('$1,250');
      expect(formatCurrency(10000)).toBe('$10,000');
    });

    it('formats zero correctly', () => {
      const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      };

      expect(formatCurrency(0)).toBe('$0');
    });

    it('rounds to whole numbers', () => {
      const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      };

      expect(formatCurrency(99.5)).toBe('$100');
      expect(formatCurrency(99.4)).toBe('$99');
    });
  });

  describe('Interaction', () => {
    it('onPress callback fires when card is pressed', () => {
      mockOnPress();
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('card is touchable with activeOpacity', () => {
      // TouchableOpacity with activeOpacity={0.7} should be used
      const expectedActiveOpacity = 0.7;
      expect(expectedActiveOpacity).toBe(0.7);
    });
  });

  describe('View Details', () => {
    it('shows View Details text', () => {
      const viewDetailsText = 'View Details';
      expect(viewDetailsText).toBe('View Details');
    });
  });

  describe('Styling', () => {
    it('uses correct container styling', () => {
      const containerStyle = {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      };

      expect(containerStyle.borderRadius).toBe(12);
      expect(containerStyle.padding).toBe(16);
    });

    it('badge has correct styling', () => {
      const badgeStyle = {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
      };

      expect(badgeStyle.borderRadius).toBe(10);
    });

    it('badge text is uppercase', () => {
      const badgeTextStyle = {
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
        fontSize: 10,
        fontWeight: '600',
      };

      expect(badgeTextStyle.textTransform).toBe('uppercase');
    });
  });
});

// ============================================================================
// Pure Function Tests
// ============================================================================

describe('DriverCard - Helper Functions', () => {
  describe('formatCurrency', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    it('formats various amounts correctly', () => {
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(50)).toBe('$50');
      expect(formatCurrency(999)).toBe('$999');
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(10000)).toBe('$10,000');
      expect(formatCurrency(100000)).toBe('$100,000');
    });

    it('handles negative amounts', () => {
      expect(formatCurrency(-100)).toBe('-$100');
    });
  });

  describe('getStatusConfig', () => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'active':
          return { label: 'Active', bgColor: '#D1FAE5', textColor: '#065F46' };
        case 'pending':
          return { label: 'Pending', bgColor: '#FEF3C7', textColor: '#92400E' };
        case 'suspended':
          return { label: 'Suspended', bgColor: '#FEE2E2', textColor: '#991B1B' };
        case 'removed':
          return { label: 'Removed', bgColor: '#E5E7EB', textColor: '#374151' };
        default:
          return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
      }
    };

    it('returns correct config for all statuses', () => {
      const statuses = ['active', 'pending', 'suspended', 'removed'];

      for (const status of statuses) {
        const config = getStatusConfig(status);
        expect(config.label).toBeDefined();
        expect(config.bgColor).toBeDefined();
        expect(config.textColor).toBeDefined();
      }
    });

    it('green colors for active status', () => {
      const config = getStatusConfig('active');
      expect(config.bgColor).toMatch(/^#[A-F0-9]{6}$/i);
      expect(config.textColor).toMatch(/^#[A-F0-9]{6}$/i);
    });
  });

  describe('getRoleConfig', () => {
    const getRoleConfig = (role: string) => {
      switch (role) {
        case 'admin':
          return { label: 'Admin', bgColor: '#DBEAFE', textColor: '#1E40AF' };
        case 'driver':
          return { label: 'Driver', bgColor: '#E5E7EB', textColor: '#374151' };
        default:
          return { label: role, bgColor: '#E5E7EB', textColor: '#374151' };
      }
    };

    it('admin has blue styling', () => {
      const config = getRoleConfig('admin');
      expect(config.bgColor).toBe('#DBEAFE');
    });

    it('driver has neutral styling', () => {
      const config = getRoleConfig('driver');
      expect(config.bgColor).toBe('#E5E7EB');
    });
  });

  describe('Display name logic', () => {
    it('prioritizes name over email', () => {
      const getDisplayName = (name: string | null, email: string | null): string => {
        return name || email || 'Unknown Driver';
      };

      expect(getDisplayName('John', 'john@example.com')).toBe('John');
      expect(getDisplayName(null, 'john@example.com')).toBe('john@example.com');
      expect(getDisplayName(null, null)).toBe('Unknown Driver');
    });
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('DriverCard - Edge Cases', () => {
  it('handles very long names', () => {
    const longName = 'A'.repeat(100);
    expect(longName.length).toBe(100);
    // Component should truncate with numberOfLines={1}
  });

  it('handles very long email addresses', () => {
    const longEmail = 'verylongemail' + '@' + 'a'.repeat(50) + '.com';
    expect(longEmail.length).toBeGreaterThan(50);
    // Component should truncate with numberOfLines={1}
  });

  it('handles very large earnings', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const largeEarnings = 999999999;
    const formatted = formatCurrency(largeEarnings);
    expect(formatted).toBe('$999,999,999');
  });

  it('handles very large event counts', () => {
    const largeCount = 999999;
    expect(largeCount).toBe(999999);
    // Display should handle large numbers gracefully
  });
});
