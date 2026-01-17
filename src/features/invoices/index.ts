/**
 * Invoices Feature Exports
 *
 * NOTE: Invoice data operations now use Convex hooks from @/shared/hooks/convex:
 * - useInvoices, useInvoice, useCreateInvoice, etc.
 * - useEmailContacts, useSendInvoiceEmail, etc.
 */

// Services - Utility functions and PDF generation
export {
  type InvoiceLineItem,
  type InvoiceWithDetails,
  generateInvoiceNumber,
  formatCurrency,
  formatDate,
  formatDuration,
  generateInvoicePdf,
  shareInvoicePdf,
  calculateInvoiceSummary,
} from './services/invoiceService';

// Email Service - Utility functions
export {
  type EmailRecipient,
  type EmailContact,
  isValidEmail,
  validateRecipients,
  formatRecipient,
  sortContactsByUsage,
  filterContacts,
} from './services/emailService';

// Convex Hooks (re-export for convenience)
export {
  useInvoices,
  useInvoice,
  useInvoiceByNumber,
  useAgingSummary,
  useInvoiceSummary,
  useCreateInvoice,
  useUpdateInvoice,
  useSetInvoicePdfUrl,
  useMarkInvoiceSent,
  useMarkInvoicePaid,
  useDeleteInvoice,
  useEmailContacts,
  useMostUsedContacts,
  useSearchContacts,
  useUpsertContact,
  useUpdateContact,
  useDeleteContact,
  useGetUploadUrl,
  useGetDownloadUrl,
} from './hooks/useInvoicesConvex';

export {
  useSendInvoiceEmail,
  useLogEmailSend,
  useEmailLogs,
  useSendAndLogEmail,
} from './hooks/useEmailConvex';

// Components
export { InvoiceCard } from './components/InvoiceCard';
export { InvoiceList, InvoiceSummaryCard } from './components/InvoiceList';
export { CreateInvoiceModal } from './components/CreateInvoiceModal';
export { SendInvoiceModal } from './components/SendInvoiceModal';
export { ContactPicker, type Contact, type ContactType } from './components/ContactPicker';
export { EmailPreview } from './components/EmailPreview';
export { SavedContactsManager } from './components/SavedContactsManager';
