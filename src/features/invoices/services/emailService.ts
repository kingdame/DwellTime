/**
 * Email Service
 * Handles invoice email sending and contact management
 */

import { supabase } from '@/shared/lib/supabase';

export interface SendInvoiceEmailInput {
  invoiceId: string;
  recipientEmail: string;
  recipientName?: string;
  customMessage?: string;
  ccEmails?: string[];
}

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

export interface EmailContactInput {
  user_id: string;
  email: string;
  name?: string;
  company?: string;
  contact_type?: 'broker' | 'shipper' | 'dispatcher' | 'other';
}

export interface InvoiceEmail {
  id: string;
  invoice_id: string;
  recipient_email: string;
  recipient_name: string | null;
  cc_emails: string[] | null;
  custom_message: string | null;
  status: 'pending' | 'sent' | 'failed';
  message_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

/**
 * Send invoice email via Supabase Edge Function
 */
export async function sendInvoiceEmail(
  input: SendInvoiceEmailInput
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke('send-invoice-email', {
    body: input,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data as { success: boolean; messageId?: string; error?: string };
}

/**
 * Fetch user's email contacts ordered by usage
 */
export async function fetchEmailContacts(userId: string): Promise<EmailContact[]> {
  const { data, error } = await supabase
    .from('email_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('use_count', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return data || [];
}

/**
 * Save or update an email contact
 */
export async function saveEmailContact(
  input: EmailContactInput
): Promise<EmailContact> {
  const { data, error } = await supabase
    .from('email_contacts')
    .upsert(
      {
        ...input,
        use_count: 1,
        last_used_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,email',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save contact: ${error.message}`);
  }

  return data;
}

/**
 * Increment contact usage count
 */
export async function incrementContactUsage(contactId: string): Promise<void> {
  // Try RPC first for atomic increment
  const { error: rpcError } = await supabase.rpc('increment_contact_usage', {
    contact_id: contactId,
  });

  // Fallback if RPC doesn't exist
  if (rpcError) {
    const { data: contact } = await supabase
      .from('email_contacts')
      .select('use_count')
      .eq('id', contactId)
      .single();

    if (contact) {
      await supabase
        .from('email_contacts')
        .update({
          use_count: contact.use_count + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', contactId);
    }
  }
}

/**
 * Delete an email contact
 */
export async function deleteEmailContact(contactId: string): Promise<void> {
  const { error } = await supabase
    .from('email_contacts')
    .delete()
    .eq('id', contactId);

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
}

/**
 * Fetch email history for an invoice
 */
export async function fetchInvoiceEmailHistory(
  invoiceId: string
): Promise<InvoiceEmail[]> {
  const { data, error } = await supabase
    .from('invoice_emails')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch email history: ${error.message}`);
  }

  return data || [];
}

/**
 * Search contacts by email or name
 */
export async function searchEmailContacts(
  userId: string,
  query: string
): Promise<EmailContact[]> {
  const { data, error } = await supabase
    .from('email_contacts')
    .select('*')
    .eq('user_id', userId)
    .or(`email.ilike.%${query}%,name.ilike.%${query}%,company.ilike.%${query}%`)
    .order('use_count', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Failed to search contacts: ${error.message}`);
  }

  return data || [];
}

/**
 * Get frequently used contacts
 */
export async function getFrequentContacts(
  userId: string,
  limit: number = 5
): Promise<EmailContact[]> {
  const { data, error } = await supabase
    .from('email_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('use_count', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch frequent contacts: ${error.message}`);
  }

  return data || [];
}

/**
 * Update an existing email contact
 */
export async function updateEmailContact(
  contactId: string,
  updates: Partial<Omit<EmailContactInput, 'user_id'>>
): Promise<EmailContact> {
  const { data, error } = await supabase
    .from('email_contacts')
    .update(updates)
    .eq('id', contactId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`);
  }

  return data;
}

/**
 * Fetch contacts by type
 */
export async function fetchContactsByType(
  userId: string,
  contactType: 'broker' | 'shipper' | 'dispatcher' | 'other'
): Promise<EmailContact[]> {
  const { data, error } = await supabase
    .from('email_contacts')
    .select('*')
    .eq('user_id', userId)
    .eq('contact_type', contactType)
    .order('use_count', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch contacts by type: ${error.message}`);
  }

  return data || [];
}

/**
 * Get contact statistics
 */
export async function getContactStats(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
}> {
  const { data, error } = await supabase
    .from('email_contacts')
    .select('contact_type')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch contact stats: ${error.message}`);
  }

  const contacts = data || [];
  const byType: Record<string, number> = {
    broker: 0,
    shipper: 0,
    dispatcher: 0,
    other: 0,
  };

  contacts.forEach((c) => {
    const type = c.contact_type || 'other';
    byType[type] = (byType[type] || 0) + 1;
  });

  return {
    total: contacts.length,
    byType,
  };
}
