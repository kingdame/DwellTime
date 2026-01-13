// supabase/functions/send-invoice-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  invoiceId: string;
  recipientEmail: string;
  recipientName?: string;
  customMessage?: string;
  ccEmails?: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const { invoiceId, recipientEmail, recipientName, customMessage, ccEmails } =
      await req.json() as SendEmailRequest;

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch invoice with detention events
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        users:user_id (name, email, company_name, phone),
        detention_events (
          id,
          facility_name,
          arrival_time,
          departure_time,
          detention_minutes,
          detention_amount,
          event_type
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    // Generate HTML email
    const emailHtml = generateInvoiceEmailHtml(invoice, customMessage, recipientName);

    // Send via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DwellTime <invoices@dwelltime.app>',
        to: recipientEmail,
        cc: ccEmails,
        subject: `Invoice ${invoice.invoice_number} - Detention Claim - $${invoice.total_amount.toFixed(2)}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();
    const success = resendResponse.ok;

    // Log the email send
    await supabase.from('invoice_emails').insert({
      invoice_id: invoiceId,
      user_id: invoice.user_id,
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      email_type: 'initial',
      subject: `Invoice ${invoice.invoice_number} - Detention Claim`,
      custom_message: customMessage || null,
      message_id: resendData.id || null,
      status: success ? 'sent' : 'failed',
      error_message: success ? null : resendData.message,
      sent_at: success ? new Date().toISOString() : null,
    });

    // Update invoice status to 'sent' if successful
    if (success) {
      await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
    }

    return new Response(
      JSON.stringify({
        success,
        messageId: resendData.id,
        error: success ? null : resendData.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: success ? 200 : 400,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateInvoiceEmailHtml(
  invoice: any,
  customMessage?: string,
  recipientName?: string
): string {
  const events = invoice.detention_events || [];
  const totalHours = Math.floor(events.reduce((sum: number, e: any) =>
    sum + (e.detention_minutes || 0), 0) / 60);
  const totalMinutes = events.reduce((sum: number, e: any) =>
    sum + (e.detention_minutes || 0), 0) % 60;

  const defaultMessage = `Please find attached our invoice for detention time documented at your facility. This invoice includes GPS-verified timestamps and documentation.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #10b981; padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">DwellTime</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">GPS-Verified Detention Tracking</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 16px;">
              <p style="margin: 0; color: #374151; font-size: 16px;">
                ${recipientName ? `Dear ${recipientName},` : 'Hello,'}
              </p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                ${customMessage || defaultMessage}
              </p>
            </td>
          </tr>

          <!-- Invoice Summary Card -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Number</p>
                          <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">${invoice.invoice_number}</p>
                        </td>
                        <td style="text-align: right;">
                          <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Due</p>
                          <p style="margin: 0; color: #10b981; font-size: 24px; font-weight: 700;">$${invoice.total_amount.toFixed(2)}</p>
                        </td>
                      </tr>
                    </table>

                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">

                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding-right: 16px;">
                          <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px;">Events</p>
                          <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 500;">${events.length}</p>
                        </td>
                        <td style="padding-right: 16px;">
                          <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px;">Total Time</p>
                          <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 500;">${totalHours}h ${totalMinutes}m</p>
                        </td>
                        <td>
                          <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px;">Date</p>
                          <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 500;">${new Date(invoice.created_at).toLocaleDateString()}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GPS Verification Badge -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" style="width: 100%; background-color: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #10b981; border-radius: 50%; text-align: center; line-height: 24px; color: white; font-size: 14px;">✓</div>
                        </td>
                        <td>
                          <p style="margin: 0 0 4px; color: #065f46; font-size: 14px; font-weight: 600;">GPS-Verified Documentation</p>
                          <p style="margin: 0; color: #047857; font-size: 13px;">All timestamps verified by GPS location data with evidence chain.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Terms -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                <strong style="color: #374151;">Payment Terms:</strong> Net 30 days<br>
                Please reference invoice number <strong>${invoice.invoice_number}</strong> with your payment.
              </p>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Questions? Contact ${invoice.users?.name || 'us'} at
                <a href="mailto:${invoice.users?.email}" style="color: #10b981; text-decoration: none;">${invoice.users?.email}</a>
                ${invoice.users?.phone ? ` or ${invoice.users.phone}` : ''}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-align: center;">
                This invoice was generated by DwellTime - GPS-Verified Detention Tracking
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} DwellTime. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
