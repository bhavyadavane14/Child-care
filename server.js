/**
 * Mukta Children Hospital & Child Health Hub - Backend Server
 * Built with standard Node.js (Zero external npm dependencies needed)
 * Persistent SQLite Database integration via node:sqlite
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { db, initDatabase } = require('./db.js');

// Ensure database is initialized and tables exist
initDatabase();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Date range calculation helper for SQL filters
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

// Request parser helper
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

// HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ==========================================
  // REST API Routes
  // ==========================================

  // 1. GET /api/parent
  if (pathname === '/api/parent' && req.method === 'GET') {
    const parent = db.prepare('SELECT * FROM parents LIMIT 1').get();
    return sendJSON(res, 200, parent || {});
  }

  // 2. GET /api/children & POST /api/children
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

        // Audit log
        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)')
          .run(`aud-${Date.now()}`, id, 'CREATE', 'CHILD_PROFILE', id, `Registered child ${full_name}`);

        return sendJSON(res, 201, { id, full_name, dob, gender, blood_group, uhid, photo_url });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }

    if (req.method === 'DELETE') {
      try {
        const id = searchParams.get('id') || searchParams.get('childId');
        if (!id) return sendJSON(res, 400, { error: 'Missing child ID' });

        db.prepare('DELETE FROM children WHERE id = ?').run(id);
        db.prepare('DELETE FROM growth_records WHERE child_id = ?').run(id);
        db.prepare('DELETE FROM vaccination_records WHERE child_id = ?').run(id);
        db.prepare('DELETE FROM symptom_records WHERE child_id = ?').run(id);
        db.prepare('DELETE FROM milestone_records WHERE child_id = ?').run(id);
        db.prepare('DELETE FROM medical_documents WHERE child_id = ?').run(id);
        db.prepare('DELETE FROM nutrition_records WHERE child_id = ?').run(id);
        db.prepare('DELETE FROM appointments WHERE child_id = ?').run(id);

        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)')
          .run(`aud-${Date.now()}`, id, 'DELETE', 'CHILD_PROFILE', id, `Deleted child profile ${id}`);

        return sendJSON(res, 200, { success: true, message: 'Child profile and history deleted successfully' });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 3. GET & POST /api/growth
  if (pathname === '/api/growth') {
    const childId = searchParams.get('childId');

    if (req.method === 'GET') {
      const filter = searchParams.get('filter') || 'all';
      const sort = searchParams.get('sort') || 'DESC';
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'measurement_date');

      const query = `
        SELECT * FROM growth_records 
        WHERE child_id = ? ${clause}
        ORDER BY measurement_date ${sort === 'ASC' ? 'ASC' : 'DESC'}
      `;
      const records = db.prepare(query).all(childId, ...params);

      // Compute delta changes compared to previous record
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

        db.prepare('INSERT INTO audit_logs (id, child_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)')
          .run(`aud-${Date.now()}`, child_id, 'RECORD_GROWTH', 'GROWTH', id, `Logged Height: ${height_cm}cm, Weight: ${weight_kg}kg`);

        return sendJSON(res, 201, { id, status: 'Saved to permanent database' });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }
  }

  // 4. GET & POST /api/vaccinations
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
        SELECT * FROM vaccination_records 
        WHERE child_id = ? ${statusClause}
        ORDER BY recommended_date ASC
      `;
      const records = db.prepare(query).all(...params);
      return sendJSON(res, 200, records);
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, vaccine_id, vaccine_name, dose_number, recommended_date, actual_date, status, hospital_details, doctor_name, notes, is_prescribed_by_doctor } = body;
        
        // Sanitize: node:sqlite requires explicit null, not undefined
        const safeActualDate = actual_date || null;
        const safeDose = dose_number || 'Standard Dose';
        const safeStatus = status || 'Upcoming';
        const safeHospital = hospital_details || 'Mukta Children Hospital, Amravati';
        const safeDoctor = doctor_name || 'Dr. Nitin Seth';
        const safeNotes = notes || null;
        const safePrescribed = is_prescribed_by_doctor ? 1 : 0;

        // Update or Insert
        const existing = db.prepare('SELECT id FROM vaccination_records WHERE child_id = ? AND vaccine_id = ?').get(child_id, vaccine_id);
        if (existing) {
          db.prepare(`
            UPDATE vaccination_records 
            SET actual_date = ?, status = ?, hospital_details = ?, doctor_name = ?, notes = ?
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
            // Fallback: schema without is_prescribed_by_doctor column
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

  // 5. GET & POST /api/symptoms
  if (pathname === '/api/symptoms') {
    const childId = searchParams.get('childId');
    if (!childId && req.method === 'GET') return sendJSON(res, 200, []);

    if (req.method === 'GET') {
      const filter = searchParams.get('filter') || 'all';
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'onset_date');

      const records = db.prepare(`
        SELECT * FROM symptom_records 
        WHERE child_id = ? ${clause}
        ORDER BY onset_date DESC
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

  // 6. GET & POST /api/milestones
  if (pathname === '/api/milestones') {
    const childId = searchParams.get('childId');
    if (!childId && req.method === 'GET') return sendJSON(res, 200, []);

    if (req.method === 'GET') {
      const records = db.prepare(`
        SELECT * FROM milestone_records 
        WHERE child_id = ?
        ORDER BY achieved_date DESC, created_at DESC
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

  // 7. GET & POST /api/documents
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
        FROM medical_documents 
        WHERE child_id = ? ${catClause}
        ORDER BY medical_record_date DESC
      `).all(...params);
      return sendJSON(res, 200, records);
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, document_name, category, medical_record_date, file_type, file_size, file_data, notes } = body;
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

  // 8. GET & POST /api/nutrition
  if (pathname === '/api/nutrition') {
    const childId = searchParams.get('childId') || 'child-1';

    if (req.method === 'GET') {
      const records = db.prepare(`
        SELECT * FROM nutrition_records 
        WHERE child_id = ? 
        ORDER BY feeding_datetime DESC
      `).all(childId);
      return sendJSON(res, 200, records);
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, feeding_datetime, meal_category, food_details, is_first_time, observations, concerns } = body;
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

  // 9. GET & POST /api/appointments
  if (pathname === '/api/appointments') {
    const childId = searchParams.get('childId') || 'child-1';

    if (req.method === 'GET') {
      const records = db.prepare(`
        SELECT * FROM appointments 
        WHERE child_id = ? 
        ORDER BY appointment_date DESC
      `).all(childId);
      return sendJSON(res, 200, records);
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { child_id, doctor_id, doctor_name, department, appointment_date, time_slot, type } = body;
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

  // Cancel Appointment
  if (pathname.startsWith('/api/appointments/') && req.method === 'DELETE') {
    const aptId = pathname.split('/').pop();
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('Cancelled', aptId);
    return sendJSON(res, 200, { success: true });
  }

  // 10. MASTER CENTRAL HEALTH HISTORY API (Section 6: My Child's Health History)
  // Aggregates Growth, Vaccines, Symptoms, Milestones, Documents, Nutrition, Appointments
  if (pathname === '/api/history' && req.method === 'GET') {
    const childId = searchParams.get('childId');
    if (!childId) return sendJSON(res, 200, []);
    const filter = searchParams.get('filter') || 'all';
    const category = searchParams.get('category') || 'All'; // 'Growth', 'Symptom', 'Vaccination', 'Milestone', 'Document', 'Nutrition', 'Appointment'
    const search = searchParams.get('search') ? searchParams.get('search').toLowerCase() : '';
    const sort = searchParams.get('sort') || 'DESC'; // 'DESC' or 'ASC'

    const timeline = [];

    // 1. Growth
    if (category === 'All' || category === 'Growth') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'measurement_date');
      const rows = db.prepare(`SELECT * FROM growth_records WHERE child_id = ? ${clause}`).all(childId, ...params);
      rows.forEach(r => {
        timeline.push({
          id: r.id,
          date: r.measurement_date,
          activity: 'Growth',
          typeBadge: 'p-mint',
          icon: '📈',
          title: `Growth Check: Weight ${r.weight_kg} kg, Height ${r.height_cm} cm`,
          details: `Age: ${r.age_months} mos &bull; Calculated BMI: ${r.bmi} (${r.bmi_category || 'Healthy'}) ${r.head_circ_cm ? `&bull; Head Circ: ${r.head_circ_cm} cm` : ''}`,
          notes: r.notes || '',
          data: r
        });
      });
    }

    // 2. Vaccinations
    if (category === 'All' || category === 'Vaccination') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'actual_date');
      const rows = db.prepare(`SELECT * FROM vaccination_records WHERE child_id = ? AND actual_date IS NOT NULL ${clause}`).all(childId, ...params);
      rows.forEach(r => {
        timeline.push({
          id: r.id,
          date: r.actual_date,
          activity: 'Vaccination',
          typeBadge: 'p-blue',
          icon: '💉',
          title: `Vaccine Administered: ${r.vaccine_name} (${r.dose_number})`,
          details: `Hospital: ${r.hospital_details} &bull; Doctor: ${r.doctor_name}`,
          notes: r.notes || '',
          data: r
        });
      });
    }

    // 3. Symptoms
    if (category === 'All' || category === 'Symptom') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'onset_date');
      const rows = db.prepare(`SELECT * FROM symptom_records WHERE child_id = ? ${clause}`).all(childId, ...params);
      rows.forEach(r => {
        timeline.push({
          id: r.id,
          date: r.onset_date,
          activity: 'Symptom',
          typeBadge: 'p-pink',
          icon: '🩺',
          title: `Symptom Episode: ${r.symptom_name}`,
          details: `Duration: ${r.duration || 'N/A'} &bull; Severity: ${r.severity || 'Mild'} &bull; ${r.observations || ''}`,
          notes: r.recovery_notes ? `Recovery: ${r.recovery_notes}` : '',
          data: r
        });
      });
    }

    // 4. Milestones
    if (category === 'All' || category === 'Milestone') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'achieved_date');
      const rows = db.prepare(`SELECT * FROM milestone_records WHERE child_id = ? AND achieved_date IS NOT NULL ${clause}`).all(childId, ...params);
      rows.forEach(r => {
        timeline.push({
          id: r.id,
          date: r.achieved_date,
          activity: 'Milestone',
          typeBadge: 'p-lavender',
          icon: '🌱',
          title: `Milestone Achieved: ${r.milestone_text}`,
          details: `Domain: ${r.domain} &bull; Age Bracket: ${r.age_group}`,
          notes: r.notes || '',
          data: r
        });
      });
    }

    // 5. Medical Documents
    if (category === 'All' || category === 'Document') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'medical_record_date');
      const rows = db.prepare(`SELECT * FROM medical_documents WHERE child_id = ? ${clause}`).all(childId, ...params);
      rows.forEach(r => {
        timeline.push({
          id: r.id,
          date: r.medical_record_date,
          activity: 'Document',
          typeBadge: 'p-yellow',
          icon: '🪪',
          title: `Medical Record: ${r.document_name}`,
          details: `Category: ${r.category} &bull; Format: ${r.file_type} (${r.file_size || '1 MB'})`,
          notes: r.notes || '',
          data: r
        });
      });
    }

    // 6. Nutrition
    if (category === 'All' || category === 'Nutrition') {
      const rows = db.prepare(`SELECT * FROM nutrition_records WHERE child_id = ?`).all(childId);
      rows.forEach(r => {
        const dateOnly = r.feeding_datetime.split(' ')[0];
        timeline.push({
          id: r.id,
          date: dateOnly,
          activity: 'Nutrition',
          typeBadge: 'p-mint',
          icon: '🍎',
          title: `${r.meal_category}: ${r.food_details} ${r.is_first_time ? '✨ (First Time Trial)' : ''}`,
          details: `${r.observations || 'Normal acceptance'}`,
          notes: r.concerns ? `Concerns: ${r.concerns}` : '',
          data: r
        });
      });
    }

    // 7. Appointments
    if (category === 'All' || category === 'Appointment') {
      const { clause, params } = getDateFilterClause(filter, searchParams.get('startDate'), searchParams.get('endDate'), 'appointment_date');
      const rows = db.prepare(`SELECT * FROM appointments WHERE child_id = ? ${clause}`).all(childId, ...params);
      rows.forEach(r => {
        timeline.push({
          id: r.id,
          date: r.appointment_date,
          activity: 'Appointment',
          typeBadge: 'p-blue',
          icon: '📅',
          title: `Pediatric Consultation: ${r.doctor_name}`,
          details: `Ref: ${r.ref_code} &bull; ${r.type} &bull; Status: ${r.status}`,
          notes: r.consultation_notes || '',
          data: r
        });
      });
    }

    // Filter by search string
    let filtered = timeline;
    if (search) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(search) || 
        item.details.toLowerCase().includes(search) ||
        item.notes.toLowerCase().includes(search)
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sort === 'ASC' ? dateA - dateB : dateB - dateA;
    });

    return sendJSON(res, 200, filtered);
  }

  // 11. ADMIN API: GET /api/admin/stats
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    const totalChildren = db.prepare('SELECT COUNT(*) as c FROM children').get().c;
    const vaccinesTaken = db.prepare("SELECT COUNT(*) as c FROM vaccination_records WHERE status = 'Completed'").get().c;
    const vaccinesPending = db.prepare("SELECT COUNT(*) as c FROM vaccination_records WHERE status != 'Completed'").get().c;
    const symptomAlerts = db.prepare('SELECT COUNT(*) as c FROM symptom_records').get().c;
    return sendJSON(res, 200, { totalChildren, vaccinesTaken, vaccinesPending, symptomAlerts });
  }

  // ==========================================
  // Static File Serving
  // ==========================================
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Mukta Children Hospital & Child Health Hub running at http://localhost:${PORT}`);
});
