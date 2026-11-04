/**
 * In-Process Handler & Storage Test
 * Tests API logic, routes, and database operations without needing TCP networking.
 */

const { EventEmitter } = require('node:events');
const { Readable } = require('node:stream');
const { db, initDatabase } = require('./db.js');
initDatabase();

// Mock response object
class MockResponse extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 200;
    this.headers = {};
    this.body = '';
  }

  writeHead(status, headers = {}) {
    this.statusCode = status;
    Object.assign(this.headers, headers);
  }

  end(data = '') {
    if (data) this.body += data;
    this.emit('finish');
  }

  json() {
    return JSON.parse(this.body);
  }
}

// Mock request object
function createMockRequest(method, url, body = null) {
  const req = new Readable({
    read() {
      if (body) {
        this.push(typeof body === 'string' ? body : JSON.stringify(body));
      }
      this.push(null);
    }
  });
  req.method = method;
  req.url = url;
  req.headers = { host: 'localhost' };
  return req;
}

// Load Vercel / serverless handler from api/index.js
const apiHandler = require('./api/index.js');

async function testApi() {
  console.log('🚀 Starting In-Process API & Data Storage Verification...');

  // 1. Test GET /api/children
  console.log('\n--- 1. Testing GET /api/children ---');
  let req = createMockRequest('GET', '/api/children');
  let res = new MockResponse();
  await apiHandler(req, res);
  let children = res.json();
  console.log(`✅ GET /api/children status ${res.statusCode}, returned ${children.length} records`);

  // 2. Test POST /api/children
  console.log('\n--- 2. Testing POST /api/children ---');
  const newChildPayload = {
    full_name: 'Aarav Patil',
    dob: '2023-06-15',
    gender: 'boy',
    blood_group: 'A+',
    photo_url: '👦',
    parent_id: 'parent-1'
  };
  req = createMockRequest('POST', '/api/children', newChildPayload);
  res = new MockResponse();
  await apiHandler(req, res);
  console.log('POST status:', res.statusCode, 'body:', res.body);
  const created = res.json();
  const createdId = created.id;
  console.log(`✅ Created child profile: "${created.full_name}", ID: ${createdId}, UHID: ${created.uhid}`);

  // 3. Verify child exists in GET /api/children
  req = createMockRequest('GET', '/api/children');
  res = new MockResponse();
  await apiHandler(req, res);
  children = res.json();
  const found = children.find(c => c.id === createdId);
  if (!found) throw new Error('Created child not found in registry!');
  console.log(`✅ Verified: "${found.full_name}" is active in child registry.`);

  // 4. Test POST /api/growth
  console.log('\n--- 4. Testing POST /api/growth ---');
  req = createMockRequest('POST', '/api/growth', {
    child_id: createdId,
    measurement_date: '2026-11-04',
    height_cm: 85.0,
    weight_kg: 12.0,
    head_circ_cm: 46.0,
    age_months: 17,
    bmi: 16.6,
    bmi_category: 'Healthy Weight',
    notes: 'Growth is steady'
  });
  res = new MockResponse();
  await apiHandler(req, res);
  console.log(`✅ Growth record saved (Status: ${res.statusCode})`);

  // 5. Test GET /api/growth
  req = createMockRequest('GET', `/api/growth?childId=${createdId}`);
  res = new MockResponse();
  await apiHandler(req, res);
  const growthRecords = res.json();
  if (growthRecords.length === 0) throw new Error('Growth record not retrieved!');
  console.log(`✅ Retrieved growth record: Height ${growthRecords[0].height_cm}cm, Weight ${growthRecords[0].weight_kg}kg`);

  // 6. Test POST & GET /api/vaccinations
  console.log('\n--- 6. Testing POST & GET /api/vaccinations ---');
  req = createMockRequest('POST', '/api/vaccinations', {
    child_id: createdId,
    vaccine_id: 'birth',
    vaccine_name: 'BCG, Hep B, OPV 0',
    dose_number: 'At Birth',
    recommended_date: '2023-06-15',
    actual_date: '2023-06-15',
    status: 'Completed',
    notes: 'Given at birth'
  });
  res = new MockResponse();
  await apiHandler(req, res);
  console.log(`✅ Vaccine record updated to Completed (Status: ${res.statusCode})`);

  req = createMockRequest('GET', `/api/vaccinations?childId=${createdId}`);
  res = new MockResponse();
  await apiHandler(req, res);
  const vaxList = res.json();
  if (vaxList.length === 0) throw new Error('Vaccine record not retrieved!');
  console.log(`✅ Verified vaccine checklist: "${vaxList[0].vaccine_name}", Status: "${vaxList[0].status}"`);

  // 7. CRITICAL: Test DELETE /api/children
  console.log('\n--- 7. Testing DELETE /api/children ---');
  req = createMockRequest('DELETE', `/api/children?id=${encodeURIComponent(createdId)}`);
  res = new MockResponse();
  await apiHandler(req, res);
  const deleteResult = res.json();
  console.log(`✅ DELETE status ${res.statusCode}: ${deleteResult.message}`);

  // Verify child is completely removed
  req = createMockRequest('GET', '/api/children');
  res = new MockResponse();
  await apiHandler(req, res);
  children = res.json();
  const stillThere = children.some(c => c.id === createdId);
  if (stillThere) throw new Error('❌ Child still exists after deletion!');
  console.log(`✅ VERIFIED: Child profile "${createdId}" is completely DELETED from registry!`);

  // Verify growth records for this child are deleted
  req = createMockRequest('GET', `/api/growth?childId=${createdId}`);
  res = new MockResponse();
  await apiHandler(req, res);
  const remainingGrowth = res.json();
  if (remainingGrowth.length > 0) throw new Error('❌ Cascaded growth records were not deleted!');
  console.log('✅ VERIFIED: Cascaded growth records were completely deleted.');

  // Verify vaccine records for this child are deleted
  req = createMockRequest('GET', `/api/vaccinations?childId=${createdId}`);
  res = new MockResponse();
  await apiHandler(req, res);
  const remainingVax = res.json();
  if (remainingVax.length > 0) throw new Error('❌ Cascaded vaccine records were not deleted!');
  console.log('✅ VERIFIED: Cascaded vaccination records were completely deleted.');

  console.log('\n============================================================');
  console.log('🎉 ALL BACKEND & PERSISTENCE TESTS PASSED 100%! 🎉');
  console.log('============================================================');
}

testApi().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
