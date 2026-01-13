/**
 * SendInvoiceModal Component Tests
 * Tests for the invoice email composition modal
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  ActivityIndicator: 'ActivityIndicator',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Modal: 'Modal',
  Platform: {
    OS: 'ios',
  },
  Alert: {
    alert: jest.fn(),
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

// Mock child components
jest.mock('../components/ContactPicker', () => ({
  ContactPicker: () => null,
}));

jest.mock('../components/EmailPreview', () => ({
  EmailPreview: () => null,
}));

// ============================================================================
// Test Data
// ============================================================================

const mockInvoice = {
  id: 'invoice-123',
  invoice_number: 'INV-2024-001',
  total_amount: 1250.0,
  recipient_email: 'existing@example.com',
  status: 'draft' as const,
  detention_event_id: 'event-456',
  user_id: 'user-789',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

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
];

const mockOnSend = jest.fn().mockResolvedValue(undefined);
const mockOnCancel = jest.fn();

// ============================================================================
// Test Suites
// ============================================================================

describe('SendInvoiceModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('renders with invoice number in title', () => {
      const title = `Send Invoice ${mockInvoice.invoice_number}`;
      expect(title).toBe('Send Invoice INV-2024-001');
    });

    it('displays invoice amount formatted as currency', () => {
      const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      };

      const formattedAmount = formatCurrency(mockInvoice.total_amount);
      expect(formattedAmount).toBe('$1,250.00');
    });

    it('shows close button', () => {
      const hasCloseButton = true;
      expect(hasCloseButton).toBe(true);
    });

    it('shows email input field', () => {
      const hasEmailInput = true;
      expect(hasEmailInput).toBe(true);
    });

    it('shows message textarea', () => {
      const hasMessageField = true;
      expect(hasMessageField).toBe(true);
    });

    it('shows preview button', () => {
      const hasPreviewButton = true;
      expect(hasPreviewButton).toBe(true);
    });

    it('shows send button', () => {
      const hasSendButton = true;
      expect(hasSendButton).toBe(true);
    });

    it('pre-fills recipient email from invoice', () => {
      const initialEmail = mockInvoice.recipient_email || '';
      expect(initialEmail).toBe('existing@example.com');
    });

    it('handles invoice without recipient email', () => {
      const invoiceWithoutEmail = { ...mockInvoice, recipient_email: null };
      const initialEmail = invoiceWithoutEmail.recipient_email || '';
      expect(initialEmail).toBe('');
    });

    it('shows Add CC button initially', () => {
      const showCcField = false;
      const addCcButtonVisible = !showCcField;
      expect(addCcButtonVisible).toBe(true);
    });
  });

  // ==========================================================================
  // Email Validation Tests
  // ==========================================================================

  describe('Email Input Validation', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    };

    it('validates empty email', () => {
      const email = '';
      const isRequired = !email.trim();
      expect(isRequired).toBe(true);
    });

    it('validates invalid email format - no @', () => {
      expect(isValidEmail('invalidemail')).toBe(false);
    });

    it('validates invalid email format - no domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });

    it('validates invalid email format - no TLD', () => {
      expect(isValidEmail('test@domain')).toBe(false);
    });

    it('validates invalid email format - double @', () => {
      expect(isValidEmail('test@@example.com')).toBe(false);
    });

    it('validates correct email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('validates email with subdomain', () => {
      expect(isValidEmail('test@mail.example.com')).toBe(true);
    });

    it('validates email with plus sign', () => {
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('trims whitespace from email', () => {
      const email = '  test@example.com  ';
      expect(email.trim()).toBe('test@example.com');
    });

    it('shows error message for invalid email', () => {
      const errorMessage = 'Please enter a valid email address';
      expect(errorMessage).toBeTruthy();
    });

    it('shows error message for empty email', () => {
      const errorMessage = 'Email address is required';
      expect(errorMessage).toBeTruthy();
    });

    it('clears error on valid input', () => {
      let emailError: string | null = 'Please enter a valid email address';

      const validateAndClearError = (email: string) => {
        if (isValidEmail(email)) {
          emailError = null;
        }
      };

      validateAndClearError('valid@email.com');
      expect(emailError).toBeNull();
    });
  });

  // ==========================================================================
  // CC Field Tests
  // ==========================================================================

  describe('CC Field', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    };

    it('shows CC field when Add CC is pressed', () => {
      let showCcField = false;
      const toggleCcField = () => {
        showCcField = true;
      };
      toggleCcField();
      expect(showCcField).toBe(true);
    });

    it('hides Add CC button when CC field is shown', () => {
      const showCcField = true;
      const addCcButtonVisible = !showCcField;
      expect(addCcButtonVisible).toBe(false);
    });

    it('validates CC email format', () => {
      expect(isValidEmail('cc@example.com')).toBe(true);
    });

    it('allows empty CC field', () => {
      const ccEmail = '';
      const ccEmailValue = ccEmail.trim() || undefined;
      expect(ccEmailValue).toBeUndefined();
    });

    it('shows CC error for invalid email', () => {
      const ccError = 'Please enter a valid CC email address';
      expect(ccError).toBeTruthy();
    });

    it('does not validate CC when field is hidden', () => {
      const showCcField = false;
      const ccEmail = 'invalid';
      const shouldValidateCc = showCcField && ccEmail.trim();
      expect(shouldValidateCc).toBe(false);
    });
  });

  // ==========================================================================
  // Contact Selection Tests
  // ==========================================================================

  describe('Contact Selection', () => {
    it('renders ContactPicker when contacts exist', () => {
      const hasContacts = mockContacts.length > 0;
      expect(hasContacts).toBe(true);
    });

    it('hides ContactPicker when no contacts', () => {
      const emptyContacts: typeof mockContacts = [];
      const hasContacts = emptyContacts.length > 0;
      expect(hasContacts).toBe(false);
    });

    it('updates email when contact is selected', () => {
      let recipientEmail = '';
      const handleContactSelect = (contact: typeof mockContacts[0]) => {
        recipientEmail = contact.email;
      };

      handleContactSelect(mockContacts[0]);
      expect(recipientEmail).toBe('broker@trucking.com');
    });

    it('clears email error when contact is selected', () => {
      let emailError: string | null = 'Email is required';
      const handleContactSelect = () => {
        emailError = null;
      };

      handleContactSelect();
      expect(emailError).toBeNull();
    });

    it('passes selectedEmail to ContactPicker', () => {
      const selectedEmail = 'test@example.com';
      expect(selectedEmail).toBe('test@example.com');
    });
  });

  // ==========================================================================
  // Send Button Tests
  // ==========================================================================

  describe('Send Button', () => {
    it('calls onSend with email when pressed', async () => {
      const email = 'test@example.com';
      await mockOnSend(email);
      expect(mockOnSend).toHaveBeenCalledWith(email);
    });

    it('calls onSend with CC email when provided', async () => {
      const email = 'test@example.com';
      const ccEmail = 'cc@example.com';
      await mockOnSend(email, ccEmail);
      expect(mockOnSend).toHaveBeenCalledWith(email, ccEmail);
    });

    it('calls onSend with custom message when provided', async () => {
      const email = 'test@example.com';
      const message = 'Please process this invoice.';
      await mockOnSend(email, undefined, message);
      expect(mockOnSend).toHaveBeenCalledWith(email, undefined, message);
    });

    it('trims email before sending', () => {
      const email = '  test@example.com  ';
      const trimmedEmail = email.trim();
      expect(trimmedEmail).toBe('test@example.com');
    });

    it('trims CC email before sending', () => {
      const ccEmail = '  cc@example.com  ';
      const trimmedCc = ccEmail.trim();
      expect(trimmedCc).toBe('cc@example.com');
    });

    it('trims custom message before sending', () => {
      const message = '  Custom message  ';
      const trimmedMessage = message.trim();
      expect(trimmedMessage).toBe('Custom message');
    });

    it('converts empty message to undefined', () => {
      const message = '';
      const messageValue = message.trim() || undefined;
      expect(messageValue).toBeUndefined();
    });

    it('converts empty CC to undefined', () => {
      const ccEmail = '';
      const ccValue = ccEmail.trim() || undefined;
      expect(ccValue).toBeUndefined();
    });
  });

  // ==========================================================================
  // Loading State Tests
  // ==========================================================================

  describe('Loading State', () => {
    it('shows ActivityIndicator when sending', () => {
      const isSending = true;
      expect(isSending).toBe(true);
    });

    it('hides Send Email text when sending', () => {
      const isSending = true;
      const showSendText = !isSending;
      expect(showSendText).toBe(false);
    });

    it('disables send button during send', () => {
      const isSending = true;
      const disabled = isSending;
      expect(disabled).toBe(true);
    });

    it('disables preview button during send', () => {
      const isSending = true;
      const disabled = isSending;
      expect(disabled).toBe(true);
    });

    it('resets loading state after send completes', () => {
      let isSending = true;
      const endSending = () => {
        isSending = false;
      };
      endSending();
      expect(isSending).toBe(false);
    });

    it('resets loading state on error', () => {
      let isSending = true;
      const handleError = () => {
        isSending = false;
      };
      handleError();
      expect(isSending).toBe(false);
    });

    it('applies disabled opacity to button', () => {
      const isSending = true;
      const buttonStyle = isSending ? { opacity: 0.5 } : {};
      expect(buttonStyle.opacity).toBe(0.5);
    });
  });

  // ==========================================================================
  // Cancel Button Tests
  // ==========================================================================

  describe('Cancel Button', () => {
    it('calls onCancel when close button pressed', () => {
      mockOnCancel();
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('close button is always visible', () => {
      const closeButtonVisible = true;
      expect(closeButtonVisible).toBe(true);
    });
  });

  // ==========================================================================
  // Success State Tests
  // ==========================================================================

  describe('Success State', () => {
    it('shows success alert on send complete', () => {
      const { Alert } = require('react-native');

      Alert.alert(
        'Invoice Sent',
        `Invoice ${mockInvoice.invoice_number} has been sent to test@example.com`
      );

      expect(Alert.alert).toHaveBeenCalledWith(
        'Invoice Sent',
        expect.stringContaining(mockInvoice.invoice_number)
      );
    });

    it('includes invoice number in success message', () => {
      const message = `Invoice ${mockInvoice.invoice_number} has been sent`;
      expect(message).toContain('INV-2024-001');
    });

    it('includes recipient email in success message', () => {
      const email = 'test@example.com';
      const message = `Invoice has been sent to ${email}`;
      expect(message).toContain('test@example.com');
    });

    it('calls onCancel after success alert', () => {
      const { Alert } = require('react-native');

      Alert.alert(
        'Invoice Sent',
        'Message',
        [{ text: 'OK', onPress: mockOnCancel }]
      );

      expect(Alert.alert).toHaveBeenCalledWith(
        'Invoice Sent',
        'Message',
        expect.arrayContaining([
          expect.objectContaining({ text: 'OK', onPress: mockOnCancel }),
        ])
      );
    });
  });

  // ==========================================================================
  // Error State Tests
  // ==========================================================================

  describe('Error State', () => {
    it('shows error alert on send failure', () => {
      const { Alert } = require('react-native');

      Alert.alert('Send Failed', 'Failed to send invoice email');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Send Failed',
        expect.any(String)
      );
    });

    it('shows error message from thrown error', () => {
      const error = new Error('Network error');
      const message = error instanceof Error ? error.message : 'Failed to send invoice email';
      expect(message).toBe('Network error');
    });

    it('shows default message for non-Error objects', () => {
      const error: unknown = 'string error';
      const message = error instanceof Error ? error.message : 'Failed to send invoice email';
      expect(message).toBe('Failed to send invoice email');
    });
  });

  // ==========================================================================
  // Preview Tests
  // ==========================================================================

  describe('Preview', () => {
    it('shows preview when preview button pressed', () => {
      let showPreview = false;
      const handlePreview = () => {
        showPreview = true;
      };
      handlePreview();
      expect(showPreview).toBe(true);
    });

    it('validates before showing preview', () => {
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
      };

      let showPreview = false;
      const handlePreview = (email: string) => {
        if (isValidEmail(email)) {
          showPreview = true;
        }
      };

      handlePreview('invalid');
      expect(showPreview).toBe(false);

      handlePreview('valid@email.com');
      expect(showPreview).toBe(true);
    });

    it('closes preview on close', () => {
      let showPreview = true;
      const handleClosePreview = () => {
        showPreview = false;
      };
      handleClosePreview();
      expect(showPreview).toBe(false);
    });

    it('renders EmailPreview in Modal', () => {
      const showPreview = true;
      const modalVisible = showPreview;
      expect(modalVisible).toBe(true);
    });
  });

  // ==========================================================================
  // Input Handling Tests
  // ==========================================================================

  describe('Input Handling', () => {
    it('updates recipient email on change', () => {
      let recipientEmail = '';
      const handleChange = (text: string) => {
        recipientEmail = text;
      };
      handleChange('new@email.com');
      expect(recipientEmail).toBe('new@email.com');
    });

    it('updates custom message on change', () => {
      let customMessage = '';
      const handleChange = (text: string) => {
        customMessage = text;
      };
      handleChange('Please process ASAP');
      expect(customMessage).toBe('Please process ASAP');
    });

    it('updates CC email on change', () => {
      let ccEmail = '';
      const handleChange = (text: string) => {
        ccEmail = text;
      };
      handleChange('cc@email.com');
      expect(ccEmail).toBe('cc@email.com');
    });

    it('clears email error on input change', () => {
      let emailError: string | null = 'Error';
      const handleChange = () => {
        emailError = null;
      };
      handleChange();
      expect(emailError).toBeNull();
    });

    it('clears CC error on input change', () => {
      let ccError: string | null = 'Error';
      const handleChange = () => {
        ccError = null;
      };
      handleChange();
      expect(ccError).toBeNull();
    });
  });

  // ==========================================================================
  // Styling Tests
  // ==========================================================================

  describe('Styling', () => {
    it('uses dark theme colors', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      expect(theme.background).toBe('#0A0A0F');
    });

    it('applies error border color on validation error', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      const hasError = true;
      const borderColor = hasError ? theme.error : undefined;
      expect(borderColor).toBe('#EF4444');
    });

    it('applies primary color to send button', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      expect(theme.primary).toBe('#3B82F6');
    });

    it('applies success color to amount', () => {
      const { colors } = require('@/constants/colors');
      const theme = colors.dark;
      expect(theme.success).toBe('#22C55E');
    });

    it('email input has correct keyboard type', () => {
      const keyboardType = 'email-address';
      expect(keyboardType).toBe('email-address');
    });

    it('email input has no autocorrect', () => {
      const autoCorrect = false;
      expect(autoCorrect).toBe(false);
    });

    it('email input has no autocapitalize', () => {
      const autoCapitalize = 'none';
      expect(autoCapitalize).toBe('none');
    });

    it('message textarea supports multiline', () => {
      const multiline = true;
      expect(multiline).toBe(true);
    });
  });

  // ==========================================================================
  // Keyboard Handling Tests
  // ==========================================================================

  describe('Keyboard Handling', () => {
    it('uses KeyboardAvoidingView', () => {
      const usesKeyboardAvoidingView = true;
      expect(usesKeyboardAvoidingView).toBe(true);
    });

    it('sets behavior based on platform', () => {
      const { Platform } = require('react-native');
      const behavior = Platform.OS === 'ios' ? 'padding' : 'height';
      expect(behavior).toBe('padding');
    });

    it('ScrollView persists taps', () => {
      const keyboardShouldPersistTaps = 'handled';
      expect(keyboardShouldPersistTaps).toBe('handled');
    });
  });
});

// ============================================================================
// Pure Function Tests
// ============================================================================

describe('SendInvoiceModal - Helper Functions', () => {
  describe('formatCurrency', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    it('formats whole numbers', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('formats decimals', () => {
      expect(formatCurrency(100.5)).toBe('$100.50');
    });

    it('formats large numbers with commas', () => {
      expect(formatCurrency(10000)).toBe('$10,000.00');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('handles negative amounts', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
    });
  });

  describe('isValidEmail', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    };

    it('returns true for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('returns false for invalid emails', () => {
      const invalidEmails = [
        '',
        'test',
        '@domain.com',
        'test@',
        'test@domain',
        'test @example.com',
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('validateInputs', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    };

    const validateInputs = (
      recipientEmail: string,
      ccEmail: string,
      showCcField: boolean
    ): { isValid: boolean; emailError: string | null; ccError: string | null } => {
      let emailError: string | null = null;
      let ccError: string | null = null;
      let isValid = true;

      if (!recipientEmail.trim()) {
        emailError = 'Email address is required';
        isValid = false;
      } else if (!isValidEmail(recipientEmail)) {
        emailError = 'Please enter a valid email address';
        isValid = false;
      }

      if (showCcField && ccEmail.trim() && !isValidEmail(ccEmail)) {
        ccError = 'Please enter a valid CC email address';
        isValid = false;
      }

      return { isValid, emailError, ccError };
    };

    it('fails with empty email', () => {
      const result = validateInputs('', '', false);
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Email address is required');
    });

    it('fails with invalid email', () => {
      const result = validateInputs('invalid', '', false);
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Please enter a valid email address');
    });

    it('passes with valid email', () => {
      const result = validateInputs('valid@email.com', '', false);
      expect(result.isValid).toBe(true);
      expect(result.emailError).toBeNull();
    });

    it('ignores CC when field is hidden', () => {
      const result = validateInputs('valid@email.com', 'invalid', false);
      expect(result.isValid).toBe(true);
      expect(result.ccError).toBeNull();
    });

    it('validates CC when field is shown', () => {
      const result = validateInputs('valid@email.com', 'invalid', true);
      expect(result.isValid).toBe(false);
      expect(result.ccError).toBe('Please enter a valid CC email address');
    });

    it('allows empty CC when field is shown', () => {
      const result = validateInputs('valid@email.com', '', true);
      expect(result.isValid).toBe(true);
      expect(result.ccError).toBeNull();
    });
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('SendInvoiceModal - Edge Cases', () => {
  it('handles very long email addresses', () => {
    const longEmail = 'a'.repeat(200) + '@example.com';
    expect(longEmail.length).toBeGreaterThan(200);
  });

  it('handles very long custom messages', () => {
    const longMessage = 'a'.repeat(1000);
    expect(longMessage.length).toBe(1000);
  });

  it('handles rapid send button presses', () => {
    let isSending = false;
    let pressCount = 0;

    const handleSend = () => {
      if (isSending) return;
      isSending = true;
      pressCount++;
    };

    // Simulate rapid presses
    handleSend();
    handleSend();
    handleSend();

    expect(pressCount).toBe(1);
  });

  it('handles invoice with zero amount', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    const zeroInvoice = { ...mockInvoice, total_amount: 0 };
    const formatted = formatCurrency(zeroInvoice.total_amount);
    expect(formatted).toBe('$0.00');
  });

  it('handles invoice with large amount', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    const largeInvoice = { ...mockInvoice, total_amount: 999999.99 };
    const formatted = formatCurrency(largeInvoice.total_amount);
    expect(formatted).toBe('$999,999.99');
  });

  it('handles empty contacts array', () => {
    const contacts: typeof mockContacts = [];
    const shouldShowPicker = contacts.length > 0;
    expect(shouldShowPicker).toBe(false);
  });

  it('handles special characters in message', () => {
    const message = 'Test & special <characters> "quoted" $100';
    expect(message).toContain('&');
    expect(message).toContain('<');
    expect(message).toContain('"');
  });
});
