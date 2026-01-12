/**
 * Invoice Service
 * Handles invoice creation, PDF generation, and management
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/shared/lib/supabase';
import type { Invoice, DetentionEvent, User } from '@/shared/types';

export interface InvoiceLineItem {
  id: string;
  facilityName: string;
  date: string;
  eventType: 'pickup' | 'delivery';
  detentionMinutes: number;
  hourlyRate: number;
  amount: number;
}

export interface InvoiceCreateInput {
  detentionEventIds: string[];
  recipientEmail?: string;
  recipientName?: string;
  recipientCompany?: string;
  notes?: string;
  dueDate?: string;
}

export interface InvoiceWithDetails extends Invoice {
  lineItems: InvoiceLineItem[];
  userProfile: {
    name: string | null;
    company_name: string | null;
    email: string;
    phone: string | null;
    invoice_logo_url: string | null;
    invoice_terms: string | null;
  };
}

/**
 * Generate a unique invoice number
 */
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DT-${year}${month}-${random}`;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format duration
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Fetch detention events for invoice
 */
async function fetchDetentionEventsForInvoice(
  eventIds: string[]
): Promise<(DetentionEvent & { facility_name: string })[]> {
  const { data, error } = await supabase
    .from('detention_events')
    .select(`
      *,
      facilities (name)
    `)
    .in('id', eventIds);

  if (error) {
    throw new Error(`Failed to fetch detention events: ${error.message}`);
  }

  return (data || []).map((event) => ({
    ...event,
    facility_name: (event.facilities as any)?.name || 'Unknown Facility',
  }));
}

/**
 * Create an invoice from detention events
 */
export async function createInvoice(
  userId: string,
  input: InvoiceCreateInput
): Promise<Invoice> {
  // Fetch detention events
  const events = await fetchDetentionEventsForInvoice(input.detentionEventIds);

  if (events.length === 0) {
    throw new Error('No detention events found');
  }

  // Calculate total
  const totalAmount = events.reduce((sum, event) => sum + event.total_amount, 0);

  // Generate invoice number
  const invoiceNumber = generateInvoiceNumber();

  // Create invoice record
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      invoice_number: invoiceNumber,
      detention_event_ids: input.detentionEventIds,
      recipient_email: input.recipientEmail || null,
      total_amount: totalAmount,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  // Update detention events to invoiced status
  await supabase
    .from('detention_events')
    .update({ status: 'invoiced' })
    .in('id', input.detentionEventIds);

  return data;
}

/**
 * Fetch invoice with full details
 */
export async function fetchInvoiceWithDetails(
  invoiceId: string
): Promise<InvoiceWithDetails | null> {
  // Fetch invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (invoiceError) {
    if (invoiceError.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch invoice: ${invoiceError.message}`);
  }

  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('name, company_name, email, phone, invoice_logo_url, invoice_terms')
    .eq('id', invoice.user_id)
    .single();

  if (userError) {
    throw new Error(`Failed to fetch user profile: ${userError.message}`);
  }

  // Fetch detention events
  const events = await fetchDetentionEventsForInvoice(invoice.detention_event_ids);

  // Build line items
  const lineItems: InvoiceLineItem[] = events.map((event) => ({
    id: event.id,
    facilityName: event.facility_name,
    date: event.arrival_time,
    eventType: event.event_type,
    detentionMinutes: event.detention_minutes,
    hourlyRate: event.hourly_rate,
    amount: event.total_amount,
  }));

  return {
    ...invoice,
    lineItems,
    userProfile: user,
  };
}

/**
 * Fetch all invoices for a user
 */
export async function fetchUserInvoices(
  userId: string,
  status?: Invoice['status']
): Promise<Invoice[]> {
  let query = supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }

  return data || [];
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: Invoice['status']
): Promise<Invoice> {
  const updates: Partial<Invoice> = { status };

  if (status === 'sent') {
    updates.sent_at = new Date().toISOString();
  } else if (status === 'paid') {
    updates.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update invoice: ${error.message}`);
  }

  // If marked as paid, update detention events
  if (status === 'paid') {
    const invoice = data as Invoice;
    await supabase
      .from('detention_events')
      .update({ status: 'paid' })
      .in('id', invoice.detention_event_ids);
  }

  return data;
}

/**
 * Generate invoice HTML for PDF
 */
function generateInvoiceHtml(invoice: InvoiceWithDetails, recipientInfo?: {
  name?: string;
  company?: string;
  email?: string;
}): string {
  const { lineItems, userProfile } = invoice;
  const issueDate = formatDate(invoice.created_at);
  const dueDate = formatDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  ); // 30 days from now

  const lineItemsHtml = lineItems
    .map(
      (item) => `
      <tr>
        <td>${formatDate(item.date)}</td>
        <td>${item.facilityName}</td>
        <td style="text-transform: capitalize;">${item.eventType}</td>
        <td>${formatDuration(item.detentionMinutes)}</td>
        <td>${formatCurrency(item.hourlyRate)}/hr</td>
        <td style="text-align: right; font-weight: 600;">${formatCurrency(item.amount)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #fff;
          color: #333;
          line-height: 1.5;
          padding: 40px;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1a56db;
        }
        .company-info h1 {
          font-size: 28px;
          color: #1a56db;
          margin-bottom: 4px;
        }
        .company-info p {
          color: #666;
          font-size: 14px;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h2 {
          font-size: 32px;
          color: #333;
          margin-bottom: 8px;
        }
        .invoice-number {
          font-size: 16px;
          color: #666;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .info-block {
          flex: 1;
        }
        .info-block h3 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #999;
          margin-bottom: 8px;
        }
        .info-block p {
          font-size: 14px;
          margin-bottom: 4px;
        }
        .info-block .highlight {
          font-weight: 600;
          color: #1a56db;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: #f8f9fa;
          text-align: left;
          padding: 12px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
          border-bottom: 2px solid #e5e7eb;
        }
        th:last-child {
          text-align: right;
        }
        td {
          padding: 14px 12px;
          font-size: 14px;
          border-bottom: 1px solid #e5e7eb;
        }
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }
        .totals-box {
          width: 280px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .totals-row.total {
          border-top: 2px solid #333;
          margin-top: 8px;
          padding-top: 16px;
          font-size: 20px;
          font-weight: bold;
        }
        .totals-row.total .amount {
          color: #1a56db;
        }
        .terms {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .terms h3 {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .terms p {
          font-size: 13px;
          color: #666;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-draft { background: #fef3c7; color: #92400e; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-paid { background: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="company-info">
          <h1>${userProfile.company_name || 'DwellTime User'}</h1>
          ${userProfile.name ? `<p>${userProfile.name}</p>` : ''}
          ${userProfile.email ? `<p>${userProfile.email}</p>` : ''}
          ${userProfile.phone ? `<p>${userProfile.phone}</p>` : ''}
        </div>
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p class="invoice-number">${invoice.invoice_number}</p>
          <span class="status-badge status-${invoice.status}">${invoice.status}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="info-block">
          <h3>Bill To</h3>
          ${recipientInfo?.company ? `<p><strong>${recipientInfo.company}</strong></p>` : ''}
          ${recipientInfo?.name ? `<p>${recipientInfo.name}</p>` : ''}
          ${recipientInfo?.email || invoice.recipient_email ? `<p>${recipientInfo?.email || invoice.recipient_email}</p>` : ''}
        </div>
        <div class="info-block" style="text-align: right;">
          <h3>Invoice Details</h3>
          <p>Issue Date: <span class="highlight">${issueDate}</span></p>
          <p>Due Date: <span class="highlight">${dueDate}</span></p>
          <p>Events: <span class="highlight">${lineItems.length}</span></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Facility</th>
            <th>Type</th>
            <th>Detention</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(invoice.total_amount)}</span>
          </div>
          <div class="totals-row total">
            <span>Total Due</span>
            <span class="amount">${formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      ${userProfile.invoice_terms ? `
        <div class="terms">
          <h3>Terms & Conditions</h3>
          <p>${userProfile.invoice_terms}</p>
        </div>
      ` : `
        <div class="terms">
          <h3>Payment Terms</h3>
          <p>Payment is due within 30 days of invoice date. Please reference invoice number ${invoice.invoice_number} with your payment.</p>
        </div>
      `}

      <div class="footer">
        <p>Generated by DwellTime • Detention Tracking for Trucking Professionals</p>
        <p>Questions? Contact ${userProfile.email || 'support@dwelltime.app'}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate PDF from invoice
 */
export async function generateInvoicePdf(
  invoice: InvoiceWithDetails,
  recipientInfo?: { name?: string; company?: string; email?: string }
): Promise<string> {
  const html = generateInvoiceHtml(invoice, recipientInfo);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

/**
 * Share invoice as PDF
 */
export async function shareInvoicePdf(
  invoice: InvoiceWithDetails,
  recipientInfo?: { name?: string; company?: string; email?: string }
): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }

  const pdfUri = await generateInvoicePdf(invoice, recipientInfo);
  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    dialogTitle: `Invoice ${invoice.invoice_number}`,
    UTI: 'com.adobe.pdf',
  });
}

/**
 * Delete an invoice (only drafts can be deleted)
 */
export async function deleteInvoice(invoiceId: string): Promise<void> {
  // First get the invoice to check status and get event IDs
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch invoice: ${fetchError.message}`);
  }

  if (invoice.status !== 'draft') {
    throw new Error('Only draft invoices can be deleted');
  }

  // Reset detention events to completed status
  await supabase
    .from('detention_events')
    .update({ status: 'completed' })
    .in('id', invoice.detention_event_ids);

  // Delete the invoice
  const { error: deleteError } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);

  if (deleteError) {
    throw new Error(`Failed to delete invoice: ${deleteError.message}`);
  }
}

/**
 * Get invoice summary stats
 */
export async function getInvoiceSummary(userId: string): Promise<{
  totalDraft: number;
  totalSent: number;
  totalPaid: number;
  amountDraft: number;
  amountSent: number;
  amountPaid: number;
}> {
  const { data, error } = await supabase
    .from('invoices')
    .select('status, total_amount')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch invoice summary: ${error.message}`);
  }

  const summary = {
    totalDraft: 0,
    totalSent: 0,
    totalPaid: 0,
    amountDraft: 0,
    amountSent: 0,
    amountPaid: 0,
  };

  for (const invoice of data || []) {
    switch (invoice.status) {
      case 'draft':
        summary.totalDraft++;
        summary.amountDraft += invoice.total_amount;
        break;
      case 'sent':
        summary.totalSent++;
        summary.amountSent += invoice.total_amount;
        break;
      case 'paid':
        summary.totalPaid++;
        summary.amountPaid += invoice.total_amount;
        break;
    }
  }

  return summary;
}
