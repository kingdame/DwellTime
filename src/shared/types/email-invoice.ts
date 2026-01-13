/**
 * Email Invoice Feature Types
 * Phase 7B: Email contacts and invoice email tracking
 */

export interface EmailContact {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  company: string | null;
  contact_type: 'broker' | 'shipper' | 'dispatcher' | 'other' | null;
  use_count: number;
  last_used_at: string | null;
  created_at: string;
}

export interface InvoiceEmail {
  id: string;
  invoice_id: string;
  user_id: string;
  recipient_email: string;
  recipient_name: string | null;
  email_type: 'initial' | 'reminder' | 'follow_up';
  subject: string | null;
  custom_message: string | null;
  message_id: string | null;
  status: 'pending' | 'sent' | 'failed' | 'bounced' | 'delivered';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

// Insert types for Supabase operations
export type EmailContactInsert = Omit<EmailContact, 'id' | 'created_at' | 'use_count'> & {
  id?: string;
  created_at?: string;
  use_count?: number;
};

export type EmailContactUpdate = Partial<Omit<EmailContact, 'id' | 'created_at'>>;

export type InvoiceEmailInsert = Omit<InvoiceEmail, 'id' | 'created_at' | 'status'> & {
  id?: string;
  created_at?: string;
  status?: InvoiceEmail['status'];
};

export type InvoiceEmailUpdate = Partial<Omit<InvoiceEmail, 'id' | 'created_at'>>;
