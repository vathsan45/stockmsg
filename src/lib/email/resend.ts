// ==============================================================================
// RESEND EMAIL DELIVERY SERVICE
// ==============================================================================
import { FullDailyMarketReport } from '../types';
import { renderMarketReportEmailHTML } from './template';
import { Resend } from 'resend';

export async function sendDailyMarketReport(
  report: FullDailyMarketReport
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.REPORT_RECIPIENT_EMAIL;
  const sender = process.env.REPORT_FROM_EMAIL || 'Stock Intelligence <onboarding@resend.dev>';

  const htmlContent = renderMarketReportEmailHTML(report);
  const subject = `Indian Market Daily — ${report.tradingDate}`;

  if (!apiKey || process.env.USE_MOCK_DATA === 'true') {
    console.log(`[EMAIL] Mock/Dev Mode: RESEND_API_KEY not active. Skipping live dispatch.`);
    console.log(`[EMAIL] Subject: "${subject}" | Recipient: "${recipient || 'test@example.com'}"`);
    return {
      success: true,
      messageId: `mock-email-id-${Date.now()}`,
    };
  }

  if (!recipient) {
    console.error('[EMAIL] REPORT_RECIPIENT_EMAIL environment variable is missing.');
    return {
      success: false,
      error: 'Missing REPORT_RECIPIENT_EMAIL env variable.',
    };
  }

  try {
    console.log(`[EMAIL] Sending daily market report email to ${recipient}...`);
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: sender,
      to: [recipient],
      subject,
      html: htmlContent,
    });

    if (data.error) {
      console.error('[EMAIL] Resend returned error:', data.error);
      return { success: false, error: data.error.message };
    }

    console.log(`[EMAIL] Email sent successfully! Message ID: ${data.data?.id}`);
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error('[EMAIL] Resend dispatch exception:', err?.message || err);
    return { success: false, error: err?.message || 'Email sending failed' };
  }
}
