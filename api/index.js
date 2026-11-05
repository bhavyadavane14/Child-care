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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Mukta-User, X-Mukta-Admin'
  });
  res.end(JSON.stringify(data));
}

// ==========================================================================
// Per-user data ownership (mirrors server.js)
// ==========================================================================
const ADMIN_TOKEN = 'doctormukta';
const USER_ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;

function getRequestIdentity(req) {
  const rawUser = String(req.headers['x-mukta-user'] || '').trim();
  return {
    userId: USER_ID_PATTERN.test(rawUser) ? rawUser : null,
    isAdmin: String(req.headers['x-mukta-admin'] || '') === ADMIN_TOKEN
  };
}

function ensureParentRow(userId) {
  if (!userId) return null;
  let parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(userId);
  if (!parent) {
    db.prepare('INSERT INTO parents (id, full_name, email, phone) VALUES (?, ?, ?, ?)')
      .run(userId, 'Parent', `${userId}@mukta.local`, null);
    parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(userId);
  }
  return parent;
}

function getOwnedChild(childId, identity) {
  if (!childId) return null;
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!child) return null;
  if (identity.isAdmin) return child;
  if (identity.userId && child.parent_id === identity.userId) return child;
  return null;
}

function denyChildAccess(res) {
  return sendJSON(res, 403, { error: 'You do not have access to this child profile' });
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
  } else if (filter === 'last_1_year' || filter === 'last_year' || filter === 'last_12_months') {
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Mukta-User, X-Mukta-Admin'
    });
    res.end();
    return;
  }

  const identity = getRequestIdentity(req);

  // ---------- API ROUTES (mirrored from server.js) ----------

  // 1. GET /api/parent
  if (pathname === '/api/parent' && req.method === 'GET') {
    if (identity.isAdmin) {
      return sendJSON(res, 200, db.prepare('SELECT * FROM parents LIMIT 1').get() || {});
    }
    const parent = identity.userId ? ensureParentRow(identity.userId) : null;
    return sendJSON(res, 200, parent || {});
  }

  // 2. GET /api/children   POST /api/children   DELETE via query
  if (pathname === '/api/children') {
    if (req.method === 'GET') {
      const children = identity.isAdmin
        ? db.prepare('SELECT * FROM children ORDER BY created_at ASC').all()
        : (identity.userId
            ? db.prepare('SELECT * FROM children WHERE parent_id = ? ORDER BY created_at ASC').all(identity.userId)
            : []);
      return sendJSON(res, 200, children);
    }
    if (req.method === 'POST') {
      try {
        if (!identity.isAdmin && !identity.userId) {
          return sendJSON(res, 401, { error: 'Missing user identity' });
        }
        const body = await parseBody(req);
        const { full_name, dob, gender, blood_group, photo_url, parent_id } = body;
        if (!full_name || !dob || !gender) {
          return sendJSON(res, 400, { error: 'Missing required fields' });
        }
        const id = `child-${Date.now()}`;
        const uhid = `MUKTA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const pId = identity.isAdmin && parent_id
          ? parent_id
          : (identity.userId || parent_id || 'parent-1');
        ensureParentRow(pId);
        const stmt = db.prepare(`
          INSERT INTO children (id, parent_id, full_name, dob, gender, blood_group, photo_url, uhid, pediatrician)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, pId, full_name, dob, gender, blood_group || 'Unknown', photo_url || '👶', uhid, 'Dr. Nitin Seth');
        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)')
          .run(`aud-${Date.now()}`, id, 'CREATE', 'CHILD_PROFILE', id, `Registered child ${full_name}`);
        return sendJSON(res, 201, { id, full_name, dob, gender, blood_group, uhid, photo_url, parent_id: pId });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
    if (req.method === 'DELETE') {
      const id = searchParams.get('id') || searchParams.get('childId');
      if (!id) return sendJSON(res, 400, { error: 'Missing child ID' });
      if (!getOwnedChild(id, identity)) return denyChildAccess(res);
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
      db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)')
        .run(`aud-${Date.now()}`, id, 'DELETE', 'CHILD_PROFILE', id, `Deleted child profile ${id}`);
      return sendJSON(res, 200, { success: true, message: 'Child profile and history deleted successfully' });
    }
  }

  // 3. GET/POST /api/growth
  if (pathname === '/api/growth') {
    const childId = searchParams.get('childId');
    if (req.method === 'GET') {
      if (!childId) return sendJSON(res, 200, []);
      if (!getOwnedChild(childId, identity)) return denyChildAccess(res);
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
        if (!getOwnedChild(child_id, identity)) return denyChildAccess(res);
        const id = `g-${Date.now()}`;
        const stmt = db.prepare(`
          INSERT INTO growth_records (id, child_id, measurement_date, height_cm, weight_kg, head_circ_cm, age_months, bmi, bmi_category, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, child_id, measurement_date, height_cm, weight_kg, head_circ_cm || null, age_months, bmi, bmi_category || 'Healthy Weight', notes || null);
        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)')
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
      if (!getOwnedChild(childId, identity)) return denyChildAccess(res);
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
        if (!getOwnedChild(child_id, identity)) return denyChildAccess(res);
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
        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)')
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
      if (!childId) return sendJSON(res, 200, []);
      if (!getOwnedChild(childId, identity)) return denyChildAccess(res);
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
        if (!getOwnedChild(child_id, identity)) return denyChildAccess(res);
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
      if (!childId) return sendJSON(res, 200, []);
      if (!getOwnedChild(childId, identity)) return denyChildAccess(res);
      const records = db.prepare(`
        SELECT * FROM milestone_records WHERE child_id = ? ORDER BY achieved_date DESC, created_at DESC
      `).all(childId);
      return sendJSON(res, 200, records);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, milestone_id, age_group, domain, status, achieved_date, notes } = body;
        if (!getOwnedChild(child_id, identity)) return denyChildAccess(res);
        const text = body.milestone_text || body.milestone_name;
        if (!child_id || !milestone_id || !text) {
          return sendJSON(res, 400, { error: 'Missing required milestone fields' });
        }
        const safeStatus = status || 'Achieved';
        const safeDate = achieved_date || null;
        const existing = db.prepare('SELECT id FROM milestone_records WHERE child_id = ? AND milestone_id = ?').get(child_id, milestone_id);
        if (existing) {
          db.prepare('UPDATE milestone_records SET milestone_text = ?, status = ?, achieved_date = ?, notes = ? WHERE id = ?')
            .run(text, safeStatus, safeDate, notes || null, existing.id);
        } else {
          const id = `m-${Date.now()}`;
          db.prepare(`
            INSERT INTO milestone_records (id, child_id, milestone_id, milestone_text, age_group, domain, status, achieved_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(id, child_id, milestone_id, text, age_group || 'Unknown', domain || 'General', safeStatus, safeDate, notes || null);
        }
        return sendJSON(res, 200, { success: true });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 7. GET/POST /api/documents
  if (pathname === '/api/documents') {
    const childId = searchParams.get('childId');
    if (req.method === 'GET') {
      if (!childId) return sendJSON(res, 200, []);
      if (!getOwnedChild(childId, identity)) return denyChildAccess(res);
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
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, document_name, category, medical_record_date, file_type, file_size, file_data, notes } = body;
        if (!getOwnedChild(child_id, identity)) return denyChildAccess(res);
        const id = `doc-${Date.now()}`;
        db.prepare(`
          INSERT INTO medical_documents (id, child_id, document_name, category, medical_record_date, file_type, file_size, file_data, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, child_id, document_name, category, medical_record_date, file_type || 'PDF', file_size || '1.0 MB', file_data || null, notes || null);
        return sendJSON(res, 201, { id, success: true });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 8. GET/POST /api/nutrition
  if (pathname === '/api/nutrition') {
    const childId = searchParams.get('childId');
    if (req.method === 'GET') {
      if (!childId) return sendJSON(res, 200, []);
      if (!getOwnedChild(childId, identity)) return denyChildAccess(res);
      const records = db.prepare(`
        SELECT * FROM nutrition_records WHERE child_id = ? ORDER BY feeding_datetime DESC
      `).all(childId);
      return sendJSON(res, 200, records);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, feeding_datetime, meal_category, food_details, is_first_time, observations, concerns } = body;
        if (!getOwnedChild(child_id, identity)) return denyChildAccess(res);
        const id = `n-${Date.now()}`;
        db.prepare(`
          INSERT INTO nutrition_records (id, child_id, feeding_datetime, meal_category, food_details, is_first_time, observations, concerns)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, child_id, feeding_datetime, meal_category, food_details, is_first_time ? 1 : 0, observations || null, concerns || null);
        return sendJSON(res, 201, { id, success: true });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 9. GET/POST /api/appointments
  if (pathname === '/api/appointments') {
    const childId = searchParams.get('childId');
    if (req.method === 'GET') {
      if (!childId) return sendJSON(res, 200, []);
      if (!getOwnedChild(childId, identity)) return denyChildAccess(res);
      const records = db.prepare(`
        SELECT * FROM appointments WHERE child_id = ? ORDER BY appointment_date DESC
      `).all(childId);
      return sendJSON(res, 200, records);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, doctor_id, doctor_name, department, appointment_date, time_slot, type } = body;
        if (!getOwnedChild(child_id, identity)) return denyChildAccess(res);
        const id = `apt-${Date.now()}`;
        const ref_code = `MUKTA-APT-${Math.floor(1000 + Math.random() * 9000)}`;
        db.prepare(`
          INSERT INTO appointments (id, child_id, doctor_id, doctor_name, department, appointment_date, time_slot, type, status, ref_code)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)
        `).run(id, child_id, doctor_id, doctor_name, department, appointment_date, time_slot, type, ref_code);
        return sendJSON(res, 201, { id, ref_code, success: true });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  if (pathname.startsWith('/api/appointments/') && req.method === 'DELETE') {
    const aptId = pathname.split('/').pop();
    const apt = db.prepare('SELECT child_id FROM appointments WHERE id = ?').get(aptId);
    if (!apt) return sendJSON(res, 404, { error: 'Appointment not found' });
    if (!getOwnedChild(apt.child_id, identity)) return denyChildAccess(res);
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('Cancelled', aptId);
    return sendJSON(res, 200, { success: true });
  }

  // 10. GET /api/history
  if (pathname === '/api/history' && req.method === 'GET') {
    const childId = searchParams.get('childId') || searchParams.get('child_id');
    if (!childId) return sendJSON(res, 200, []);
    if (!getOwnedChild(childId, identity)) return denyChildAccess(res);
    const filter = (searchParams.get('filter') || 'all').toLowerCase();
    const category = (searchParams.get('category') || 'all').toLowerCase();
    const search = searchParams.get('search') ? searchParams.get('search').toLowerCase() : '';
    const sort = searchParams.get('sort') || 'DESC';
    const timeline = [];

    if (category === 'all' || category === 'growth') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'measurement_date');
      db.prepare(`SELECT * FROM growth_records WHERE child_id = ? ${clause}`).all(childId, ...params).forEach(r => {
        timeline.push({ id: r.id, date: r.measurement_date, activity: 'Growth', typeBadge: 'p-mint', icon: '📈', title: `Growth Check: Weight ${r.weight_kg} kg, Height ${r.height_cm} cm`, details: `Age: ${r.age_months} mos • Calculated BMI: ${r.bmi} (${r.bmi_category || 'Healthy'})`, notes: r.notes || '', data: r });
      });
    }
    if (category === 'all' || category === 'vaccination') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'actual_date');
      db.prepare(`SELECT * FROM vaccination_records WHERE child_id = ? AND actual_date IS NOT NULL ${clause}`).all(childId, ...params).forEach(r => {
        timeline.push({ id: r.id, date: r.actual_date, activity: 'Vaccination', typeBadge: 'p-blue', icon: '💉', title: `Vaccine Administered: ${r.vaccine_name} (${r.dose_number})`, details: `Hospital: ${r.hospital_details} • Doctor: ${r.doctor_name}`, notes: r.notes || '', data: r });
      });
    }
    if (category === 'all' || category === 'symptom') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'onset_date');
      db.prepare(`SELECT * FROM symptom_records WHERE child_id = ? ${clause}`).all(childId, ...params).forEach(r => {
        timeline.push({ id: r.id, date: r.onset_date, activity: 'Symptom', typeBadge: 'p-pink', icon: '🩺', title: `Symptom Episode: ${r.symptom_name}`, details: `Duration: ${r.duration || 'N/A'} • Severity: ${r.severity || 'Mild'} • ${r.observations || ''}`, notes: r.recovery_notes || '', data: r });
      });
    }
    if (category === 'all' || category === 'milestone') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'achieved_date');
      db.prepare(`SELECT * FROM milestone_records WHERE child_id = ? AND achieved_date IS NOT NULL ${clause}`).all(childId, ...params).forEach(r => {
        timeline.push({ id: r.id, date: r.achieved_date, activity: 'Milestone', typeBadge: 'p-lavender', icon: '🌱', title: `Milestone Achieved: ${r.milestone_text}`, details: `Domain: ${r.domain} • Age Bracket: ${r.age_group}`, notes: r.notes || '', data: r });
      });
    }
    if (category === 'all' || category === 'document') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'medical_record_date');
      db.prepare(`SELECT * FROM medical_documents WHERE child_id = ? ${clause}`).all(childId, ...params).forEach(r => {
        timeline.push({ id: r.id, date: r.medical_record_date, activity: 'Document', typeBadge: 'p-yellow', icon: '🪪', title: `Medical Record: ${r.document_name}`, details: `Category: ${r.category} • Format: ${r.file_type} (${r.file_size || '1 MB'})`, notes: r.notes || '', data: r });
      });
    }
    if (category === 'all' || category === 'nutrition') {
      db.prepare('SELECT * FROM nutrition_records WHERE child_id = ?').all(childId).forEach(r => {
        timeline.push({ id: r.id, date: r.feeding_datetime.split(' ')[0], activity: 'Nutrition', typeBadge: 'p-mint', icon: '🍎', title: `${r.meal_category}: ${r.food_details} ${r.is_first_time ? '✨ (First Time Trial)' : ''}`, details: r.observations || 'Normal acceptance', notes: r.concerns ? `Concerns: ${r.concerns}` : '', data: r });
      });
    }
    if (category === 'all' || category === 'appointment') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'appointment_date');
      db.prepare(`SELECT * FROM appointments WHERE child_id = ? ${clause}`).all(childId, ...params).forEach(r => {
        timeline.push({ id: r.id, date: r.appointment_date, activity: 'Appointment', typeBadge: 'p-blue', icon: '📅', title: `Pediatric Consultation: ${r.doctor_name}`, details: `Ref: ${r.ref_code} • ${r.type} • Status: ${r.status}`, notes: r.consultation_notes || '', data: r });
      });
    }

    let filtered = timeline;
    if (search) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.details.toLowerCase().includes(search) ||
        (item.notes || '').toLowerCase().includes(search)
      );
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sort === 'ASC' ? dateA - dateB : dateB - dateA;
    });
    return sendJSON(res, 200, filtered.map(item => ({
      ...item,
      type: String(item.activity || '').toLowerCase(),
      data: { ...(item.data || {}), notes: item.notes || item.details || '' }
    })));
  }

  // 11. GET /api/admin/stats
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    if (!identity.isAdmin) return sendJSON(res, 403, { error: 'Admin access required' });
    const totalChildren = db.prepare('SELECT COUNT(*) as c FROM children').get().c;
    const vaccinesTaken = db.prepare("SELECT COUNT(*) as c FROM vaccination_records WHERE status = 'Completed'").get().c;
    const vaccinesPending = db.prepare("SELECT COUNT(*) as c FROM vaccination_records WHERE status != 'Completed'").get().c;
    const symptomAlerts = db.prepare('SELECT COUNT(*) as c FROM symptom_records').get().c;
    return sendJSON(res, 200, { totalChildren, vaccinesTaken, vaccinesPending, symptomAlerts });
  }

  // If no route matched, return 404
  return sendJSON(res, 404, { error: 'Not found' });
};

