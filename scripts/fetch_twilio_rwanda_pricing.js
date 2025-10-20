// Fetch Twilio Messaging pricing for Rwanda via Pricing API v2
const axios = require('axios');
require('dotenv').config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
  process.exit(1);
}

async function main() {
  const url = 'https://pricing.twilio.com/v1/Messaging/Countries/RW';
  const auth = {
    username: TWILIO_ACCOUNT_SID,
    password: TWILIO_AUTH_TOKEN,
  };
  const { data } = await axios.get(url, { auth });
  // data has outbound_sms_prices (array), possibly per carrier; pick minimum and maximum
  const prices = (data.outbound_sms_prices || []).flatMap(p => p.prices || []);
  // prices items have 'base_price' and 'current_price' and 'number_type'
  const current = prices.map(p => Number(p.current_price)).filter(n => !isNaN(n));
  const base = prices.map(p => Number(p.base_price)).filter(n => !isNaN(n));
  const minCurrent = current.length ? Math.min(...current) : null;
  const maxCurrent = current.length ? Math.max(...current) : null;
  const carriers = data.outbound_sms_prices?.map(c => ({ carrier: c.mcc || c.carrier || 'carrier', prices: c.prices })) || [];

  console.log(JSON.stringify({
    country: data.country,
    isoCountry: data.iso_country,
    url: data.url,
    minCurrent,
    maxCurrent,
    sample: prices.slice(0,5),
    carriersCount: carriers.length
  }, null, 2));
}

main().catch(err => { console.error('Error fetching Twilio pricing:', err?.response?.data || err.message || err); process.exit(1); });


