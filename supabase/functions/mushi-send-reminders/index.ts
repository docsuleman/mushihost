import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { SendMailClient } from 'https://esm.sh/zeptomail?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';

const SUPABASE_URL = resolveSupabaseUrl();
const ZEPTO_TOKEN = Deno.env.get('ZEPTO_MAIL_TOKEN') ?? '';
const FROM_EMAIL = 'payments@mushihost.com';
const FROM_NAME = 'MushiHost Payments';
const MUSHIHOST_URL = Deno.env.get('MUSHIHOST_URL') || 'https://mushihost.com';

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results: Array<{ type: string; email: string; status: string }> = [];

    // 1. Send unsent reminders
    const { data: pendingReminders } = await supabaseAdmin
      .from('mushi_reminders')
      .select('*, customer:mushi_customers(email, first_name), subscription:mushi_subscriptions(*, product:mushi_products(name, price_usd))')
      .is('sent_at', null)
      .lte('scheduled_for', new Date().toISOString())
      .limit(100);

    if (pendingReminders && pendingReminders.length > 0) {
      const client = new SendMailClient({ url: 'api.zeptomail.com/', token: ZEPTO_TOKEN });

      for (const reminder of pendingReminders) {
        try {
          const emailContent = buildEmailContent(reminder);

          await client.sendMail({
            from: { address: FROM_EMAIL, name: FROM_NAME },
            to: [{ email_address: { address: reminder.email, name: reminder.customer?.first_name || '' } }],
            subject: emailContent.subject,
            htmlbody: emailContent.html,
          });

          await supabaseAdmin
            .from('mushi_reminders')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', reminder.id);

          results.push({ type: reminder.type, email: reminder.email, status: 'sent' });
        } catch (err) {
          console.error(`Failed to send reminder to ${reminder.email}:`, err);
          results.push({ type: reminder.type, email: reminder.email, status: `error: ${err.message}` });
        }
      }
    }

    // 2. Schedule renewal reminders for subscriptions expiring in 24-48 hours
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const { data: expiringSubs } = await supabaseAdmin
      .from('mushi_subscriptions')
      .select('*, customer:mushi_customers(id, email, first_name), product:mushi_products(name)')
      .eq('status', 'active')
      .gte('current_period_end', tomorrow.toISOString())
      .lte('current_period_end', dayAfter.toISOString());

    if (expiringSubs) {
      for (const sub of expiringSubs) {
        // Check if reminder already scheduled
        const { data: existingReminder } = await supabaseAdmin
          .from('mushi_reminders')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('type', 'renewal_reminder')
          .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
          .single();

        if (!existingReminder) {
          await supabaseAdmin.from('mushi_reminders').insert({
            customer_id: sub.customer.id,
            subscription_id: sub.id,
            type: 'renewal_reminder',
            scheduled_for: new Date().toISOString(),
            email: sub.customer.email,
          });
          results.push({ type: 'renewal_scheduled', email: sub.customer.email, status: 'scheduled' });
        }
      }
    }

    return jsonResponse({ processed: results.length, results });
  } catch (err) {
    console.error('Error in mushi-send-reminders:', err);
    return errorResponse(err.message, 500);
  }
};

function buildEmailContent(reminder: Record<string, unknown>): { subject: string; html: string } {
  const name = (reminder.customer as Record<string, unknown>)?.first_name || 'there';
  const sub = reminder.subscription as Record<string, unknown>;
  const product = sub?.product as Record<string, unknown>;

  switch (reminder.type) {
    case 'renewal_reminder': {
      const productName = product?.name || 'your subscription';
      const amount = product?.price_usd || '';
      const periodEnd = sub?.current_period_end
        ? new Date(sub.current_period_end as string).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'soon';

      return {
        subject: `Renewal Reminder: ${productName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1a1a1a;">Subscription Renewal Reminder</h2>
            <p>Hi ${name},</p>
            <p>Your <strong>${productName}</strong> subscription will renew on <strong>${periodEnd}</strong> for <strong>$${amount}</strong>.</p>
            <p>If you want to make any changes, you can manage your subscription from the dashboard:</p>
            <p><a href="${MUSHIHOST_URL}/dashboard/subscriptions" style="display: inline-block; padding: 12px 24px; background: #6d28d9; color: white; text-decoration: none; border-radius: 8px;">Manage Subscription</a></p>
            <p style="color: #666; font-size: 14px;">If you have any questions, please reply to this email.</p>
          </div>
        `,
      };
    }

    case 'credit_low':
      return {
        subject: 'Your MyQBank credits are running low',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1a1a1a;">Credits Running Low</h2>
            <p>Hi ${name},</p>
            <p>Your MyQBank credit balance is running low. Top up now to continue practicing:</p>
            <p><a href="${MUSHIHOST_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #6d28d9; color: white; text-decoration: none; border-radius: 8px;">Buy Credits</a></p>
            <p style="color: #666; font-size: 14px;">You can also enable auto-load to automatically top up when credits run low.</p>
          </div>
        `,
      };

    case 'payment_failed':
      return {
        subject: 'Payment Failed - Action Required',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #dc2626;">Payment Failed</h2>
            <p>Hi ${name},</p>
            <p>We were unable to process your payment. Please update your payment method to avoid service interruption:</p>
            <p><a href="${MUSHIHOST_URL}/dashboard/methods" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px;">Update Payment Method</a></p>
          </div>
        `,
      };

    default:
      return {
        subject: 'MushiHost Notification',
        html: `<p>You have a notification from MushiHost. <a href="${MUSHIHOST_URL}/dashboard">View Dashboard</a></p>`,
      };
  }
}

Deno.serve(handler);
