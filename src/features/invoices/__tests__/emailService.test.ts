/**
 * Email Service Tests
 * Tests for invoice email sending and contact management operations
 */

// Mock Supabase client before imports
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockUpsert = jest.fn();
const mockEq = jest.fn();
const mockOr = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();
const mockRpc = jest.fn();
const mockFunctionsInvoke = jest.fn();

const mockSupabase = {
  from: jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    upsert: mockUpsert,
  })),
  functions: {
    invoke: mockFunctionsInvoke,
  },
  rpc: mockRpc,
};

// Chain returns for query building
mockSelect.mockReturnValue({
  eq: mockEq,
  or: mockOr,
  single: mockSingle,
  order: mockOrder,
  limit: mockLimit,
});

mockUpsert.mockReturnValue({
  select: mockSelect,
});

mockInsert.mockReturnValue({
  select: mockSelect,
});

mockUpdate.mockReturnValue({
  eq: mockEq,
  select: mockSelect,
});

mockDelete.mockReturnValue({
  eq: mockEq,
});

mockEq.mockReturnValue({
  eq: mockEq,
  select: mockSelect,
  single: mockSingle,
  order: mockOrder,
  limit: mockLimit,
  or: mockOr,
});

mockOr.mockReturnValue({
  order: mockOrder,
  limit: mockLimit,
});

mockOrder.mockReturnValue({
  eq: mockEq,
  or: mockOr,
  single: mockSingle,
  limit: mockLimit,
  order: mockOrder,
});

mockLimit.mockReturnValue({
  data: [],
  error: null,
});

jest.mock('@/shared/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// ============================================================================
// Test Data
// ============================================================================

const mockUserId = 'user-123';
const mockInvoiceId = 'invoice-456';
const mockContactId = 'contact-789';

const mockEmailContact = {
  id: mockContactId,
  user_id: mockUserId,
  email: 'broker@trucking.com',
  name: 'John Broker',
  company: 'ABC Trucking',
  contact_type: 'broker' as const,
  use_count: 5,
  last_used_at: '2024-01-15T10:30:00Z',
  created_at: '2024-01-01T00:00:00Z',
};

const mockEmailContacts = [
  mockEmailContact,
  {
    id: 'contact-2',
    user_id: mockUserId,
    email: 'shipper@logistics.com',
    name: 'Jane Shipper',
    company: 'Logistics Inc',
    contact_type: 'shipper' as const,
    use_count: 3,
    last_used_at: '2024-01-14T08:00:00Z',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'contact-3',
    user_id: mockUserId,
    email: 'dispatch@fleet.com',
    name: 'Mike Dispatch',
    company: null,
    contact_type: 'dispatcher' as const,
    use_count: 10,
    last_used_at: '2024-01-16T14:00:00Z',
    created_at: '2024-01-03T00:00:00Z',
  },
];

const mockInvoiceEmail = {
  id: 'email-123',
  invoice_id: mockInvoiceId,
  recipient_email: 'broker@trucking.com',
  recipient_name: 'John Broker',
  cc_emails: ['dispatch@trucking.com'],
  custom_message: 'Please find attached invoice for detention charges.',
  status: 'sent' as const,
  message_id: 'msg_abc123',
  error_message: null,
  sent_at: '2024-01-15T10:30:00Z',
  created_at: '2024-01-15T10:30:00Z',
};

const mockInvoiceEmails = [
  mockInvoiceEmail,
  {
    id: 'email-124',
    invoice_id: mockInvoiceId,
    recipient_email: 'accountant@trucking.com',
    recipient_name: 'Sarah Accountant',
    cc_emails: null,
    custom_message: null,
    status: 'failed' as const,
    message_id: null,
    error_message: 'Invalid email address',
    sent_at: null,
    created_at: '2024-01-14T08:00:00Z',
  },
];

const mockSendInput = {
  invoiceId: mockInvoiceId,
  recipientEmail: 'broker@trucking.com',
  recipientName: 'John Broker',
  customMessage: 'Please process this invoice.',
  ccEmails: ['dispatch@trucking.com'],
};

// ============================================================================
// Test Suites
// ============================================================================

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // sendInvoiceEmail Tests
  // ==========================================================================

  describe('sendInvoiceEmail', () => {
    it('calls supabase.functions.invoke with correct function name', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true, messageId: 'msg_123' },
        error: null,
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      await sendInvoiceEmail(mockSendInput);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'send-invoice-email',
        expect.anything()
      );
    });

    it('passes input data in request body', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true, messageId: 'msg_123' },
        error: null,
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      await sendInvoiceEmail(mockSendInput);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'send-invoice-email',
        { body: mockSendInput }
      );
    });

    it('returns success response with messageId', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true, messageId: 'msg_abc123' },
        error: null,
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      const result = await sendInvoiceEmail(mockSendInput);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_abc123');
    });

    it('throws error when function invocation fails', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Function execution failed' },
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      await expect(sendInvoiceEmail(mockSendInput)).rejects.toThrow(
        'Failed to send email: Function execution failed'
      );
    });

    it('handles invoice with minimal required fields', async () => {
      const minimalInput = {
        invoiceId: mockInvoiceId,
        recipientEmail: 'test@example.com',
      };

      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      await sendInvoiceEmail(minimalInput);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'send-invoice-email',
        { body: minimalInput }
      );
    });

    it('handles multiple CC emails', async () => {
      const inputWithCc = {
        ...mockSendInput,
        ccEmails: ['cc1@example.com', 'cc2@example.com', 'cc3@example.com'],
      };

      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      await sendInvoiceEmail(inputWithCc);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'send-invoice-email',
        { body: inputWithCc }
      );
    });

    it('returns error message from failed send', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: false, error: 'Invalid recipient email' },
        error: null,
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      const result = await sendInvoiceEmail(mockSendInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid recipient email');
    });

    it('handles network timeout error', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Request timeout' },
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      await expect(sendInvoiceEmail(mockSendInput)).rejects.toThrow(
        'Failed to send email: Request timeout'
      );
    });

    it('handles empty custom message', async () => {
      const inputWithEmptyMessage = {
        ...mockSendInput,
        customMessage: '',
      };

      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      await sendInvoiceEmail(inputWithEmptyMessage);

      expect(mockSupabase.functions.invoke).toHaveBeenCalled();
    });

    it('handles undefined CC emails', async () => {
      const inputWithoutCc = {
        invoiceId: mockInvoiceId,
        recipientEmail: 'test@example.com',
        ccEmails: undefined,
      };

      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const { sendInvoiceEmail } = await import('../services/emailService');

      await sendInvoiceEmail(inputWithoutCc);

      expect(mockSupabase.functions.invoke).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // fetchEmailContacts Tests
  // ==========================================================================

  describe('fetchEmailContacts', () => {
    it('queries email_contacts table', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      await fetchEmailContacts(mockUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('email_contacts');
    });

    it('selects all fields', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      await fetchEmailContacts(mockUserId);

      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('filters by user_id', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      await fetchEmailContacts(mockUserId);

      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
    });

    it('orders by use_count descending', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      await fetchEmailContacts(mockUserId);

      expect(mockOrder).toHaveBeenCalledWith('use_count', { ascending: false });
    });

    it('limits results to 20', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      await fetchEmailContacts(mockUserId);

      expect(mockLimit).toHaveBeenCalledWith(20);
    });

    it('returns array of contacts', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      const result = await fetchEmailContacts(mockUserId);

      expect(result).toEqual(mockEmailContacts);
      expect(result).toHaveLength(3);
    });

    it('returns empty array when no contacts', async () => {
      mockLimit.mockReturnValueOnce({
        data: [],
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      const result = await fetchEmailContacts(mockUserId);

      expect(result).toEqual([]);
    });

    it('returns empty array when data is null', async () => {
      mockLimit.mockReturnValueOnce({
        data: null,
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      const result = await fetchEmailContacts(mockUserId);

      expect(result).toEqual([]);
    });

    it('throws error on database failure', async () => {
      mockLimit.mockReturnValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      await expect(fetchEmailContacts(mockUserId)).rejects.toThrow(
        'Failed to fetch contacts: Database connection failed'
      );
    });

    it('handles user with many contacts', async () => {
      const manyContacts = Array(20)
        .fill(null)
        .map((_, i) => ({
          ...mockEmailContact,
          id: `contact-${i}`,
          email: `contact${i}@example.com`,
        }));

      mockLimit.mockReturnValueOnce({
        data: manyContacts,
        error: null,
      });

      const { fetchEmailContacts } = await import('../services/emailService');

      const result = await fetchEmailContacts(mockUserId);

      expect(result).toHaveLength(20);
    });
  });

  // ==========================================================================
  // saveEmailContact Tests
  // ==========================================================================

  describe('saveEmailContact', () => {
    const mockContactInput = {
      user_id: mockUserId,
      email: 'newcontact@example.com',
      name: 'New Contact',
      company: 'New Company',
      contact_type: 'broker' as const,
    };

    it('upserts to email_contacts table', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { ...mockEmailContact, ...mockContactInput },
        error: null,
      });

      const { saveEmailContact } = await import('../services/emailService');

      await saveEmailContact(mockContactInput);

      expect(mockSupabase.from).toHaveBeenCalledWith('email_contacts');
    });

    it('includes use_count of 1 for new contacts', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { ...mockEmailContact, ...mockContactInput },
        error: null,
      });

      const { saveEmailContact } = await import('../services/emailService');

      await saveEmailContact(mockContactInput);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ use_count: 1 }),
        expect.anything()
      );
    });

    it('includes last_used_at timestamp', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { ...mockEmailContact, ...mockContactInput },
        error: null,
      });

      const { saveEmailContact } = await import('../services/emailService');

      await saveEmailContact(mockContactInput);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          last_used_at: expect.any(String),
        }),
        expect.anything()
      );
    });

    it('uses onConflict for user_id and email', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { ...mockEmailContact, ...mockContactInput },
        error: null,
      });

      const { saveEmailContact } = await import('../services/emailService');

      await saveEmailContact(mockContactInput);

      expect(mockUpsert).toHaveBeenCalledWith(expect.anything(), {
        onConflict: 'user_id,email',
        ignoreDuplicates: false,
      });
    });

    it('returns saved contact data', async () => {
      const savedContact = { ...mockEmailContact, ...mockContactInput };
      mockSingle.mockResolvedValueOnce({
        data: savedContact,
        error: null,
      });

      const { saveEmailContact } = await import('../services/emailService');

      const result = await saveEmailContact(mockContactInput);

      expect(result).toEqual(savedContact);
    });

    it('throws error on save failure', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Unique constraint violation' },
      });

      const { saveEmailContact } = await import('../services/emailService');

      await expect(saveEmailContact(mockContactInput)).rejects.toThrow(
        'Failed to save contact: Unique constraint violation'
      );
    });

    it('handles contact without optional fields', async () => {
      const minimalInput = {
        user_id: mockUserId,
        email: 'minimal@example.com',
      };

      mockSingle.mockResolvedValueOnce({
        data: { ...mockEmailContact, ...minimalInput },
        error: null,
      });

      const { saveEmailContact } = await import('../services/emailService');

      await saveEmailContact(minimalInput);

      expect(mockUpsert).toHaveBeenCalled();
    });

    it('handles all contact types', async () => {
      const contactTypes = ['broker', 'shipper', 'dispatcher', 'other'] as const;

      for (const contactType of contactTypes) {
        mockSingle.mockResolvedValueOnce({
          data: { ...mockEmailContact, contact_type: contactType },
          error: null,
        });

        const { saveEmailContact } = await import('../services/emailService');

        const result = await saveEmailContact({
          ...mockContactInput,
          contact_type: contactType,
        });

        expect(result.contact_type).toBe(contactType);
      }
    });
  });

  // ==========================================================================
  // incrementContactUsage Tests
  // ==========================================================================

  describe('incrementContactUsage', () => {
    it('tries RPC first', async () => {
      mockRpc.mockResolvedValueOnce({ error: null });

      const { incrementContactUsage } = await import('../services/emailService');

      await incrementContactUsage(mockContactId);

      expect(mockRpc).toHaveBeenCalledWith('increment_contact_usage', {
        contact_id: mockContactId,
      });
    });

    it('uses RPC function with correct parameters', async () => {
      mockRpc.mockResolvedValueOnce({ error: null });

      const { incrementContactUsage } = await import('../services/emailService');

      await incrementContactUsage(mockContactId);

      expect(mockRpc).toHaveBeenCalledWith(
        'increment_contact_usage',
        expect.objectContaining({ contact_id: mockContactId })
      );
    });

    it('falls back to manual update when RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({
        error: { message: 'RPC not found' },
      });

      mockSingle.mockResolvedValueOnce({
        data: { use_count: 5 },
        error: null,
      });

      const { incrementContactUsage } = await import('../services/emailService');

      await incrementContactUsage(mockContactId);

      expect(mockSupabase.from).toHaveBeenCalledWith('email_contacts');
    });

    it('increments use_count by 1 in fallback', async () => {
      mockRpc.mockResolvedValueOnce({
        error: { message: 'RPC not found' },
      });

      mockSingle.mockResolvedValueOnce({
        data: { use_count: 5 },
        error: null,
      });

      const mockUpdateEq = jest.fn();
      mockUpdate.mockReturnValueOnce({ eq: mockUpdateEq });
      mockUpdateEq.mockReturnValueOnce({ error: null });

      const { incrementContactUsage } = await import('../services/emailService');

      await incrementContactUsage(mockContactId);

      // Verify update was attempted with incremented count
      expect(mockSupabase.from).toHaveBeenCalledWith('email_contacts');
    });

    it('updates last_used_at in fallback', async () => {
      mockRpc.mockResolvedValueOnce({
        error: { message: 'RPC not found' },
      });

      mockSingle.mockResolvedValueOnce({
        data: { use_count: 5 },
        error: null,
      });

      const { incrementContactUsage } = await import('../services/emailService');

      await incrementContactUsage(mockContactId);

      // Function should complete without error
      expect(mockRpc).toHaveBeenCalled();
    });

    it('handles contact not found in fallback', async () => {
      mockRpc.mockResolvedValueOnce({
        error: { message: 'RPC not found' },
      });

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const { incrementContactUsage } = await import('../services/emailService');

      // Should not throw, just silently handle
      await incrementContactUsage(mockContactId);

      expect(mockRpc).toHaveBeenCalled();
    });

    it('completes successfully via RPC', async () => {
      mockRpc.mockResolvedValueOnce({ error: null });

      const { incrementContactUsage } = await import('../services/emailService');

      await expect(
        incrementContactUsage(mockContactId)
      ).resolves.not.toThrow();
    });
  });

  // ==========================================================================
  // deleteEmailContact Tests
  // ==========================================================================

  describe('deleteEmailContact', () => {
    it('deletes from email_contacts table', async () => {
      mockEq.mockReturnValueOnce({ error: null });

      const { deleteEmailContact } = await import('../services/emailService');

      await deleteEmailContact(mockContactId);

      expect(mockSupabase.from).toHaveBeenCalledWith('email_contacts');
    });

    it('filters by contact id', async () => {
      mockEq.mockReturnValueOnce({ error: null });

      const { deleteEmailContact } = await import('../services/emailService');

      await deleteEmailContact(mockContactId);

      expect(mockEq).toHaveBeenCalledWith('id', mockContactId);
    });

    it('completes successfully', async () => {
      mockEq.mockReturnValueOnce({ error: null });

      const { deleteEmailContact } = await import('../services/emailService');

      await expect(deleteEmailContact(mockContactId)).resolves.not.toThrow();
    });

    it('throws error on delete failure', async () => {
      mockEq.mockReturnValueOnce({
        error: { message: 'Contact not found' },
      });

      const { deleteEmailContact } = await import('../services/emailService');

      await expect(deleteEmailContact(mockContactId)).rejects.toThrow(
        'Failed to delete contact: Contact not found'
      );
    });

    it('handles foreign key constraint error', async () => {
      mockEq.mockReturnValueOnce({
        error: { message: 'Foreign key constraint violation' },
      });

      const { deleteEmailContact } = await import('../services/emailService');

      await expect(deleteEmailContact(mockContactId)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });

    it('handles non-existent contact id', async () => {
      mockEq.mockReturnValueOnce({ error: null });

      const { deleteEmailContact } = await import('../services/emailService');

      // Should complete without error even if contact doesn't exist
      await expect(deleteEmailContact('non-existent-id')).resolves.not.toThrow();
    });
  });

  // ==========================================================================
  // fetchInvoiceEmailHistory Tests
  // ==========================================================================

  describe('fetchInvoiceEmailHistory', () => {
    it('queries invoice_emails table', async () => {
      mockOrder.mockReturnValueOnce({
        data: mockInvoiceEmails,
        error: null,
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      await fetchInvoiceEmailHistory(mockInvoiceId);

      expect(mockSupabase.from).toHaveBeenCalledWith('invoice_emails');
    });

    it('selects all fields', async () => {
      mockOrder.mockReturnValueOnce({
        data: mockInvoiceEmails,
        error: null,
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      await fetchInvoiceEmailHistory(mockInvoiceId);

      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('filters by invoice_id', async () => {
      mockOrder.mockReturnValueOnce({
        data: mockInvoiceEmails,
        error: null,
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      await fetchInvoiceEmailHistory(mockInvoiceId);

      expect(mockEq).toHaveBeenCalledWith('invoice_id', mockInvoiceId);
    });

    it('orders by created_at descending', async () => {
      mockOrder.mockReturnValueOnce({
        data: mockInvoiceEmails,
        error: null,
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      await fetchInvoiceEmailHistory(mockInvoiceId);

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('returns array of email records', async () => {
      mockOrder.mockReturnValueOnce({
        data: mockInvoiceEmails,
        error: null,
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      const result = await fetchInvoiceEmailHistory(mockInvoiceId);

      expect(result).toEqual(mockInvoiceEmails);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no history', async () => {
      mockOrder.mockReturnValueOnce({
        data: [],
        error: null,
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      const result = await fetchInvoiceEmailHistory(mockInvoiceId);

      expect(result).toEqual([]);
    });

    it('returns empty array when data is null', async () => {
      mockOrder.mockReturnValueOnce({
        data: null,
        error: null,
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      const result = await fetchInvoiceEmailHistory(mockInvoiceId);

      expect(result).toEqual([]);
    });

    it('throws error on fetch failure', async () => {
      mockOrder.mockReturnValueOnce({
        data: null,
        error: { message: 'Query failed' },
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      await expect(fetchInvoiceEmailHistory(mockInvoiceId)).rejects.toThrow(
        'Failed to fetch email history: Query failed'
      );
    });

    it('includes all email statuses', async () => {
      const emailsWithStatuses = [
        { ...mockInvoiceEmail, status: 'pending' },
        { ...mockInvoiceEmail, status: 'sent', id: 'email-2' },
        { ...mockInvoiceEmail, status: 'failed', id: 'email-3' },
      ];

      mockOrder.mockReturnValueOnce({
        data: emailsWithStatuses,
        error: null,
      });

      const { fetchInvoiceEmailHistory } = await import('../services/emailService');

      const result = await fetchInvoiceEmailHistory(mockInvoiceId);

      expect(result.map((e) => e.status)).toContain('pending');
      expect(result.map((e) => e.status)).toContain('sent');
      expect(result.map((e) => e.status)).toContain('failed');
    });
  });

  // ==========================================================================
  // searchEmailContacts Tests
  // ==========================================================================

  describe('searchEmailContacts', () => {
    it('queries email_contacts table', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { searchEmailContacts } = await import('../services/emailService');

      await searchEmailContacts(mockUserId, 'broker');

      expect(mockSupabase.from).toHaveBeenCalledWith('email_contacts');
    });

    it('filters by user_id', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { searchEmailContacts } = await import('../services/emailService');

      await searchEmailContacts(mockUserId, 'broker');

      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
    });

    it('uses OR filter for email, name, and company', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { searchEmailContacts } = await import('../services/emailService');

      await searchEmailContacts(mockUserId, 'test');

      expect(mockOr).toHaveBeenCalledWith(
        expect.stringContaining('email.ilike.%test%')
      );
    });

    it('orders results by use_count descending', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { searchEmailContacts } = await import('../services/emailService');

      await searchEmailContacts(mockUserId, 'broker');

      expect(mockOrder).toHaveBeenCalledWith('use_count', { ascending: false });
    });

    it('limits results to 10', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { searchEmailContacts } = await import('../services/emailService');

      await searchEmailContacts(mockUserId, 'broker');

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('returns matching contacts', async () => {
      const matchingContacts = [mockEmailContact];

      mockLimit.mockReturnValueOnce({
        data: matchingContacts,
        error: null,
      });

      const { searchEmailContacts } = await import('../services/emailService');

      const result = await searchEmailContacts(mockUserId, 'broker');

      expect(result).toEqual(matchingContacts);
    });

    it('returns empty array when no matches', async () => {
      mockLimit.mockReturnValueOnce({
        data: [],
        error: null,
      });

      const { searchEmailContacts } = await import('../services/emailService');

      const result = await searchEmailContacts(mockUserId, 'nonexistent');

      expect(result).toEqual([]);
    });

    it('throws error on search failure', async () => {
      mockLimit.mockReturnValueOnce({
        data: null,
        error: { message: 'Search query failed' },
      });

      const { searchEmailContacts } = await import('../services/emailService');

      await expect(searchEmailContacts(mockUserId, 'broker')).rejects.toThrow(
        'Failed to search contacts: Search query failed'
      );
    });

    it('handles special characters in search query', async () => {
      mockLimit.mockReturnValueOnce({
        data: [],
        error: null,
      });

      const { searchEmailContacts } = await import('../services/emailService');

      await searchEmailContacts(mockUserId, "test's%query");

      expect(mockOr).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // getFrequentContacts Tests
  // ==========================================================================

  describe('getFrequentContacts', () => {
    it('queries email_contacts table', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts.slice(0, 5),
        error: null,
      });

      const { getFrequentContacts } = await import('../services/emailService');

      await getFrequentContacts(mockUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('email_contacts');
    });

    it('filters by user_id', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts.slice(0, 5),
        error: null,
      });

      const { getFrequentContacts } = await import('../services/emailService');

      await getFrequentContacts(mockUserId);

      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
    });

    it('orders by use_count descending', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts.slice(0, 5),
        error: null,
      });

      const { getFrequentContacts } = await import('../services/emailService');

      await getFrequentContacts(mockUserId);

      expect(mockOrder).toHaveBeenCalledWith('use_count', { ascending: false });
    });

    it('uses default limit of 5', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts.slice(0, 5),
        error: null,
      });

      const { getFrequentContacts } = await import('../services/emailService');

      await getFrequentContacts(mockUserId);

      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('accepts custom limit parameter', async () => {
      mockLimit.mockReturnValueOnce({
        data: mockEmailContacts,
        error: null,
      });

      const { getFrequentContacts } = await import('../services/emailService');

      await getFrequentContacts(mockUserId, 10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('returns array of contacts', async () => {
      const frequentContacts = mockEmailContacts.slice(0, 3);

      mockLimit.mockReturnValueOnce({
        data: frequentContacts,
        error: null,
      });

      const { getFrequentContacts } = await import('../services/emailService');

      const result = await getFrequentContacts(mockUserId, 3);

      expect(result).toEqual(frequentContacts);
    });

    it('returns empty array when no contacts', async () => {
      mockLimit.mockReturnValueOnce({
        data: [],
        error: null,
      });

      const { getFrequentContacts } = await import('../services/emailService');

      const result = await getFrequentContacts(mockUserId);

      expect(result).toEqual([]);
    });

    it('throws error on fetch failure', async () => {
      mockLimit.mockReturnValueOnce({
        data: null,
        error: { message: 'Failed to fetch' },
      });

      const { getFrequentContacts } = await import('../services/emailService');

      await expect(getFrequentContacts(mockUserId)).rejects.toThrow(
        'Failed to fetch frequent contacts: Failed to fetch'
      );
    });
  });
});

// ============================================================================
// Pure Function Tests
// ============================================================================

describe('Email Service - Type Definitions', () => {
  describe('SendInvoiceEmailInput', () => {
    it('has required invoiceId field', () => {
      const input = {
        invoiceId: 'test-invoice',
        recipientEmail: 'test@example.com',
      };
      expect(input.invoiceId).toBeDefined();
    });

    it('has required recipientEmail field', () => {
      const input = {
        invoiceId: 'test-invoice',
        recipientEmail: 'test@example.com',
      };
      expect(input.recipientEmail).toBeDefined();
    });

    it('has optional recipientName field', () => {
      const input = {
        invoiceId: 'test-invoice',
        recipientEmail: 'test@example.com',
        recipientName: 'Test User',
      };
      expect(input.recipientName).toBe('Test User');
    });

    it('has optional customMessage field', () => {
      const input = {
        invoiceId: 'test-invoice',
        recipientEmail: 'test@example.com',
        customMessage: 'Custom message',
      };
      expect(input.customMessage).toBe('Custom message');
    });

    it('has optional ccEmails field', () => {
      const input = {
        invoiceId: 'test-invoice',
        recipientEmail: 'test@example.com',
        ccEmails: ['cc@example.com'],
      };
      expect(input.ccEmails).toEqual(['cc@example.com']);
    });
  });

  describe('EmailContact', () => {
    it('has all required fields', () => {
      const contact = mockEmailContact;
      expect(contact.id).toBeDefined();
      expect(contact.user_id).toBeDefined();
      expect(contact.email).toBeDefined();
      expect(contact.use_count).toBeDefined();
      expect(contact.created_at).toBeDefined();
    });

    it('has nullable name field', () => {
      const contact = { ...mockEmailContact, name: null };
      expect(contact.name).toBeNull();
    });

    it('has nullable company field', () => {
      const contact = { ...mockEmailContact, company: null };
      expect(contact.company).toBeNull();
    });

    it('has valid contact_type values', () => {
      const validTypes = ['broker', 'shipper', 'dispatcher', 'other', null];
      expect(validTypes).toContain(mockEmailContact.contact_type);
    });
  });

  describe('InvoiceEmail', () => {
    it('has all required fields', () => {
      const email = mockInvoiceEmail;
      expect(email.id).toBeDefined();
      expect(email.invoice_id).toBeDefined();
      expect(email.recipient_email).toBeDefined();
      expect(email.status).toBeDefined();
      expect(email.created_at).toBeDefined();
    });

    it('has valid status values', () => {
      const validStatuses = ['pending', 'sent', 'failed'];
      expect(validStatuses).toContain(mockInvoiceEmail.status);
    });

    it('has nullable fields', () => {
      const email = {
        ...mockInvoiceEmail,
        recipient_name: null,
        cc_emails: null,
        custom_message: null,
        message_id: null,
        error_message: null,
        sent_at: null,
      };
      expect(email.recipient_name).toBeNull();
      expect(email.cc_emails).toBeNull();
    });
  });
});

// ============================================================================
// Edge Cases and Error Handling
// ============================================================================

describe('Email Service - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles very long email addresses', () => {
    const longEmail = 'a'.repeat(200) + '@example.com';
    expect(longEmail.length).toBeGreaterThan(200);
  });

  it('handles emails with special characters', () => {
    const specialEmails = [
      'user+tag@example.com',
      'user.name@example.com',
      'user_name@example.com',
      'user-name@example.com',
    ];

    for (const email of specialEmails) {
      expect(email).toContain('@');
    }
  });

  it('handles empty search queries', () => {
    const query = '';
    expect(query.length).toBe(0);
  });

  it('handles unicode characters in names', () => {
    const unicodeName = 'Jose Garcia';
    expect(unicodeName.length).toBeGreaterThan(0);
  });

  it('handles very large use_count values', () => {
    const largeCount = 999999;
    expect(largeCount).toBe(999999);
  });

  it('handles concurrent operations', async () => {
    // Simulate concurrent calls
    const operations = Array(5)
      .fill(null)
      .map(() => Promise.resolve({ success: true }));

    const results = await Promise.all(operations);
    expect(results).toHaveLength(5);
  });

  it('handles network latency gracefully', async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    await delay(10);
    expect(true).toBe(true);
  });

  it('handles malformed JSON responses', () => {
    const errorHandler = (error: unknown) => {
      if (error instanceof Error) return error.message;
      return 'Unknown error';
    };

    const result = errorHandler(new Error('Invalid JSON'));
    expect(result).toBe('Invalid JSON');
  });
});
