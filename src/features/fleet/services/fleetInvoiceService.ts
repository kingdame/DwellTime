/**
 * Fleet Invoice Service
 * Handles team invoice consolidation and management
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/shared/lib/supabase';
import type { UUID, Invoice, DetentionEvent } from '@/shared/types';

// Fleet invoice types
export type FleetInvoiceStatus = 'draft' | 'sent' | 'paid' | 'void';

export interface FleetInvoice {
  id: UUID;
  fleet_id: UUID;
  invoice_number: string;
  member_invoice_ids: UUID[];
  total_amount: number;
  status: FleetInvoiceStatus;
  recipient_email: string | null;
  recipient_name: string | null;
  recipient_company: string | null;
  notes: string | null;
  pdf_url: string | null;
  sent_at: string | null;
  paid_at: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FleetInvoiceWithDetails extends FleetInvoice {
  fleet: {
    name: string;
    company_name: string | null;
    billing_email: string | null;
  };
  memberInvoices: MemberInvoiceDetail[];
}

export interface MemberInvoiceDetail {
  invoiceId: string;
  invoiceNumber: string;
  memberName: string | null;
  memberEmail: string;
  totalAmount: number;
  eventCount: number;
  status: Invoice['status'];
}

export interface FleetInvoiceLineItem {
  date: string;
  memberName: string;
  facilityName: string;
  eventType: 'pickup' | 'delivery';
  detentionMinutes: number;
  hourlyRate: number;
  amount: number;
}

export interface CreateFleetInvoiceInput {
  invoiceIds: string[];
  recipientEmail?: string;
  recipientName?: string;
  recipientCompany?: string;
  notes?: string;
  dueDate?: string;
}

/**
 * Generate a unique fleet invoice number
 */
function generateFleetInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FLT-${year}${month}-${random}`;
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
 * Create a fleet invoice consolidating member invoices
 */
export async function createFleetInvoice(
  fleetId: string,
  input: CreateFleetInvoiceInput
): Promise<FleetInvoice> {
  const { invoiceIds, recipientEmail, recipientName, recipientCompany, notes, dueDate } = input;

  if (!invoiceIds || invoiceIds.length === 0) {
    throw new Error('At least one invoice is required');
  }

  // Fetch the member invoices
  const { data: memberInvoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .in('id', invoiceIds);

  if (invoicesError) {
    throw new Error(`Failed to fetch member invoices: ${invoicesError.message}`);
  }

  if (!memberInvoices || memberInvoices.length === 0) {
    throw new Error('No valid invoices found');
  }

  // Verify invoices are not already consolidated
  const { data: existingConsolidation } = await supabase
    .from('fleet_invoices')
    .select('id, member_invoice_ids')
    .eq('fleet_id', fleetId)
    .neq('status', 'void');

  const alreadyConsolidated = (existingConsolidation || []).some((fi) =>
    invoiceIds.some((id) => fi.member_invoice_ids.includes(id))
  );

  if (alreadyConsolidated) {
    throw new Error('One or more invoices are already part of a fleet invoice');
  }

  // Calculate total
  const totalAmount = memberInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  // Generate invoice number
  const invoiceNumber = generateFleetInvoiceNumber();

  // Default due date to 30 days from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);

  // Create fleet invoice
  const { data, error } = await supabase
    .from('fleet_invoices')
    .insert({
      fleet_id: fleetId,
      invoice_number: invoiceNumber,
      member_invoice_ids: invoiceIds,
      total_amount: totalAmount,
      status: 'draft',
      recipient_email: recipientEmail || null,
      recipient_name: recipientName || null,
      recipient_company: recipientCompany || null,
      notes: notes || null,
      due_date: dueDate || defaultDueDate.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create fleet invoice: ${error.message}`);
  }

  return data;
}

/**
 * Fetch fleet invoices
 */
export async function fetchFleetInvoices(
  fleetId: string,
  status?: FleetInvoiceStatus
): Promise<FleetInvoice[]> {
  let query = supabase
    .from('fleet_invoices')
    .select('*')
    .eq('fleet_id', fleetId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch fleet invoices: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch fleet invoice with full details
 */
export async function fetchFleetInvoiceWithDetails(
  invoiceId: string
): Promise<FleetInvoiceWithDetails | null> {
  // Fetch fleet invoice
  const { data: fleetInvoice, error: invoiceError } = await supabase
    .from('fleet_invoices')
    .select(`
      *,
      fleets (name, company_name, billing_email)
    `)
    .eq('id', invoiceId)
    .single();

  if (invoiceError) {
    if (invoiceError.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch fleet invoice: ${invoiceError.message}`);
  }

  // Fetch member invoices with user details
  const { data: memberInvoices, error: membersError } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      total_amount,
      detention_event_ids,
      status,
      users (name, email)
    `)
    .in('id', fleetInvoice.member_invoice_ids);

  if (membersError) {
    throw new Error(`Failed to fetch member invoices: ${membersError.message}`);
  }

  const memberInvoiceDetails: MemberInvoiceDetail[] = (memberInvoices || []).map((inv) => ({
    invoiceId: inv.id,
    invoiceNumber: inv.invoice_number,
    memberName: (inv.users as any)?.name || null,
    memberEmail: (inv.users as any)?.email || '',
    totalAmount: inv.total_amount,
    eventCount: inv.detention_event_ids?.length || 0,
    status: inv.status,
  }));

  return {
    ...fleetInvoice,
    fleet: fleetInvoice.fleets as unknown as FleetInvoiceWithDetails['fleet'],
    memberInvoices: memberInvoiceDetails,
  };
}

/**
 * Update fleet invoice status
 */
export async function updateFleetInvoiceStatus(
  invoiceId: string,
  status: FleetInvoiceStatus
): Promise<FleetInvoice> {
  const updates: Partial<FleetInvoice> = { status };

  if (status === 'sent') {
    updates.sent_at = new Date().toISOString();
  } else if (status === 'paid') {
    updates.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('fleet_invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update fleet invoice: ${error.message}`);
  }

  // If marked as paid, update underlying member invoices
  if (status === 'paid') {
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .in('id', data.member_invoice_ids);
  }

  return data;
}

/**
 * Generate fleet invoice HTML for PDF
 */
async function generateFleetInvoiceHtml(
  invoice: FleetInvoiceWithDetails
): Promise<string> {
  const { fleet, memberInvoices } = invoice;

  // Fetch all detention events for line items
  const allEventIds: string[] = [];
  const invoiceEventMap = new Map<string, string[]>();

  for (const mi of memberInvoices) {
    const { data: inv } = await supabase
      .from('invoices')
      .select('detention_event_ids')
      .eq('id', mi.invoiceId)
      .single();

    if (inv?.detention_event_ids) {
      allEventIds.push(...inv.detention_event_ids);
      invoiceEventMap.set(mi.invoiceId, inv.detention_event_ids);
    }
  }

  // Fetch events with facilities
  const { data: events } = await supabase
    .from('detention_events')
    .select(`
      *,
      facilities (name),
      users (name)
    `)
    .in('id', allEventIds)
    .order('arrival_time', { ascending: false });

  // Build line items
  const lineItems: FleetInvoiceLineItem[] = (events || []).map((event) => ({
    date: event.arrival_time,
    memberName: (event.users as any)?.name || 'Unknown Driver',
    facilityName: (event.facilities as any)?.name || 'Unknown Facility',
    eventType: event.event_type,
    detentionMinutes: event.detention_minutes,
    hourlyRate: event.hourly_rate,
    amount: event.total_amount,
  }));

  const issueDate = formatDate(invoice.created_at);
  const dueDate = invoice.due_date ? formatDate(invoice.due_date) : formatDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  );

  // Summary by member
  const memberSummaryHtml = memberInvoices
    .map(
      (mi) => `
      <tr>
        <td>${mi.memberName || 'Unknown'}</td>
        <td>${mi.invoiceNumber}</td>
        <td>${mi.eventCount}</td>
        <td style="text-align: right;">${formatCurrency(mi.totalAmount)}</td>
      </tr>
    `
    )
    .join('');

  // Detailed line items
  const lineItemsHtml = lineItems
    .map(
      (item) => `
      <tr>
        <td>${formatDate(item.date)}</td>
        <td>${item.memberName}</td>
        <td>${item.facilityName}</td>
        <td style="text-transform: capitalize;">${item.eventType}</td>
        <td>${formatDuration(item.detentionMinutes)}</td>
        <td>${formatCurrency(item.hourlyRate)}/hr</td>
        <td style="text-align: right;">${formatCurrency(item.amount)}</td>
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
      <title>Fleet Invoice ${invoice.invoice_number}</title>
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
          font-size: 28px;
          color: #333;
          margin-bottom: 8px;
        }
        .invoice-number {
          font-size: 16px;
          color: #666;
        }
        .fleet-badge {
          display: inline-block;
          background: #1a56db;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 8px;
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
        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin: 30px 0 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #f8f9fa;
          text-align: left;
          padding: 10px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
          border-bottom: 2px solid #e5e7eb;
        }
        th:last-child {
          text-align: right;
        }
        td {
          padding: 10px;
          font-size: 13px;
          border-bottom: 1px solid #e5e7eb;
        }
        .totals {
          display: flex;
          justify-content: flex-end;
          margin: 30px 0;
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
        .notes {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .notes h3 {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .notes p {
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
          <h1>${fleet.company_name || fleet.name}</h1>
          <p>${fleet.name}</p>
          ${fleet.billing_email ? `<p>${fleet.billing_email}</p>` : ''}
          <span class="fleet-badge">FLEET CONSOLIDATED</span>
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
          ${invoice.recipient_company ? `<p><strong>${invoice.recipient_company}</strong></p>` : ''}
          ${invoice.recipient_name ? `<p>${invoice.recipient_name}</p>` : ''}
          ${invoice.recipient_email ? `<p>${invoice.recipient_email}</p>` : ''}
        </div>
        <div class="info-block" style="text-align: right;">
          <h3>Invoice Details</h3>
          <p>Issue Date: <span class="highlight">${issueDate}</span></p>
          <p>Due Date: <span class="highlight">${dueDate}</span></p>
          <p>Drivers: <span class="highlight">${memberInvoices.length}</span></p>
          <p>Total Events: <span class="highlight">${lineItems.length}</span></p>
        </div>
      </div>

      <h3 class="section-title">Driver Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Driver</th>
            <th>Invoice #</th>
            <th>Events</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${memberSummaryHtml}
        </tbody>
      </table>

      <h3 class="section-title">Detailed Events</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Driver</th>
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
            <span>Subtotal (${memberInvoices.length} drivers)</span>
            <span>${formatCurrency(invoice.total_amount)}</span>
          </div>
          <div class="totals-row total">
            <span>Total Due</span>
            <span class="amount">${formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <h3>Notes</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}

      <div class="notes">
        <h3>Payment Terms</h3>
        <p>Payment is due by ${dueDate}. Please reference invoice number ${invoice.invoice_number} with your payment.</p>
      </div>

      <div class="footer">
        <p>Generated by DwellTime Fleet Management</p>
        <p>Questions? Contact ${fleet.billing_email || 'support@dwelltime.app'}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate PDF from fleet invoice
 */
export async function generateFleetInvoicePDF(
  invoiceId: string
): Promise<string> {
  const invoice = await fetchFleetInvoiceWithDetails(invoiceId);

  if (!invoice) {
    throw new Error('Fleet invoice not found');
  }

  const html = await generateFleetInvoiceHtml(invoice);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

/**
 * Share fleet invoice as PDF
 */
export async function shareFleetInvoicePDF(invoiceId: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }

  const invoice = await fetchFleetInvoiceWithDetails(invoiceId);
  if (!invoice) {
    throw new Error('Fleet invoice not found');
  }

  const pdfUri = await generateFleetInvoicePDF(invoiceId);
  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    dialogTitle: `Fleet Invoice ${invoice.invoice_number}`,
    UTI: 'com.adobe.pdf',
  });
}

/**
 * Delete a fleet invoice (only drafts can be deleted)
 */
export async function deleteFleetInvoice(invoiceId: string): Promise<void> {
  const { data: invoice, error: fetchError } = await supabase
    .from('fleet_invoices')
    .select('status')
    .eq('id', invoiceId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch invoice: ${fetchError.message}`);
  }

  if (invoice.status !== 'draft') {
    throw new Error('Only draft invoices can be deleted');
  }

  const { error: deleteError } = await supabase
    .from('fleet_invoices')
    .delete()
    .eq('id', invoiceId);

  if (deleteError) {
    throw new Error(`Failed to delete invoice: ${deleteError.message}`);
  }
}

/**
 * Get fleet invoice summary stats
 */
export async function getFleetInvoiceSummary(fleetId: string): Promise<{
  totalDraft: number;
  totalSent: number;
  totalPaid: number;
  amountDraft: number;
  amountSent: number;
  amountPaid: number;
}> {
  const { data, error } = await supabase
    .from('fleet_invoices')
    .select('status, total_amount')
    .eq('fleet_id', fleetId);

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
