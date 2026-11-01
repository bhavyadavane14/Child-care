// End-to-End Test Script for Mukta Child Health Hub
// Run with: node e2e_test.js
// Validates critical user & admin flows.

const fetch = require('node-fetch');
const BASE_URL = 'http://localhost:5000'; // server started on port 4000

function fail(msg) {
  console.error('❌ FAILURE:', msg);
  process.exit(1);
}

async function main() {
  console.log('🚀 Starting end-to-end test...');

  // 1️⃣ Create a test child profile
  const childPayload = {
    full_name: 'Test Child',
    dob: '2022-01-01',
    gender: 'Female',
    blood_group: 'O+',
    photo_url: ''
  };
  const createRes = await fetch(`${BASE_URL}/api/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(childPayload)
  });
  if (!createRes.ok) fail(`Create child returned ${createRes.status}`);
  const createdChild = await createRes.json();
  const childId = createdChild.id;
  console.log('✅ Child created, id:', childId);

  // 2️⃣ Doctor (admin) prescribes a vaccine
  const vaccinePayload = {
    childId,
    name: 'MMR',
    scheduledDate: '2024-05-01',
    status: 'Upcoming',
    is_prescribed_by_doctor: true
  };
  const vaccineRes = await fetch(`${BASE_URL}/api/vaccines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vaccinePayload)
  });
  if (!vaccineRes.ok) fail(`Prescribe vaccine returned ${vaccineRes.status}`);
  const vaccineRecord = await vaccineRes.json();
  console.log('✅ Vaccine prescribed, id:', vaccineRecord.id);

  // 3️⃣ Mark vaccine as completed
  const completeRes = await fetch(`${BASE_URL}/api/vaccines/${vaccineRecord.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Completed', actualDate: new Date().toISOString().split('T')[0] })
  });
  if (!completeRes.ok) fail(`Complete vaccine returned ${completeRes.status}`);
  console.log('✅ Vaccine marked as Completed');

  // 4️⃣ Add a growth entry
  const growthPayload = {
    childId,
    height: 115,
    weight: 22,
    measuredDate: new Date().toISOString().split('T')[0]
  };
  const growthRes = await fetch(`${BASE_URL}/api/growth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(growthPayload)
  });
  if (!growthRes.ok) fail(`Add growth returned ${growthRes.status}`);
  console.log('✅ Growth entry added');

  // 5️⃣ Log a symptom episode
  const symptomPayload = {
    childId,
    symptom: 'Cough',
    severity: 'Mild',
    notes: 'Started yesterday',
    episodeDate: new Date().toISOString().split('T')[0]
  };
  const symptomRes = await fetch(`${BASE_URL}/api/symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(symptomPayload)
  });
  if (!symptomRes.ok) fail(`Add symptom returned ${symptomRes.status}`);
  console.log('✅ Symptom logged');

  // 6️⃣ Retrieve history (last 7 days)
  const historyRes = await fetch(`${BASE_URL}/api/history?childId=${childId}&range=7d`);
  if (!historyRes.ok) fail(`History fetch returned ${historyRes.status}`);
  const history = await historyRes.json();
  if (!Array.isArray(history) || history.length === 0) fail('History empty for last 7 days');
  console.log('✅ History retrieved, records:', history.length);

  // 7️⃣ Admin stats endpoint
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`);
  if (!statsRes.ok) fail(`Admin stats returned ${statsRes.status}`);
  const stats = await statsRes.json();
  console.log('✅ Admin stats:', stats);

  // 8️⃣ Cleanup – delete test child (cascades related data)
  const delRes = await fetch(`${BASE_URL}/api/children/${childId}`, { method: 'DELETE' });
  if (!delRes.ok) fail(`Delete child returned ${delRes.status}`);
  console.log('✅ Cleanup completed. Test child removed.');

  console.log('🎉 All end-to-end checks passed!');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
