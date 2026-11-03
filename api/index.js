// Vercel serverless function for API endpoints
// This file adapts the existing server.js logic to Vercel's handler format.
// It does NOT start an HTTP server; Vercel invokes this exported function
// for each request.

const http = require('node:http'); // retained for potential URL parsing utilities
const { db, initDatabase } = require('../db.js');

// Initialize DB (creates tables if missing)
initDatabase();

// MIME types are not needed here, but kept for reference.

// Helper: parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Date range helper (same as server.js)
function getDateFilterClause(filter, startDate, endDate, dateColumn = 'measurement_date') {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (filter === 'yesterday') {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().split('T')[0];
    return { clause: `AND ${dateColumn} = ?`, params: [yestStr] };
  } else if (filter === 'last_7_days') {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    return { clause: `AND ${dateColumn} >= ?`, params: [d.toISOString().split('T')[0]] };
  } else if (filter === 'last_30_days') {
    const d = new Date(today);
    d.setDate(d.getDate() - 30);
    return { clause: `AND ${dateColumn} >= ?`, params: [d.toISOString().split('T')[0]] };
  } else if (filter === 'last_3_months') {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 3);
    return { clause: `AND ${dateColumn} >= ?`, params: [d.toISOString().split('T')[0]] };
  } else if (filter === 'last_6_months') {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 6);
    return { clause: `AND ${dateColumn} >= ?`, params: [d.toISOString().split('T')[0]] };
  } else if (filter === 'last_1_year') {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 1);
    return { clause: `AND ${dateColumn} >= ?`, params: [d.toISOString().split('T')[0]] };
  } else if (filter === 'custom' && startDate && endDate) {
    return { clause: `AND ${dateColumn} BETWEEN ? AND ?`, params: [startDate, endDate] };
  }
  return { clause: '', params: [] };
}

/**
 * Main Vercel handler.
 * Vercel passes a Node.js IncomingMessage (req) and ServerResponse (res).
 */
module.exports = async (req, res) => {
  // Vercel may invoke without a host header; construct base URL safely.
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ---------- API ROUTES (mirrored from server.js) ----------

  // 1. GET /api/parent
  if (pathname === '/api/parent' && req.method === 'GET') {
    const parent = db.prepare('SELECT * FROM parents LIMIT 1').get();
    return sendJSON(res, 200, parent || {});
  }

  // 2. GET /api/children   POST /api/children   DELETE via query
  if (pathname === '/api/children') {
    if (req.method === 'GET') {
      const children = db.prepare('SELECT * FROM children ORDER BY created_at ASC').all();
      return sendJSON(res, 200, children);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { full_name, dob, gender, blood_group, photo_url, parent_id } = body;
        if (!full_name || !dob || !gender) {
          return sendJSON(res, 400, { error: 'Missing required fields' });
        }
        const id = `child-${Date.now()}`;
        const uhid = `MUKTA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const pId = parent_id || 'parent-1';
        const stmt = db.prepare(`
          INSERT INTO children (id, parent_id, full_name, dob, gender, blood_group, photo_url, uhid, pediatrician)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, pId, full_name, dob, gender, blood_group || 'Unknown', photo_url || '👶', uhid, 'Dr. Nitin Seth');
        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details)')
          .run(`aud-${Date.now()}`, id, 'CREATE', 'CHILD_PROFILE', id, `Registered child ${full_name}`);
        return sendJSON(res, 201, { id, full_name, dob, gender, blood_group, uhid, photo_url });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
    if (req.method === 'DELETE') {
      const id = searchParams.get('id') || searchParams.get('childId');
      if (!id) return sendJSON(res, 400, { error: 'Missing child ID' });
      // cascade deletions
      const tables = [
        'children',
        'growth_records',
        'vaccination_records',
        'symptom_records',
        'milestone_records',
        'medical_documents',
        'nutrition_records',
        'appointments'
      ];
      tables.forEach(t => db.prepare(`DELETE FROM ${t} WHERE ${t.includes('children') ? 'id' : 'child_id'} = ?`).run(id));
      db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details)')
        .run(`aud-${Date.now()}`, id, 'DELETE', 'CHILD_PROFILE', id, `Deleted child profile ${id}`);
      return sendJSON(res, 200, { success: true, message: 'Child profile and history deleted successfully' });
    }
  }

  // 3. GET/POST /api/growth
  if (pathname === '/api/growth') {
    const childId = searchParams.get('childId');
    if (req.method === 'GET') {
      const filter = searchParams.get('filter') || 'all';
      const sort = searchParams.get('sort') || 'DESC';
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'measurement_date');
      const query = `
        SELECT * FROM growth_records WHERE child_id = ? ${clause} ORDER BY measurement_date ${sort === 'ASC' ? 'ASC' : 'DESC'}
      `;
      const records = db.prepare(query).all(childId, ...params);
      const allAscending = db.prepare('SELECT * FROM growth_records WHERE child_id = ? ORDER BY measurement_date ASC').all(childId);
      const enriched = records.map(r => {
        const idx = allAscending.findIndex(a => a.id === r.id);
        const prev = idx > 0 ? allAscending[idx - 1] : null;
        return {
          ...r,
          delta_weight: prev ? +(r.weight_kg - prev.weight_kg).toFixed(2) : 0,
          delta_height: prev ? +(r.height_cm - prev.height_cm).toFixed(1) : 0,
          delta_head_circ: (prev && r.head_circ_cm && prev.head_circ_cm) ? +(r.head_circ_cm - prev.head_circ_cm).toFixed(1) : 0,
          previous_date: prev ? prev.measurement_date : null
        };
      });
      return sendJSON(res, 200, enriched);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, measurement_date, height_cm, weight_kg, head_circ_cm, age_months, bmi, bmi_category, notes } = body;
        const id = `g-${Date.now()}`;
        const stmt = db.prepare(`
          INSERT INTO growth_records (id, child_id, measurement_date, height_cm, weight_kg, head_circ_cm, age_months, bmi, bmi_category, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, child_id, measurement_date, height_cm, weight_kg, head_circ_cm || null, age_months, bmi, bmi_category || 'Healthy Weight', notes || null);
        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details)')
          .run(`aud-${Date.now()}`, child_id, 'RECORD_GROWTH', 'GROWTH', id, `Logged Height: ${height_cm}cm, Weight: ${weight_kg}kg`);
        return sendJSON(res, 201, { id, status: 'Saved to permanent database' });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 4. GET/POST /api/vaccinations
  if (pathname === '/api/vaccinations') {
    const childId = searchParams.get('childId');
    if (req.method === 'GET') {
      if (!childId) return sendJSON(res, 200, []);
      const statusFilter = searchParams.get('status');
      let statusClause = '';
      const params = [childId];
      if (statusFilter && statusFilter !== 'all') {
        statusClause = 'AND status = ?';
        params.push(statusFilter);
      }
      const query = `
        SELECT * FROM vaccination_records WHERE child_id = ? ${statusClause} ORDER BY recommended_date ASC
      `;
      const records = db.prepare(query).all(...params);
      return sendJSON(res, 200, records);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, vaccine_id, vaccine_name, dose_number, recommended_date, actual_date, status, hospital_details, doctor_name, notes, is_prescribed_by_doctor } = body;
        const safeActualDate = actual_date || null;
        const safeDose = dose_number || 'Standard Dose';
        const safeStatus = status || 'Upcoming';
        const safeHospital = hospital_details || 'Mukta Children Hospital, Amravati';
        const safeDoctor = doctor_name || 'Dr. Nitin Seth';
        const safeNotes = notes || null;
        const safePrescribed = is_prescribed_by_doctor ? 1 : 0;
        const existing = db.prepare('SELECT id FROM vaccination_records WHERE child_id = ? AND vaccine_id = ?').get(child_id, vaccine_id);
        if (existing) {
          db.prepare(`
            UPDATE vaccination_records SET actual_date = ?, status = ?, hospital_details = ?, doctor_name = ?, notes = ?
            WHERE id = ?
          `).run(safeActualDate, safeStatus, safeHospital, safeDoctor, safeNotes, existing.id);
        } else {
          const id = body.id || `v-${Date.now()}`;
          try {
            db.prepare(`
              INSERT INTO vaccination_records (id, child_id, vaccine_id, vaccine_name, dose_number, recommended_date, actual_date, status, hospital_details, doctor_name, notes, is_prescribed_by_doctor)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(id, child_id, vaccine_id, vaccine_name, safeDose, recommended_date, safeActualDate, safeStatus, safeHospital, safeDoctor, safeNotes, safePrescribed);
          } catch (colErr) {
            // fallback without is_prescribed_by_doctor column
            db.prepare(`
              INSERT INTO vaccination_records (id, child_id, vaccine_id, vaccine_name, dose_number, recommended_date, actual_date, status, hospital_details, doctor_name, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(id, child_id, vaccine_id, vaccine_name, safeDose, recommended_date, safeActualDate, safeStatus, safeHospital, safeDoctor, safeNotes);
          }
        }
        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details)')
          .run(`aud-${Date.now()}`, child_id, 'UPDATE_VACCINE', 'VACCINE', vaccine_id, `Updated vaccine ${vaccine_name} to ${safeStatus}`);
        return sendJSON(res, 200, { success: true });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 5. GET/POST /api/symptoms
  if (pathname === '/api/symptoms') {
    const childId = searchParams.get('childId');
    if (!childId && req.method === 'GET') return sendJSON(res, 200, []);
    if (req.method === 'GET') {
      const filter = searchParams.get('filter') || 'all';
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'onset_date');
      const records = db.prepare(`
        SELECT * FROM symptom_records WHERE child_id = ? ${clause} ORDER BY onset_date DESC
      `).all(childId, ...params);
      return sendJSON(res, 200, records);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, symptom_id, symptom_name, onset_date, duration, severity, associated_symptoms, observations, recovery_notes } = body;
        const id = `s-${Date.now()}`;
        db.prepare(`
          INSERT INTO symptom_records (id, child_id, symptom_id, symptom_name, onset_date, duration, severity, associated_symptoms, observations, recovery_notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, child_id, symptom_id, symptom_name, onset_date, duration, severity, associated_symptoms || '', observations || '', recovery_notes || null);
        return sendJSON(res, 201, { id, success: true });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 6. GET/POST /api/milestones
  if (pathname === '/api/milestones') {
    const childId = searchParams.get('childId');
    if (!childId && req.method === 'GET') return sendJSON(res, 200, []);
    if (req.method === 'GET') {
      const records = db.prepare(`
        SELECT * FROM milestone_records WHERE child_id = ? ORDER BY achieved_date DESC, created_at DESC
      `).all(childId);
      return sendJSON(res, 200, records);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, milestone_id, milestone_text, age_group, domain, status, achieved_date, notes } = body;
        const existing = db.prepare('SELECT id FROM milestone_records WHERE child_id = ? AND milestone_id = ?').get(child_id, milestone_id);
        if (existing) {
          db.prepare('UPDATE milestone_records SET status = ?, achieved_date = ?, notes = ? WHERE id = ?')
            .run(status, achieved_date, notes || null, existing.id);
        } else {
          const id = `m-${Date.now()}`;
          db.prepare(`
            INSERT INTO milestone_records (id, child_id, milestone_id, milestone_text, age_group, domain, status, achieved_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(id, child_id, milestone_id, milestone_text, age_group, domain, status, achieved_date, notes || null);
        }
        return sendJSON(res, 200, { success: true });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 7. GET /api/documents (no POST defined originally)
  if (pathname === '/api/documents') {
    const childId = searchParams.get('childId') || 'child-1';
    if (req.method === 'GET') {
      const category = searchParams.get('category');
      let catClause = '';
      const params = [childId];
      if (category && category !== 'All') {
        catClause = 'AND category = ?';
        params.push(category);
      }
      const records = db.prepare(`
        SELECT id, child_id, document_name, category, medical_record_date, upload_date, file_type, file_size, notes
        FROM medical_documents WHERE child_id = ? ${catClause} ORDER BY medical_record_date DESC
      `).all(...params);
      return sendJSON(res, 200, records);
    }
  }

  // If no route matched, return 404
  return sendJSON(res, 404, { error: 'Not found' });
};

