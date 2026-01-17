/**
 * Invoice Aging Hooks - Convex-based
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { AgingInvoice, AgingBucket } from "@/shared/types/recovery";

/**
 * Get aging buckets summary
 */
export function useAgingBuckets(userId: Id<"users"> | undefined) {
  const stats = useQuery(
    api.invoices.getAgingSummary,
    userId ? { userId } : "skip"
  );
  
  if (!stats) return undefined;
  
  // Transform to AgingBucket format
  return stats.agingBuckets || [];
}

/**
 * Get aging invoices
 */
export function useAgingInvoices(userId: Id<"users"> | undefined, bucket?: string) {
  const invoices = useQuery(
    api.invoices.list,
    userId ? { userId, limit: 100 } : "skip"
  );
  
  if (!invoices) return undefined;
  
  // Transform to AgingInvoice format and filter by bucket if needed
  const agingInvoices: AgingInvoice[] = invoices.map(inv => {
    const daysSinceSent = inv.sentAt 
      ? Math.floor((Date.now() - inv.sentAt) / (1000 * 60 * 60 * 24))
      : 0;
    
    let bucketName: string;
    if (daysSinceSent <= 30) bucketName = '0-30';
    else if (daysSinceSent <= 60) bucketName = '31-60';
    else if (daysSinceSent <= 90) bucketName = '61-90';
    else bucketName = '90+';
    
    return {
      id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      recipientName: inv.recipientName || 'Unknown',
      recipientEmail: inv.recipientEmail || '',
      amount: inv.totalAmount,
      sentAt: inv.sentAt ? new Date(inv.sentAt).toISOString() : null,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString() : null,
      daysSinceSent,
      bucket: bucketName,
      status: inv.status,
    } as AgingInvoice;
  });
  
  if (bucket) {
    return agingInvoices.filter(inv => inv.bucket === bucket);
  }
  
  return agingInvoices;
}

/**
 * Get reminders due (invoices that should receive follow-up)
 */
export function useRemindersDue(userId: Id<"users"> | undefined) {
  const invoices = useAgingInvoices(userId);
  
  if (!invoices) return undefined;
  
  // Return invoices that are overdue (30+ days) and not paid
  return invoices.filter(inv => 
    inv.daysSinceSent >= 30 && 
    inv.status !== 'paid'
  );
}

/**
 * Mark invoice as paid
 */
export function useMarkPaid() {
  return useMutation(api.invoices.markPaid);
}
