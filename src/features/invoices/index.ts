/**
 * Invoices Feature Exports
 */

// Services
export {
  createInvoice,
  fetchInvoiceWithDetails,
  fetchUserInvoices,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoiceSummary,
  generateInvoicePdf,
  shareInvoicePdf,
  type InvoiceLineItem,
  type InvoiceCreateInput,
  type InvoiceWithDetails,
} from './services/invoiceService';

export {
  sendInvoiceEmail,
  fetchEmailContacts,
  saveEmailContact,
  deleteEmailContact,
  incrementContactUsage,
  fetchInvoiceEmailHistory,
  searchEmailContacts,
  getFrequentContacts,
  updateEmailContact,
  fetchContactsByType,
  getContactStats,
  type SendInvoiceEmailInput,
  type EmailContact,
  type EmailContactInput,
  type InvoiceEmail,
} from './services/emailService';

// Hooks
export {
  useInvoices,
  useInvoiceDetails,
  useInvoiceSummary,
  useCreateInvoice,
  useUpdateInvoiceStatus,
  useDeleteInvoice,
  useShareInvoice,
} from './hooks/useInvoices';

export {
  useEmailContacts,
  useSearchContacts,
  useFrequentContacts,
  useSaveContact,
  useDeleteContact,
  useIncrementContactUsage,
  useUpdateContact,
  useContactsByType,
  useContactStats,
} from './hooks/useEmailContacts';

export {
  useSendInvoiceEmail,
  useInvoiceEmailHistory,
} from './hooks/useSendInvoice';

// Components
export { InvoiceCard } from './components/InvoiceCard';
export { InvoiceList, InvoiceSummaryCard } from './components/InvoiceList';
export { CreateInvoiceModal } from './components/CreateInvoiceModal';
export { SendInvoiceModal } from './components/SendInvoiceModal';
export { ContactPicker, type Contact, type ContactType } from './components/ContactPicker';
export { EmailPreview } from './components/EmailPreview';
export { SavedContactsManager } from './components/SavedContactsManager';
