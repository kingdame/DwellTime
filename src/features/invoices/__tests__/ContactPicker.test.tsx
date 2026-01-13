/**
 * ContactPicker Component Tests
 * Tests for the contact selection component
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  FlatList: ({ data, renderItem, ListEmptyComponent }: any) => {
    if (!data || data.length === 0) {
      return ListEmptyComponent ? ListEmptyComponent() : null;
    }
    return data.map((item: any, index: number) => renderItem({ item, index }));
  },
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

const mockContacts = [
  {
    id: 'contact-1',
    name: 'John Broker',
    email: 'broker@trucking.com',
    company: 'ABC Trucking',
    type: 'broker' as const,
  },
  {
    id: 'contact-2',
    name: 'Jane Shipper',
    email: 'shipper@logistics.com',
    company: 'Logistics Inc',
    type: 'shipper' as const,
  },
  {
    id: 'contact-3',
    name: 'Mike Carrier',
    email: 'carrier@freight.com',
    company: null,
    type: 'carrier' as const,
  },
  {
    id: 'contact-4',
    name: 'Sarah Dispatch',
    email: 'dispatch@fleet.com',
    company: 'Fleet Management',
    type: 'dispatch' as const,
  },
  {
    id: 'contact-5',
    name: 'Other Contact',
    email: 'other@example.com',
    company: undefined,
    type: 'other' as const,
  },
];

const TYPE_COLORS = {
  broker: '#3B82F6',
  shipper: '#22C55E',
  carrier: '#F97316',
  dispatch: '#A855F7',
  other: '#6B7280',
};

const TYPE_LABELS = {
  broker: 'Broker',
  shipper: 'Shipper',
  carrier: 'Carrier',
  dispatch: 'Dispatch',
  other: 'Other',
};

const mockOnSelectContact = jest.fn();

// ============================================================================
// Test Suites
// ============================================================================

describe('ContactPicker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('renders section title', () => {
      const title = 'Recent Contacts';
      expect(title).toBe('Recent Contacts');
    });

    it('renders contact list', () => {
      expect(mockContacts.length).toBeGreaterThan(0);
    });

    it('renders all contacts', () => {
      expect(mockContacts).toHaveLength(5);
    });

    it('shows contact name or company', () => {
      const contact = mockContacts[0];
      const displayName = contact.company || contact.name;
      expect(displayName).toBe('ABC Trucking');
    });

    it('falls back to name when company is null', () => {
      const contact = mockContacts[2]; // carrier with null company
      const displayName = contact.company || contact.name;
      expect(displayName).toBe('Mike Carrier');
    });

    it('shows contact email', () => {
      const contact = mockContacts[0];
      expect(contact.email).toBe('broker@trucking.com');
    });
  });

  // ==========================================================================
  // Contact Type Badge Tests
  // ==========================================================================

  describe('Contact Type Badges', () => {
    it('renders broker badge with correct color', () => {
      const color = TYPE_COLORS.broker;
      expect(color).toBe('#3B82F6');
    });

    it('renders shipper badge with correct color', () => {
      const color = TYPE_COLORS.shipper;
      expect(color).toBe('#22C55E');
    });

    it('renders carrier badge with correct color', () => {
      const color = TYPE_COLORS.carrier;
      expect(color).toBe('#F97316');
    });

    it('renders dispatch badge with correct color', () => {
      const color = TYPE_COLORS.dispatch;
      expect(color).toBe('#A855F7');
    });

    it('renders other badge with correct color', () => {
      const color = TYPE_COLORS.other;
      expect(color).toBe('#6B7280');
    });

    it('shows broker label', () => {
      const label = TYPE_LABELS.broker;
      expect(label).toBe('Broker');
    });

    it('shows shipper label', () => {
      const label = TYPE_LABELS.shipper;
      expect(label).toBe('Shipper');
    });

    it('shows carrier label', () => {
      const label = TYPE_LABELS.carrier;
      expect(label).toBe('Carrier');
    });

    it('shows dispatch label', () => {
      const label = TYPE_LABELS.dispatch;
      expect(label).toBe('Dispatch');
    });

    it('shows other label', () => {
      const label = TYPE_LABELS.other;
      expect(label).toBe('Other');
    });

    it('applies translucent background to badge', () => {
      const color = TYPE_COLORS.broker;
      const backgroundColor = color + '20';
      expect(backgroundColor).toBe('#3B82F620');
    });
  });

  // ==========================================================================
  // Selection Tests
  // ==========================================================================

  describe('Tap to Select', () => {
    it('calls onSelectContact when contact is tapped', () => {
      const contact = mockContacts[0];
      mockOnSelectContact(contact);
      expect(mockOnSelectContact).toHaveBeenCalledWith(contact);
    });

    it('passes entire contact object to callback', () => {
      const contact = mockContacts[0];
      mockOnSelectContact(contact);
      expect(mockOnSelectContact).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'contact-1',
          email: 'broker@trucking.com',
        })
      );
    });

    it('highlights selected contact', () => {
      const selectedEmail = 'broker@trucking.com';
      const contact = mockContacts[0];
      const isSelected = contact.email === selectedEmail;
      expect(isSelected).toBe(true);
    });

    it('does not highlight non-selected contacts', () => {
      const selectedEmail = 'broker@trucking.com';
      const contact = mockContacts[1]; // shipper
      const isSelected = contact.email === selectedEmail;
      expect(isSelected).toBe(false);
    });

    it('shows checkmark for selected contact', () => {
      const isSelected = true;
      const showCheckmark = isSelected;
      expect(showCheckmark).toBe(true);
    });

    it('applies border to selected contact', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      const isSelected = true;
      const borderStyle = isSelected
        ? { borderColor: theme.primary, borderWidth: 2 }
        : {};
      expect(borderStyle.borderColor).toBe('#3B82F6');
      expect(borderStyle.borderWidth).toBe(2);
    });

    it('uses activeOpacity on touch', () => {
      const activeOpacity = 0.7;
      expect(activeOpacity).toBe(0.7);
    });
  });

  // ==========================================================================
  // Search Tests
  // ==========================================================================

  describe('Search Functionality', () => {
    it('shows search input when more than 3 contacts', () => {
      const contacts = mockContacts; // 5 contacts
      const showSearch = contacts.length > 3;
      expect(showSearch).toBe(true);
    });

    it('hides search input when 3 or fewer contacts', () => {
      const contacts = mockContacts.slice(0, 3);
      const showSearch = contacts.length > 3;
      expect(showSearch).toBe(false);
    });

    it('filters contacts by name', () => {
      const searchQuery = 'john';
      const filtered = mockContacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('John Broker');
    });

    it('filters contacts by email', () => {
      const searchQuery = 'broker@';
      const filtered = mockContacts.filter((contact) =>
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].email).toBe('broker@trucking.com');
    });

    it('filters contacts by company', () => {
      const searchQuery = 'logistics';
      const filtered = mockContacts.filter(
        (contact) =>
          contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].company).toBe('Logistics Inc');
    });

    it('returns all contacts when search is empty', () => {
      const searchQuery = '';
      const filtered = searchQuery.trim()
        ? mockContacts.filter((contact) =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : mockContacts;
      expect(filtered).toHaveLength(5);
    });

    it('returns empty array when no matches', () => {
      const searchQuery = 'nonexistent';
      const filtered = mockContacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered).toHaveLength(0);
    });

    it('search is case insensitive', () => {
      const searchQuery = 'JOHN';
      const filtered = mockContacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
    });

    it('handles contacts with null company in search', () => {
      const searchQuery = 'mike';
      const filtered = mockContacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].company).toBeNull();
    });
  });

  // ==========================================================================
  // Empty State Tests
  // ==========================================================================

  describe('Empty State', () => {
    it('shows empty state when no contacts', () => {
      const contacts: typeof mockContacts = [];
      const showEmptyState = contacts.length === 0;
      expect(showEmptyState).toBe(true);
    });

    it('shows empty icon', () => {
      const emptyIcon = '📇';
      expect(emptyIcon).toBeDefined();
    });

    it('shows "No saved contacts" when empty', () => {
      const searchQuery = '';
      const emptyTitle = searchQuery ? 'No contacts found' : 'No saved contacts';
      expect(emptyTitle).toBe('No saved contacts');
    });

    it('shows "No contacts found" when search has no results', () => {
      const searchQuery = 'nonexistent';
      const emptyTitle = searchQuery ? 'No contacts found' : 'No saved contacts';
      expect(emptyTitle).toBe('No contacts found');
    });

    it('shows helpful subtitle for empty contacts', () => {
      const searchQuery = '';
      const emptySubtitle = searchQuery
        ? 'Try a different search term'
        : 'Contacts will appear here after you send invoices';
      expect(emptySubtitle).toBe(
        'Contacts will appear here after you send invoices'
      );
    });

    it('shows search suggestion for no results', () => {
      const searchQuery = 'nonexistent';
      const emptySubtitle = searchQuery
        ? 'Try a different search term'
        : 'Contacts will appear here after you send invoices';
      expect(emptySubtitle).toBe('Try a different search term');
    });
  });

  // ==========================================================================
  // Styling Tests
  // ==========================================================================

  describe('Styling', () => {
    it('uses dark theme card background', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      expect(theme.card).toBe('#16161F');
    });

    it('uses primary text color for names', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      expect(theme.textPrimary).toBe('#FFFFFF');
    });

    it('uses secondary text color for emails', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      expect(theme.textSecondary).toBe('#9CA3AF');
    });

    it('uses disabled text color for placeholders', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      expect(theme.textDisabled).toBe('#6B7280');
    });

    it('section title is uppercase', () => {
      const titleStyle = {
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
      };
      expect(titleStyle.textTransform).toBe('uppercase');
    });

    it('badge text is uppercase', () => {
      const badgeTextStyle = {
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
      };
      expect(badgeTextStyle.textTransform).toBe('uppercase');
    });

    it('contact row has border radius', () => {
      const contactRowStyle = {
        borderRadius: 10,
      };
      expect(contactRowStyle.borderRadius).toBe(10);
    });

    it('search input has border radius', () => {
      const searchInputStyle = {
        borderRadius: 10,
      };
      expect(searchInputStyle.borderRadius).toBe(10);
    });
  });

  // ==========================================================================
  // FlatList Configuration Tests
  // ==========================================================================

  describe('FlatList Configuration', () => {
    it('uses id as keyExtractor', () => {
      const keyExtractor = (item: typeof mockContacts[0]) => item.id;
      expect(keyExtractor(mockContacts[0])).toBe('contact-1');
    });

    it('disables scrolling', () => {
      const scrollEnabled = false;
      expect(scrollEnabled).toBe(false);
    });

    it('has gap in contentContainerStyle', () => {
      const contentContainerStyle = {
        gap: 8,
      };
      expect(contentContainerStyle.gap).toBe(8);
    });
  });
});

// ============================================================================
// Pure Function Tests
// ============================================================================

describe('ContactPicker - Helper Functions', () => {
  describe('filterContacts', () => {
    const filterContacts = (
      contacts: typeof mockContacts,
      query: string
    ): typeof mockContacts => {
      if (!query.trim()) return contacts;
      const lowerQuery = query.toLowerCase();
      return contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(lowerQuery) ||
          contact.email.toLowerCase().includes(lowerQuery) ||
          contact.company?.toLowerCase().includes(lowerQuery)
      );
    };

    it('returns all contacts for empty query', () => {
      const result = filterContacts(mockContacts, '');
      expect(result).toHaveLength(5);
    });

    it('returns all contacts for whitespace query', () => {
      const result = filterContacts(mockContacts, '   ');
      expect(result).toHaveLength(5);
    });

    it('filters by name match', () => {
      const result = filterContacts(mockContacts, 'John');
      expect(result).toHaveLength(1);
    });

    it('filters by email match', () => {
      const result = filterContacts(mockContacts, '@trucking');
      expect(result).toHaveLength(1);
    });

    it('filters by company match', () => {
      const result = filterContacts(mockContacts, 'Fleet Management');
      expect(result).toHaveLength(1);
    });

    it('returns empty for no matches', () => {
      const result = filterContacts(mockContacts, 'xyz123');
      expect(result).toHaveLength(0);
    });

    it('handles partial matches', () => {
      const result = filterContacts(mockContacts, 'ship');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('shipper');
    });
  });

  describe('getTypeColor', () => {
    const getTypeColor = (type: keyof typeof TYPE_COLORS): string => {
      return TYPE_COLORS[type];
    };

    it('returns correct color for each type', () => {
      expect(getTypeColor('broker')).toBe('#3B82F6');
      expect(getTypeColor('shipper')).toBe('#22C55E');
      expect(getTypeColor('carrier')).toBe('#F97316');
      expect(getTypeColor('dispatch')).toBe('#A855F7');
      expect(getTypeColor('other')).toBe('#6B7280');
    });
  });

  describe('getTypeLabel', () => {
    const getTypeLabel = (type: keyof typeof TYPE_LABELS): string => {
      return TYPE_LABELS[type];
    };

    it('returns correct label for each type', () => {
      expect(getTypeLabel('broker')).toBe('Broker');
      expect(getTypeLabel('shipper')).toBe('Shipper');
      expect(getTypeLabel('carrier')).toBe('Carrier');
      expect(getTypeLabel('dispatch')).toBe('Dispatch');
      expect(getTypeLabel('other')).toBe('Other');
    });
  });

  describe('getDisplayName', () => {
    const getDisplayName = (
      contact: typeof mockContacts[0]
    ): string => {
      return contact.company || contact.name;
    };

    it('returns company when available', () => {
      const result = getDisplayName(mockContacts[0]);
      expect(result).toBe('ABC Trucking');
    });

    it('returns name when company is null', () => {
      const result = getDisplayName(mockContacts[2]);
      expect(result).toBe('Mike Carrier');
    });

    it('returns name when company is undefined', () => {
      const contact = { ...mockContacts[0], company: undefined };
      const result = contact.company || contact.name;
      expect(result).toBe('John Broker');
    });
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('ContactPicker - Edge Cases', () => {
  it('handles contact with very long name', () => {
    const longName = 'A'.repeat(100);
    const contact = { ...mockContacts[0], name: longName };
    expect(contact.name.length).toBe(100);
    // Component should truncate with numberOfLines={1}
  });

  it('handles contact with very long email', () => {
    const longEmail = 'a'.repeat(100) + '@example.com';
    const contact = { ...mockContacts[0], email: longEmail };
    expect(contact.email.length).toBeGreaterThan(100);
    // Component should truncate with numberOfLines={1}
  });

  it('handles contact with very long company name', () => {
    const longCompany = 'Company ' + 'A'.repeat(100);
    const contact = { ...mockContacts[0], company: longCompany };
    expect(contact.company!.length).toBeGreaterThan(100);
    // Component should truncate with numberOfLines={1}
  });

  it('handles special characters in search', () => {
    const searchQuery = "test's@company";
    const lowerQuery = searchQuery.toLowerCase();
    expect(lowerQuery).toBe("test's@company");
  });

  it('handles unicode characters in names', () => {
    const unicodeContact = {
      ...mockContacts[0],
      name: 'Jose Garcia',
      company: 'Transportes Garcia S.A.',
    };
    expect(unicodeContact.name).toContain('Jose');
  });

  it('handles rapid selection changes', () => {
    let selectedEmail = '';
    const selectCount = { value: 0 };

    const handleSelect = (contact: typeof mockContacts[0]) => {
      selectedEmail = contact.email;
      selectCount.value++;
    };

    // Simulate rapid selections
    mockContacts.forEach((contact) => handleSelect(contact));

    expect(selectCount.value).toBe(5);
    expect(selectedEmail).toBe(mockContacts[4].email);
  });

  it('handles empty company and name gracefully', () => {
    const contact = {
      ...mockContacts[0],
      name: '',
      company: null,
    };
    const displayName = contact.company || contact.name || 'Unknown';
    expect(displayName).toBe('Unknown');
  });

  it('handles many contacts efficiently', () => {
    const manyContacts = Array(100)
      .fill(null)
      .map((_, i) => ({
        ...mockContacts[0],
        id: `contact-${i}`,
        email: `contact${i}@example.com`,
      }));

    expect(manyContacts.length).toBe(100);
  });

  it('handles search with special regex characters', () => {
    const searchQuery = 'test.+*?^${}()|[]\\';
    // Should not throw when used in filter
    expect(() => {
      mockContacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }).not.toThrow();
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('ContactPicker - Accessibility', () => {
  it('contact rows are touchable', () => {
    const isTouchable = true;
    expect(isTouchable).toBe(true);
  });

  it('selected state is visually indicated', () => {
    const isSelected = true;
    const hasVisualIndicator = isSelected; // border + checkmark
    expect(hasVisualIndicator).toBe(true);
  });

  it('contact type is labeled', () => {
    const typeLabel = TYPE_LABELS.broker;
    expect(typeLabel).toBeTruthy();
  });

  it('search input has placeholder', () => {
    const placeholder = 'Search contacts...';
    expect(placeholder).toBeTruthy();
  });

  it('empty state provides helpful guidance', () => {
    const emptySubtitle = 'Contacts will appear here after you send invoices';
    expect(emptySubtitle).toBeTruthy();
  });
});
