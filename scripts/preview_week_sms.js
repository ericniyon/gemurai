const { Pool } = require('pg');
require('dotenv').config();

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

function normalizePhone(p) {
  return String(p || '').replace(/\s+/g, '');
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const now = new Date();
    const weekStart = startOfWeekUTC(now);
    const q = `
      select id, email, phone, "formData", "createdAt"
      from applications
      where "createdAt" >= $1 and status = 'SUBMITTED'
      order by "createdAt" desc
    `;
    const { rows } = await client.query(q, [weekStart]);

    const recipients = rows.map(r => ({
      id: r.id,
      name: cleanName(r.formData),
      phone: normalizePhone(r.phone),
      createdAt: r.createdAt,
    }));

    const total = recipients.length;
    const sample = recipients.slice(0, 10);

    const template = name => (
      `Dear ${name},\n\nYour application has been received successfully. We will review it and get back to you within 3-5 business days.\n\nBest regards,\nGemurai Team`
    );

    console.log(JSON.stringify({
      weekStartUTC: weekStart.toISOString(),
      total,
      sample: sample.map(s => ({ id: s.id, phone: s.phone, name: s.name, preview: template(s.name) })),
      smsTextExample: template('there')
    }, null, 2));
  } finally {
    client.release();
  }
}

main().catch(err => { console.error(err); process.exit(1); });


