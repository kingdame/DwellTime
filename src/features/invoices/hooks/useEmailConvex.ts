/**
 * Email Hooks - Convex-based email sending
 */

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// EMAIL ACTIONS
// ============================================================================

/**
 * Send an invoice email
 */
export function useSendInvoiceEmail() {
  return useAction(api.email.sendInvoiceEmail);
}

/**
 * Log an email send
 */
export function useLogEmailSend() {
  return useMutation(api.email.logEmailSend);
}

/**
 * Get email logs for an invoice
 */
export function useEmailLogs(invoiceId: Id<"invoices"> | undefined) {
  return useQuery(
    api.email.getEmailLogs,
    invoiceId ? { invoiceId } : "skip"
  );
}

// ============================================================================
// COMBINED SEND & LOG HELPER
// ============================================================================

/**
 * Hook that provides a combined send and log function
 */
export function useSendAndLogEmail() {
  const sendEmail = useAction(api.email.sendInvoiceEmail);
  const logEmail = useMutation(api.email.logEmailSend);

  const sendAndLog = async (params: {
    invoiceId: Id<"invoices">;
    userId: Id<"users">;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    customMessage?: string;
    pdfUrl?: string;
    emailType: "initial" | "reminder" | "follow_up";
  }) => {
    // Send the email
    const result = await sendEmail({
      invoiceId: params.invoiceId,
      userId: params.userId,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      subject: params.subject,
      customMessage: params.customMessage,
      pdfUrl: params.pdfUrl,
    });

    // Log the result
    await logEmail({
      invoiceId: params.invoiceId,
      userId: params.userId,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      emailType: params.emailType,
      subject: params.subject,
      customMessage: params.customMessage,
      messageId: result.success ? result.messageId : undefined,
      status: result.success ? "sent" : "failed",
      errorMessage: result.success ? undefined : result.error,
    });

    return result;
  };

  return sendAndLog;
}
