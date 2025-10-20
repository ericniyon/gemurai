/*
  Count applications for this week under multiple definitions to reconcile discrepancies:
  - Week from Monday 00:00 in Africa/Kigali
  - Week from Monday 00:00 in UTC
  - Rolling last 7 days
  Also prints counts by status and a daily breakdown since Kigali week start.
*/

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function startOfWeek(date, offsetMinutes) {
  // Compute Monday 00:00 for given local offset (no DST handling here; Kigali is UTC+02)
  const d = new Date(date.getTime());
  const localMinutes = d.getTime() / 60000 + offsetMinutes;
  const localMidnight = Math.floor(localMinutes / 1440) * 1440; // minutes at local midnight
  // JS getUTCDay: 0=Sun..6=Sat. Convert to 0=Mon..6=Sun
  const temp = new Date((localMidnight * 60000) - offsetMinutes * 60000);
  const day = (temp.getUTCDay() + 6) % 7; // 0 = Monday
  const mondayLocalMinutes = localMidnight - day * 1440;
  return new Date(mondayLocalMinutes * 60000 - offsetMinutes * 60000);
}

async function main() {
  const client = await pool.connect();
  try {
    const now = new Date();
    const kigaliOffsetMinutes = 120; // UTC+02:00

    const sowKigali = startOfWeek(now, kigaliOffsetMinutes);
    const sowUTC = startOfWeek(now, 0);

    const last7 = new Date(now);
    last7.setDate(now.getDate() - 7);
    last7.setHours(0, 0, 0, 0);

    console.log('Now (UTC):', new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString());
    console.log('Start of week (Kigali):', sowKigali.toISOString());
    console.log('Start of week (UTC):', sowUTC.toISOString());
    console.log('Rolling last 7 days start:', last7.toISOString());

    async function countsSince(ts, label) {
      const qAll = 'select count(*) from applications where "createdAt" >= $1';
      const qSubmitted = "select count(*) from applications where \"createdAt\" >= $1 and status = 'SUBMITTED'";
      const qByStatus = 'select status, count(*)::int as count from applications where "createdAt" >= $1 group by status order by count desc';
      const [rAll, rSubmitted, rByStatus] = await Promise.all([
        client.query(qAll, [ts]),
        client.query(qSubmitted, [ts]),
        client.query(qByStatus, [ts]),
      ]);
      return {
        label,
        all: Number(rAll.rows[0].count),
        submitted: Number(rSubmitted.rows[0].count),
        byStatus: rByStatus.rows,
      };
    }

    const [kigali, utc, last7d] = await Promise.all([
      countsSince(sowKigali, 'Week from Monday (Africa/Kigali)'),
      countsSince(sowUTC, 'Week from Monday (UTC)'),
      countsSince(last7, 'Rolling last 7 days'),
    ]);

    console.log('\n=== Counts ===');
    for (const block of [kigali, utc, last7d]) {
      console.log(`\n${block.label}`);
      console.log('  All statuses :', block.all);
      console.log('  SUBMITTED    :', block.submitted);
      console.log('  By status    :', block.byStatus.map(r => `${r.status}:${r.count}`).join(', '));
    }

    // Daily breakdown since Kigali week start
    const daily = await client.query(
      'select date("createdAt") as day, count(*)::int as count from applications where "createdAt" >= $1 group by 1 order by 1 desc',
      [sowKigali]
    );
    console.log('\n=== Daily Breakdown (since Kigali week start) ===');
    for (const row of daily.rows) {
      console.log(`  ${row.day}: ${row.count}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});


