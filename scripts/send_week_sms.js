/*
  Broadcast application submission confirmation SMS to week-to-date (UTC) submissions.
  - Concurrency: 5
  - Logs successes/failures
  - Uses Twilio directly with sender "Gemurai"
*/

const { Pool } = require('pg');
require('dotenv').config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('Missing Twilio credentials. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  process.exit(1);
}

function startOfWeekUTC(now) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = (d.getUTCDay() + 6) % 7; // 0=Mon..6=Sun
  const monday = new Date(d.getTime() - day * 86400000);
  return monday; // UTC Monday 00:00
}

function cleanName(formData) {
  const first = formData?.q1 || formData?.firstName || formData?.FirstName || formData?.name || 'there';
  return String(first).trim() || 'there';
}

function normalizeRwandaPhone(raw) {
  const digits = String(raw || '').replace(/\D+/g, '');
  if (!digits) return null;
  if (digits.startsWith('07') && digits.length === 10) return `+250${digits}`;
  if (digits.startsWith('2507') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length >= 9) return `+250${digits.slice(1)}`;
  if (digits.startsWith('250') && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith('7') && digits.length === 9) return `+250${digits}`;
  if (digits.startsWith('078') || digits.startsWith('079') || digits.startsWith('073')) return `+250${digits}`;
  return `+${digits}`; // fallback
}

function template(name) {
  return `Dear ${name},\n\nYour application has been received successfully. We will review it and get back to you within 3-5 business days.\n\nBest regards,\nGemurai Team`;
}

async function loadRecipients(client, since) {
  const q = `
    select id, phone, "formData", "createdAt"
    from applications
    where "createdAt" >= $1 and status = 'SUBMITTED'
    order by "createdAt" desc
  `;
  const { rows } = await client.query(q, [since]);
  return rows.map(r => ({
    id: r.id,
    name: cleanName(r.formData),
    phone: normalizeRwandaPhone(r.phone),
    createdAt: r.createdAt,
  })).filter(r => r.phone);
}

async function sendAll() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const now = new Date();
    const weekStart = startOfWeekUTC(now);
    const recipients = await loadRecipients(client, weekStart);
    console.log(`📢 Starting SMS broadcast to ${recipients.length} recipients (weekStartUTC=${weekStart.toISOString()})`);

    const twilio = require('twilio');
    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const concurrency = 5;
    let index = 0, success = 0, failed = 0;

    async function worker() {
      while (true) {
        const i = index++;
        if (i >= recipients.length) break;
        const r = recipients[i];
        const body = template(r.name);
        try {
          const res = await twilioClient.messages.create({
            body,
            to: r.phone,
            from: 'Gemurai',
          });
          success++;
          if (success % 10 === 0) {
            console.log(`✅ Sent ${success}/${recipients.length} (last SID: ${res.sid})`);
          }
        } catch (err) {
          failed++;
          console.error(`❌ Failed for ${r.phone} (${r.id}):`, err?.message || err);
        }
      }
    }

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    console.log(`\n✔️ Broadcast complete. Success: ${success}, Failed: ${failed}, Total: ${recipients.length}`);
  } finally {
    client.release();
    await pool.end();
  }
}

sendAll().catch(err => { console.error('Fatal error:', err); process.exit(1); });


