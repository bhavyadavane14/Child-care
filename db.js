/**
 * Mukta Children Hospital - Persistent Database Manager
 * Uses built-in node:sqlite for permanent ACID-compliant storage in 'mukta_health.db'
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = path.join(__dirname, 'mukta_health.db');
const db = new DatabaseSync(DB_PATH);

// Initialize Tables
function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    -- Parents / Users
    CREATE TABLE IF NOT EXISTS parents (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Children Profiles
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      blood_group TEXT,
      photo_url TEXT,
      uhid TEXT UNIQUE NOT NULL,
      pediatrician TEXT DEFAULT 'Dr. Nitin Seth',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
    );

    -- Vaccination Records
    CREATE TABLE IF NOT EXISTS vaccination_records (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      vaccine_id TEXT NOT NULL,
      vaccine_name TEXT NOT NULL,
      dose_number TEXT NOT NULL,
      recommended_date TEXT NOT NULL,
      actual_date TEXT,
      status TEXT NOT NULL, -- 'Completed', 'Upcoming', 'Overdue'
      hospital_details TEXT DEFAULT 'Mukta Children Hospital, Amravati',
      doctor_name TEXT DEFAULT 'Dr. Nitin Seth',
      certificate_url TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    -- Growth Measurements
    CREATE TABLE IF NOT EXISTS growth_records (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      measurement_date TEXT NOT NULL,
      height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL,
      head_circ_cm REAL,
      age_months INTEGER NOT NULL,
      bmi REAL NOT NULL,
      bmi_category TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    -- Symptom Records
    CREATE TABLE IF NOT EXISTS symptom_records (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      symptom_id TEXT NOT NULL,
      symptom_name TEXT NOT NULL,
      onset_date TEXT NOT NULL,
      duration TEXT,
      severity TEXT,
      associated_symptoms TEXT,
      observations TEXT,
      recovery_notes TEXT,
      doctor_consultation_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    -- Development Milestones
    CREATE TABLE IF NOT EXISTS milestone_records (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      milestone_id TEXT NOT NULL,
      milestone_text TEXT NOT NULL,
      age_group TEXT NOT NULL,
      domain TEXT NOT NULL,
      status TEXT NOT NULL, -- 'Achieved', 'In Progress', 'Not Observed'
      achieved_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    -- Digital Health Passport / Medical Documents
    CREATE TABLE IF NOT EXISTS medical_documents (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      document_name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'Prescriptions', 'Lab Reports', 'Vaccination Records', 'Discharge Summary'
      medical_record_date TEXT NOT NULL,
      upload_date TEXT DEFAULT (datetime('now')),
      file_type TEXT DEFAULT 'PDF',
      file_size TEXT,
      file_data TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    -- Nutrition & Feeding Journal
    CREATE TABLE IF NOT EXISTS nutrition_records (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      feeding_datetime TEXT NOT NULL,
      meal_category TEXT NOT NULL, -- 'Breakfast', 'Lunch', 'Evening Snack', 'Dinner', 'Milk Feed'
      food_details TEXT NOT NULL,
      is_first_time INTEGER DEFAULT 0,
      observations TEXT,
      concerns TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    -- Appointments
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      department TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      type TEXT NOT NULL, -- 'In-Clinic OPD', 'Video Consult'
      status TEXT NOT NULL, -- 'Confirmed', 'Completed', 'Cancelled'
      consultation_notes TEXT,
      follow_up_date TEXT,
      ref_code TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    -- Saved / Bookmarked Articles
    CREATE TABLE IF NOT EXISTS saved_articles (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      article_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      saved_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
    );

    -- Notifications & Reminders
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      channel TEXT DEFAULT 'WhatsApp',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    -- Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      child_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

// Seed initial setup (no hardcoded children - user adds their own)
function seedInitialData() {
  const check = db.prepare('SELECT COUNT(*) as count FROM parents').get();
  if (check.count === 0) {
    const insertParent = db.prepare(`
      INSERT INTO parents (id, full_name, email, phone)
      VALUES (?, ?, ?, ?)
    `);
    insertParent.run('parent-1', 'Parent', 'parent@example.com', '+91 98230 45678');
  }
}

module.exports = {
  db,
  initDatabase
};
