/**
 * Fleet Invoice Service
 * Utility functions for fleet consolidated invoices
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex:
 * - useQuery(api.fleetInvoices.list, { fleetId }) - Get fleet invoices
 * - useMutation(api.fleetInvoices.create) - Create consolidated invoice
 */

export interface FleetInvoice {
  id: string;
  fleetId: string;
  invoiceNumber: string;
  invoiceIds: string[];
  detentionEventIds: string[];
  driverIds: string[];
  recipientName?: string;
  recipientCompany?: string;
  recipientEmail?: string;
  totalAmount: number;
  pdfUrl?: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid';
  dateRangeStart?: number;
  dateRangeEnd?: number;
  notes?: string;
  sentAt?: number;
  paidAt?: number;
  createdBy: string;
}

/**
 * Generate fleet invoice number
 */
export function generateFleetInvoiceNumber(fleetInvoiceCount: number): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seq = (fleetInvoiceCount + 1).toString().padStart(4, '0');
  return `FI-${year}${month}-${seq}`;
}

/**
 * Format invoice status for display
 */
export function formatInvoiceStatus(status: FleetInvoice['status']): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'sent':
      return 'Sent';
    case 'paid':
      return 'Paid';
    case 'partially_paid':
      return 'Partially Paid';
    default:
      return status;
  }
}

/**
 * Get invoice status color
 */
export function getInvoiceStatusColor(status: FleetInvoice['status']): string {
  switch (status) {
    case 'draft':
      return '#6B7280'; // gray
    case 'sent':
      return '#3B82F6'; // blue
    case 'paid':
      return '#10B981'; // green
    case 'partially_paid':
      return '#F59E0B'; // yellow
    default:
      return '#6B7280';
  }
}

/**
 * Format date range
 */
export function formatDateRange(start?: number, end?: number): string {
  if (!start || !end) return 'All time';
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}
