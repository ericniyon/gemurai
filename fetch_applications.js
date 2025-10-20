// Using built-in fetch (Node.js 18+)
const applicationIds = [
  'APP-1751702775384-f1ryycq',
  'APP-1752221523584-wntvwk0',
  'APP-1751557119269-cl9yqqa',
  'APP-1751523786852-frkrsvb',
  'APP-1752123815120-15gsdwr',
  'APP-1752083655990-4f50mc4',
  'APP-1752215785856-vx7k6ms',
  'APP-1751628995648-lud8fwd',
  'APP-1751867089196-wf3afwg',
  'APP-1751975116602-xkxetpj',
  'APP-1751682705451-odk9ljp',
  'APP-1752126571003-4fqm3jo',
  'APP-1752253067865-yy537mj',
  'APP-1751878611917-m2qpc3u'
];

async function fetchApplication(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/applications/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        id,
        error: `HTTP ${response.status}: ${response.statusText}`,
        found: false
      };
    }

    const data = await response.json();
    return {
      id,
      data: data.application,
      found: data.success
    };
  } catch (error) {
    return {
      id,
      error: error.message,
      found: false
    };
  }
}

async function fetchAllApplications() {
  console.log('🔍 Fetching applications...\n');
  
  const results = [];
  
  for (const id of applicationIds) {
    console.log(`📋 Fetching: ${id}`);
    const result = await fetchApplication(id);
    results.push(result);
    
    if (result.found) {
      console.log(`✅ Found: ${id}`);
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Email: ${result.data.email || 'N/A'}`);
      console.log(`   Phone: ${result.data.phone || 'N/A'}`);
      console.log(`   Created: ${result.data.createdAt}`);
      console.log('');
    } else {
      console.log(`❌ Not found: ${id} - ${result.error}`);
      console.log('');
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Summary:');
  console.log(`Total applications requested: ${applicationIds.length}`);
  console.log(`Found: ${results.filter(r => r.found).length}`);
  console.log(`Not found: ${results.filter(r => !r.found).length}`);
  
  return results;
}

fetchAllApplications().catch(console.error); 