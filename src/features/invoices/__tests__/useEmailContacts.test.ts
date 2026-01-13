/**
 * useEmailContacts Hook Tests
 * Tests for React Query email contact hooks
 */

// Mock React Query before imports
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
// Query client is used via mock below
const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
  useMutation: (options: any) => mockUseMutation(options),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// Mock auth store
const mockAuthStore = {
  user: { id: 'user-123', email: 'test@example.com' },
};

jest.mock('@/features/auth/store', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock email service
const mockFetchEmailContacts = jest.fn();
const mockSaveEmailContact = jest.fn();
const mockDeleteEmailContact = jest.fn();
const mockIncrementContactUsage = jest.fn();
const mockSearchEmailContacts = jest.fn();
const mockGetFrequentContacts = jest.fn();

jest.mock('../services/emailService', () => ({
  fetchEmailContacts: (...args: any[]) => mockFetchEmailContacts(...args),
  saveEmailContact: (...args: any[]) => mockSaveEmailContact(...args),
  deleteEmailContact: (...args: any[]) => mockDeleteEmailContact(...args),
  incrementContactUsage: (...args: any[]) => mockIncrementContactUsage(...args),
  searchEmailContacts: (...args: any[]) => mockSearchEmailContacts(...args),
  getFrequentContacts: (...args: any[]) => mockGetFrequentContacts(...args),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockUserId = 'user-123';

const mockContact = {
  id: 'contact-123',
  user_id: mockUserId,
  email: 'broker@trucking.com',
  name: 'John Broker',
  company: 'ABC Trucking',
  contact_type: 'broker' as const,
  use_count: 5,
  last_used_at: '2024-01-15T10:30:00Z',
  created_at: '2024-01-01T00:00:00Z',
};

const mockContacts = [
  mockContact,
  {
    id: 'contact-124',
    user_id: mockUserId,
    email: 'shipper@logistics.com',
    name: 'Jane Shipper',
    company: 'Logistics Inc',
    contact_type: 'shipper' as const,
    use_count: 3,
    last_used_at: '2024-01-14T08:00:00Z',
    created_at: '2024-01-02T00:00:00Z',
  },
];

const CONTACTS_KEY = ['email-contacts'];

// ============================================================================
// Test Suites
// ============================================================================

describe('useEmailContacts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.user = { id: mockUserId, email: 'test@example.com' };
  });

  // ==========================================================================
  // useEmailContacts Tests
  // ==========================================================================

  describe('useEmailContacts', () => {
    it('calls useQuery with correct query key', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      useEmailContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: [...CONTACTS_KEY, mockUserId],
        })
      );
    });

    it('uses fetchEmailContacts as queryFn', async () => {
      mockUseQuery.mockImplementation((options) => {
        // Simulate calling the queryFn
        if (options.enabled !== false) {
          options.queryFn();
        }
        return { data: mockContacts, isLoading: false, error: null };
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      useEmailContacts();

      expect(mockFetchEmailContacts).toHaveBeenCalledWith(mockUserId);
    });

    it('is disabled when user is not authenticated', async () => {
      mockAuthStore.user = null as any;

      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      useEmailContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('is enabled when user is authenticated', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      useEmailContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        })
      );
    });

    it('has staleTime of 5 minutes', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      useEmailContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 5 * 60 * 1000,
        })
      );
    });

    it('returns contacts data', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      const result = useEmailContacts();

      expect(result.data).toEqual(mockContacts);
    });

    it('returns loading state', async () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      const result = useEmailContacts();

      expect(result.isLoading).toBe(true);
    });

    it('returns error state', async () => {
      const error = new Error('Failed to fetch contacts');
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      const result = useEmailContacts();

      expect(result.error).toBe(error);
    });

    it('handles empty user id', async () => {
      mockAuthStore.user = { id: '', email: '' } as any;

      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { useEmailContacts } = await import('../hooks/useEmailContacts');
      useEmailContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });
  });

  // ==========================================================================
  // useSearchContacts Tests
  // ==========================================================================

  describe('useSearchContacts', () => {
    it('calls useQuery with search query in key', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useSearchContacts } = await import('../hooks/useEmailContacts');
      useSearchContacts('broker');

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['search', mockUserId, 'broker']),
        })
      );
    });

    it('uses searchEmailContacts as queryFn', async () => {
      mockUseQuery.mockImplementation((options) => {
        if (options.enabled !== false) {
          options.queryFn();
        }
        return { data: mockContacts, isLoading: false, error: null };
      });

      const { useSearchContacts } = await import('../hooks/useEmailContacts');
      useSearchContacts('broker');

      expect(mockSearchEmailContacts).toHaveBeenCalledWith(mockUserId, 'broker');
    });

    it('is disabled when query length is less than 2', async () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { useSearchContacts } = await import('../hooks/useEmailContacts');
      useSearchContacts('a');

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('is enabled when query length is 2 or more', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useSearchContacts } = await import('../hooks/useEmailContacts');
      useSearchContacts('ab');

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        })
      );
    });

    it('is disabled when user is not authenticated', async () => {
      mockAuthStore.user = null as any;

      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { useSearchContacts } = await import('../hooks/useEmailContacts');
      useSearchContacts('broker');

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('has staleTime of 30 seconds', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useSearchContacts } = await import('../hooks/useEmailContacts');
      useSearchContacts('broker');

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 30 * 1000,
        })
      );
    });

    it('returns search results', async () => {
      mockUseQuery.mockReturnValue({
        data: [mockContact],
        isLoading: false,
        error: null,
      });

      const { useSearchContacts } = await import('../hooks/useEmailContacts');
      const result = useSearchContacts('broker');

      expect(result.data).toEqual([mockContact]);
    });
  });

  // ==========================================================================
  // useFrequentContacts Tests
  // ==========================================================================

  describe('useFrequentContacts', () => {
    it('calls useQuery with frequent in key', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useFrequentContacts } = await import('../hooks/useEmailContacts');
      useFrequentContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['frequent', mockUserId]),
        })
      );
    });

    it('uses default limit of 5', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useFrequentContacts } = await import('../hooks/useEmailContacts');
      useFrequentContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining([5]),
        })
      );
    });

    it('accepts custom limit parameter', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useFrequentContacts } = await import('../hooks/useEmailContacts');
      useFrequentContacts(10);

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining([10]),
        })
      );
    });

    it('uses getFrequentContacts as queryFn', async () => {
      mockUseQuery.mockImplementation((options) => {
        if (options.enabled !== false) {
          options.queryFn();
        }
        return { data: mockContacts, isLoading: false, error: null };
      });

      const { useFrequentContacts } = await import('../hooks/useEmailContacts');
      useFrequentContacts(5);

      expect(mockGetFrequentContacts).toHaveBeenCalledWith(mockUserId, 5);
    });

    it('is disabled when user is not authenticated', async () => {
      mockAuthStore.user = null as any;

      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { useFrequentContacts } = await import('../hooks/useEmailContacts');
      useFrequentContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('has staleTime of 5 minutes', async () => {
      mockUseQuery.mockReturnValue({
        data: mockContacts,
        isLoading: false,
        error: null,
      });

      const { useFrequentContacts } = await import('../hooks/useEmailContacts');
      useFrequentContacts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 5 * 60 * 1000,
        })
      );
    });
  });

  // ==========================================================================
  // useSaveContact Tests
  // ==========================================================================

  describe('useSaveContact', () => {
    it('uses useMutation hook', async () => {
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      });

      const { useSaveContact } = await import('../hooks/useEmailContacts');
      useSaveContact();

      expect(mockUseMutation).toHaveBeenCalled();
    });

    it('calls saveEmailContact with user_id', async () => {
      mockUseMutation.mockImplementation((options) => {
        return {
          mutate: (input: any) => {
            options.mutationFn(input);
          },
          isPending: false,
        };
      });

      const { useSaveContact } = await import('../hooks/useEmailContacts');
      const { mutate } = useSaveContact();

      mutate({
        email: 'new@example.com',
        name: 'New Contact',
      });

      expect(mockSaveEmailContact).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'New Contact',
        user_id: mockUserId,
      });
    });

    it('invalidates queries on success', async () => {
      let onSuccessCallback: () => void;

      mockUseMutation.mockImplementation((options) => {
        onSuccessCallback = options.onSuccess;
        return {
          mutate: jest.fn(),
          isPending: false,
        };
      });

      const { useSaveContact } = await import('../hooks/useEmailContacts');
      useSaveContact();

      // Simulate success callback
      onSuccessCallback!();

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: CONTACTS_KEY,
      });
    });

    it('returns mutation function', async () => {
      const mockMutateFn = jest.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutateFn,
        isPending: false,
      });

      const { useSaveContact } = await import('../hooks/useEmailContacts');
      const { mutate } = useSaveContact();

      expect(mutate).toBe(mockMutateFn);
    });

    it('returns loading state', async () => {
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
      });

      const { useSaveContact } = await import('../hooks/useEmailContacts');
      const { isPending } = useSaveContact();

      expect(isPending).toBe(true);
    });
  });

  // ==========================================================================
  // useDeleteContact Tests
  // ==========================================================================

  describe('useDeleteContact', () => {
    it('uses useMutation hook', async () => {
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });

      const { useDeleteContact } = await import('../hooks/useEmailContacts');
      useDeleteContact();

      expect(mockUseMutation).toHaveBeenCalled();
    });

    it('calls deleteEmailContact as mutationFn', async () => {
      mockUseMutation.mockImplementation((options) => {
        return {
          mutate: (contactId: string) => {
            options.mutationFn(contactId);
          },
          isPending: false,
        };
      });

      const { useDeleteContact } = await import('../hooks/useEmailContacts');
      const { mutate } = useDeleteContact();

      mutate('contact-123');

      expect(mockDeleteEmailContact).toHaveBeenCalledWith('contact-123');
    });

    it('invalidates queries on success', async () => {
      let onSuccessCallback: () => void;

      mockUseMutation.mockImplementation((options) => {
        onSuccessCallback = options.onSuccess;
        return {
          mutate: jest.fn(),
          isPending: false,
        };
      });

      const { useDeleteContact } = await import('../hooks/useEmailContacts');
      useDeleteContact();

      // Simulate success callback
      onSuccessCallback!();

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: CONTACTS_KEY,
      });
    });

    it('returns mutation function', async () => {
      const mockMutateFn = jest.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutateFn,
        isPending: false,
      });

      const { useDeleteContact } = await import('../hooks/useEmailContacts');
      const { mutate } = useDeleteContact();

      expect(mutate).toBe(mockMutateFn);
    });

    it('returns loading state', async () => {
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
      });

      const { useDeleteContact } = await import('../hooks/useEmailContacts');
      const { isPending } = useDeleteContact();

      expect(isPending).toBe(true);
    });
  });

  // ==========================================================================
  // useIncrementContactUsage Tests
  // ==========================================================================

  describe('useIncrementContactUsage', () => {
    it('uses useMutation hook', async () => {
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      });

      const { useIncrementContactUsage } = await import('../hooks/useEmailContacts');
      useIncrementContactUsage();

      expect(mockUseMutation).toHaveBeenCalled();
    });

    it('calls incrementContactUsage as mutationFn', async () => {
      mockUseMutation.mockImplementation((options) => {
        return {
          mutate: (contactId: string) => {
            options.mutationFn(contactId);
          },
          isLoading: false,
        };
      });

      const { useIncrementContactUsage } = await import('../hooks/useEmailContacts');
      const { mutate } = useIncrementContactUsage();

      mutate('contact-123');

      expect(mockIncrementContactUsage).toHaveBeenCalledWith('contact-123');
    });

    it('invalidates queries on success', async () => {
      let onSuccessCallback: () => void;

      mockUseMutation.mockImplementation((options) => {
        onSuccessCallback = options.onSuccess;
        return {
          mutate: jest.fn(),
          isLoading: false,
        };
      });

      const { useIncrementContactUsage } = await import('../hooks/useEmailContacts');
      useIncrementContactUsage();

      // Simulate success callback
      onSuccessCallback!();

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: CONTACTS_KEY,
      });
    });

    it('returns mutation function', async () => {
      const mockMutateFn = jest.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutateFn,
        isLoading: false,
      });

      const { useIncrementContactUsage } = await import('../hooks/useEmailContacts');
      const { mutate } = useIncrementContactUsage();

      expect(mutate).toBe(mockMutateFn);
    });
  });
});

// ============================================================================
// Query Key Tests
// ============================================================================

describe('useEmailContacts - Query Keys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.user = { id: mockUserId, email: 'test@example.com' };
  });

  it('useEmailContacts uses CONTACTS_KEY with userId', async () => {
    mockUseQuery.mockReturnValue({
      data: mockContacts,
      isLoading: false,
      error: null,
    });

    const { useEmailContacts } = await import('../hooks/useEmailContacts');
    useEmailContacts();

    const calledOptions = mockUseQuery.mock.calls[0][0];
    expect(calledOptions.queryKey).toContain('email-contacts');
    expect(calledOptions.queryKey).toContain(mockUserId);
  });

  it('useSearchContacts includes search term in key', async () => {
    mockUseQuery.mockReturnValue({
      data: mockContacts,
      isLoading: false,
      error: null,
    });

    const { useSearchContacts } = await import('../hooks/useEmailContacts');
    useSearchContacts('test-query');

    const calledOptions = mockUseQuery.mock.calls[0][0];
    expect(calledOptions.queryKey).toContain('test-query');
    expect(calledOptions.queryKey).toContain('search');
  });

  it('useFrequentContacts includes limit in key', async () => {
    mockUseQuery.mockReturnValue({
      data: mockContacts,
      isLoading: false,
      error: null,
    });

    const { useFrequentContacts } = await import('../hooks/useEmailContacts');
    useFrequentContacts(3);

    const calledOptions = mockUseQuery.mock.calls[0][0];
    expect(calledOptions.queryKey).toContain('frequent');
    expect(calledOptions.queryKey).toContain(3);
  });
});

// ============================================================================
// Cache Invalidation Tests
// ============================================================================

describe('useEmailContacts - Cache Invalidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.user = { id: mockUserId, email: 'test@example.com' };
  });

  it('all mutations invalidate CONTACTS_KEY', async () => {
    let callbacks: (() => void)[] = [];

    mockUseMutation.mockImplementation((options) => {
      callbacks.push(options.onSuccess);
      return {
        mutate: jest.fn(),
        isLoading: false,
      };
    });

    const { useSaveContact, useDeleteContact, useIncrementContactUsage } =
      await import('../hooks/useEmailContacts');

    useSaveContact();
    useDeleteContact();
    useIncrementContactUsage();

    // Trigger all success callbacks
    callbacks.forEach((cb) => cb());

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(3);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: CONTACTS_KEY,
    });
  });
});

// ============================================================================
// Type Export Tests
// ============================================================================

describe('useEmailContacts - Type Exports', () => {
  it('module exports hook functions', async () => {
    const module = await import('../hooks/useEmailContacts');
    // Verify hook functions are exported
    expect(typeof module.useEmailContacts).toBe('function');
    expect(typeof module.useSaveContact).toBe('function');
    expect(typeof module.useDeleteContact).toBe('function');
  });

  it('module loads without errors', async () => {
    // Type exports (EmailContact, EmailContactInput) are compile-time only
    // This test verifies the module loads correctly
    const module = await import('../hooks/useEmailContacts');
    expect(module).toBeDefined();
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('useEmailContacts - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles user becoming authenticated', async () => {
    mockAuthStore.user = null as any;

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const { useEmailContacts } = await import('../hooks/useEmailContacts');
    useEmailContacts();

    // First call - disabled
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );

    // Simulate authentication
    mockAuthStore.user = { id: mockUserId, email: 'test@example.com' };
    jest.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: mockContacts,
      isLoading: false,
      error: null,
    });

    useEmailContacts();

    // Second call - enabled
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    );
  });

  it('handles search query changing', async () => {
    mockAuthStore.user = { id: mockUserId, email: 'test@example.com' };

    mockUseQuery.mockReturnValue({
      data: mockContacts,
      isLoading: false,
      error: null,
    });

    const { useSearchContacts } = await import('../hooks/useEmailContacts');

    useSearchContacts('ab');
    const firstCall = mockUseQuery.mock.calls[0][0];

    jest.clearAllMocks();

    useSearchContacts('abc');
    const secondCall = mockUseQuery.mock.calls[0][0];

    expect(firstCall.queryKey).not.toEqual(secondCall.queryKey);
  });

  it('handles frequent contacts limit changing', async () => {
    mockAuthStore.user = { id: mockUserId, email: 'test@example.com' };

    mockUseQuery.mockReturnValue({
      data: mockContacts,
      isLoading: false,
      error: null,
    });

    const { useFrequentContacts } = await import('../hooks/useEmailContacts');

    useFrequentContacts(5);
    const firstCall = mockUseQuery.mock.calls[0][0];

    jest.clearAllMocks();

    useFrequentContacts(10);
    const secondCall = mockUseQuery.mock.calls[0][0];

    expect(firstCall.queryKey).not.toEqual(secondCall.queryKey);
  });
});

// ============================================================================
// Integration Pattern Tests
// ============================================================================

describe('useEmailContacts - Integration Patterns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.user = { id: mockUserId, email: 'test@example.com' };
  });

  it('save contact workflow', async () => {
    let mutationCallback: (input: any) => void;
    let successCallback: () => void;

    mockUseMutation.mockImplementation((options) => {
      mutationCallback = options.mutationFn;
      successCallback = options.onSuccess;
      return {
        mutate: (input: any) => {
          mutationCallback(input);
          successCallback();
        },
        isLoading: false,
      };
    });

    const { useSaveContact } = await import('../hooks/useEmailContacts');
    const { mutate } = useSaveContact();

    mutate({
      email: 'new@example.com',
      name: 'New Contact',
    });

    // Verify save was called
    expect(mockSaveEmailContact).toHaveBeenCalled();

    // Verify cache was invalidated
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('delete contact workflow', async () => {
    let mutationCallback: (input: any) => void;
    let successCallback: () => void;

    mockUseMutation.mockImplementation((options) => {
      mutationCallback = options.mutationFn;
      successCallback = options.onSuccess;
      return {
        mutate: (input: any) => {
          mutationCallback(input);
          successCallback();
        },
        isLoading: false,
      };
    });

    const { useDeleteContact } = await import('../hooks/useEmailContacts');
    const { mutate } = useDeleteContact();

    mutate('contact-123');

    // Verify delete was called
    expect(mockDeleteEmailContact).toHaveBeenCalledWith('contact-123');

    // Verify cache was invalidated
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('increment usage workflow', async () => {
    let mutationCallback: (input: any) => void;
    let successCallback: () => void;

    mockUseMutation.mockImplementation((options) => {
      mutationCallback = options.mutationFn;
      successCallback = options.onSuccess;
      return {
        mutate: (input: any) => {
          mutationCallback(input);
          successCallback();
        },
        isLoading: false,
      };
    });

    const { useIncrementContactUsage } = await import('../hooks/useEmailContacts');
    const { mutate } = useIncrementContactUsage();

    mutate('contact-123');

    // Verify increment was called
    expect(mockIncrementContactUsage).toHaveBeenCalledWith('contact-123');

    // Verify cache was invalidated
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });
});
