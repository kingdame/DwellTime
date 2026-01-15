/**
 * Email Actions - Send emails via Resend
 *
 * Setup required:
 * 1. Set RESEND_API_KEY in Convex environment
 * 2. Verify your domain in Resend dashboard
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// ============================================================================
// EMAIL SENDING ACTION
// ============================================================================

/**
 * Send an invoice email via Resend
 */
export const sendInvoiceEmail = action({
  args: {
    invoiceId: v.id("invoices"),
    userId: v.id("users"),
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    subject: v.string(),
    customMessage: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      throw new Error("Resend API key not configured");
    }

    // Build email HTML
    const html = buildInvoiceEmailHtml({
      recipientName: args.recipientName,
      customMessage: args.customMessage,
      pdfUrl: args.pdfUrl,
    });

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "DwellTime <invoices@yourdomain.com>", // Update with your verified domain
          to: args.recipientEmail,
          subject: args.subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      const result = await response.json();

      // Log the email send (we'll call a mutation for this)
      return {
        success: true,
        messageId: result.id,
      };
    } catch (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Send a fleet invoice email
 */
export const sendFleetInvoiceEmail = action({
  args: {
    fleetInvoiceId: v.id("fleetInvoices"),
    userId: v.id("users"),
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    subject: v.string(),
    customMessage: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      throw new Error("Resend API key not configured");
    }

    const html = buildInvoiceEmailHtml({
      recipientName: args.recipientName,
      customMessage: args.customMessage,
      pdfUrl: args.pdfUrl,
      isFleetInvoice: true,
    });

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "DwellTime <invoices@yourdomain.com>",
          to: args.recipientEmail,
          subject: args.subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      const result = await response.json();

      return {
        success: true,
        messageId: result.id,
      };
    } catch (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// ============================================================================
// INVOICE EMAIL LOG
// ============================================================================

/**
 * Log an email send
 */
export const logEmailSend = mutation({
  args: {
    invoiceId: v.id("invoices"),
    userId: v.id("users"),
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    emailType: v.union(
      v.literal("initial"),
      v.literal("reminder"),
      v.literal("follow_up")
    ),
    subject: v.optional(v.string()),
    customMessage: v.optional(v.string()),
    messageId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("bounced"),
      v.literal("delivered")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("invoiceEmails", {
      invoiceId: args.invoiceId,
      userId: args.userId,
      recipientEmail: args.recipientEmail,
      recipientName: args.recipientName,
      emailType: args.emailType,
      subject: args.subject,
      customMessage: args.customMessage,
      messageId: args.messageId,
      status: args.status,
      errorMessage: args.errorMessage,
      sentAt: args.status === "sent" ? Date.now() : undefined,
    });
  },
});

/**
 * Get email logs for an invoice
 */
export const getEmailLogs = query({
  args: {
    invoiceId: v.id("invoices"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoiceEmails")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", args.invoiceId))
      .order("desc")
      .collect();
  },
});

// ============================================================================
// HELPERS
// ============================================================================

function buildInvoiceEmailHtml(options: {
  recipientName?: string;
  customMessage?: string;
  pdfUrl?: string;
  isFleetInvoice?: boolean;
}) {
  const greeting = options.recipientName
    ? `Dear ${options.recipientName},`
    : "Hello,";

  const invoiceType = options.isFleetInvoice
    ? "consolidated fleet invoice"
    : "detention invoice";

  const customSection = options.customMessage
    ? `<p>${options.customMessage}</p>`
    : "";

  const pdfSection = options.pdfUrl
    ? `<p><a href="${options.pdfUrl}" style="background: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Invoice PDF</a></p>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a56db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">DwellTime</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">Detention Invoice</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p>${greeting}</p>
        
        <p>Please find attached your ${invoiceType} for detention time charges.</p>
        
        ${customSection}
        
        ${pdfSection}
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions about this invoice, please don't hesitate to contact us.
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Thank you for your business.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>Sent via DwellTime - Detention Time Tracking</p>
      </div>
    </body>
    </html>
  `;
}
