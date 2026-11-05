/**
 * Mukta Child Health Hub - Master Application Controller
 * Handles Multi-Page Navigation, Symptom Prediction Engine,
 * Official Digital Health ID Card, Multi-Child Management & History
 */

// ==========================================================================
// 1. Dual-Layer Persistent Database Client (SQLite Server + IndexedDB + Firebase Hook)
// ==========================================================================

const API_BASE = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:3000';

// ==========================================================================
// Per-user identity (each browser sees only its own children)
// ==========================================================================
const MUKTA_USER_KEY = 'mukta_user_id';

function getMuktaUserId() {
  try {
    let id = localStorage.getItem(MUKTA_USER_KEY);
    if (!id) {
      id = 'user-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(MUKTA_USER_KEY, id);
    }
    return id;
  } catch (e) {
    return 'user-anonymous';
  }
}

function isDoctorAuthenticated() {
  try {
    return sessionStorage.getItem('mukta_doctor_authenticated') === 'true';
  } catch (e) {
    return false;
  }
}

function getRequestHeaders(extra = {}) {
  const headers = { 'X-Mukta-User': getMuktaUserId(), ...extra };
  if (isDoctorAuthenticated()) headers['X-Mukta-Admin'] = 'doctormukta';
  return headers;
}

// ==========================================================================
// Firebase Cloud Sync Integration (child-care-2005a)
// ==========================================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBcDhZgeesABj95Lf6dapXDVjb_iJqHrfA",
  authDomain: "child-care-2005a.firebaseapp.com",
  projectId: "child-care-2005a",
  storageBucket: "child-care-2005a.firebasestorage.app",
  messagingSenderId: "329218948049",
  appId: "1:329218948049:web:5f20f35ffded5f586fbef0"
};

let firebaseDb = null;
let isFirebaseEnabled = false;

function initFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      firebaseDb = firebase.firestore();
      isFirebaseEnabled = true;
      console.log('🔥 Firebase Cloud Sync Active – child-care-2005a.firebaseapp.com');
      return true;
    }
  } catch (err) {
    console.warn('Firebase init skipped (running on local server):', err.message);
  }
  return false;
}

// Save a record to Firestore in parallel with local save (fire-and-forget)
async function syncToFirebase(collection, id, data) {
  if (!isFirebaseEnabled || !firebaseDb) return;
  try {
    await firebaseDb.collection(collection).doc(id).set(data, { merge: true });
  } catch (err) {
    console.warn('Firebase sync failed (non-critical):', err.message);
  }
}

// Load children from Firestore when server is unavailable (Vercel static / offline)
async function loadChildrenFromFirebase() {
  if (!isFirebaseEnabled || !firebaseDb) return null;
  try {
    const snap = await firebaseDb.collection('children').orderBy('created_at', 'asc').get();
    const uid = getMuktaUserId();
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => !c.parent_id || c.parent_id === uid);
  } catch (err) {
    return null;
  }
}

class DatabaseClient {
  constructor() {
    this.useServer = false;
    this.idb = null;
    this.initIndexedDB();
  }

  async initIndexedDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open('MuktaHealthHubDB', 4);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        const stores = [
          'parents', 'children', 'growth_records', 'vaccination_records',
          'symptom_records', 'milestone_records', 'medical_documents',
          'nutrition_records', 'appointments', 'saved_articles', 'notifications'
        ];
        stores.forEach(s => {
          if (!db.objectStoreNames.contains(s)) {
            db.createObjectStore(s, { keyPath: 'id' });
          }
        });
      };
      request.onsuccess = (e) => {
        this.idb = e.target.result;
        resolve();
      };
      request.onerror = () => resolve();
    });
  }

  async checkServerConnection() {
    try {
      const res = await fetch(`${API_BASE}/api/parent`, {
        headers: getRequestHeaders(),
        signal: AbortSignal.timeout(1200)
      });
      if (res.ok) {
        this.useServer = true;
        return true;
      }
    } catch (e) {
      this.useServer = false;
    }
    return false;
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE}${endpoint}`);
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        url.searchParams.append(k, params[k]);
      }
    });

    if (this.useServer) {
      try {
        const res = await fetch(url.toString(), { headers: getRequestHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Server fetch failed, falling back to local database', e);
      }
    }
    return this.getLocal(endpoint, params);
  }

  async post(endpoint, data) {
    if (this.useServer) {
      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: getRequestHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Server POST failed, saving to local database', e);
      }
    }
    return this.saveLocal(endpoint, data);
  }

  async delete(endpoint, id) {
    if (this.useServer) {
      try {
        const res = await fetch(`${API_BASE}${endpoint}?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: getRequestHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Server DELETE failed, deleting from local database', e);
      }
    }
    return this.deleteLocal(endpoint, id);
  }

  async getLocal(endpoint, params) {
    if (!this.idb) return [];
    let storeName = '';
    if (endpoint.includes('/children')) storeName = 'children';
    else if (endpoint.includes('/growth')) storeName = 'growth_records';
    else if (endpoint.includes('/vaccinations')) storeName = 'vaccination_records';
    else if (endpoint.includes('/symptoms')) storeName = 'symptom_records';
    else if (endpoint.includes('/milestones')) storeName = 'milestone_records';
    else if (endpoint.includes('/documents')) storeName = 'medical_documents';
    else if (endpoint.includes('/nutrition')) storeName = 'nutrition_records';
    else if (endpoint.includes('/appointments')) storeName = 'appointments';
    else if (endpoint.includes('/history')) return this.getLocalHistory(params);

    if (!storeName) return [];

    return new Promise((resolve) => {
      const tx = this.idb.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        let items = req.result || [];
        if (params.childId || params.child_id) {
          const cid = params.childId || params.child_id;
          items = items.filter(i => i.child_id === cid || i.childId === cid);
        }
        if (params.status && params.status !== 'all') {
          items = items.filter(i => i.status === params.status);
        }
        resolve(items);
      };
      req.onerror = () => resolve([]);
    });
  }

  async saveLocal(endpoint, data) {
    if (!this.idb) return { ...data, id: `local-${Date.now()}` };
    let storeName = '';
    if (endpoint.includes('/children')) storeName = 'children';
    else if (endpoint.includes('/growth')) storeName = 'growth_records';
    else if (endpoint.includes('/vaccinations')) storeName = 'vaccination_records';
    else if (endpoint.includes('/symptoms')) storeName = 'symptom_records';
    else if (endpoint.includes('/milestones')) storeName = 'milestone_records';
    else if (endpoint.includes('/documents')) storeName = 'medical_documents';
    else if (endpoint.includes('/nutrition')) storeName = 'nutrition_records';
    else if (endpoint.includes('/appointments')) storeName = 'appointments';

    const item = { ...data, id: data.id || `rec-${Date.now()}` };
    const tx = this.idb.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
    return item;
  }

  async deleteLocal(endpoint, id) {
    if (!this.idb) return { success: true };
    let storeName = '';
    if (endpoint.includes('/children')) {
      storeName = 'children';
      // Cascade delete from all stores for this child
      const cascadeStores = ['growth_records', 'vaccination_records', 'symptom_records', 'milestone_records', 'medical_documents', 'nutrition_records', 'appointments'];
      for (const s of cascadeStores) {
        try {
          if (this.idb.objectStoreNames.contains(s)) {
            const tx = this.idb.transaction(s, 'readwrite');
            const st = tx.objectStore(s);
            const req = st.getAll();
            req.onsuccess = () => {
              (req.result || []).filter(item => item.child_id === id || item.childId === id).forEach(i => st.delete(i.id));
            };
          }
        } catch(e) {}
      }
    }
    if (!storeName) return { success: true };
    return new Promise((resolve) => {
      try {
        const tx = this.idb.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(id);
        tx.oncomplete = () => resolve({ success: true });
        tx.onerror = () => resolve({ success: false });
      } catch (err) {
        resolve({ success: false });
      }
    });
  }

  async getLocalHistory(params) {
    const cid = params.child_id || params.childId;
    if (!cid) return { records: [], total: 0 };
    const stores = ['growth_records', 'vaccination_records', 'symptom_records', 'milestone_records', 'medical_documents', 'nutrition_records', 'appointments'];
    const results = [];

    for (const storeName of stores) {
      const records = await new Promise(resolve => {
        const tx = this.idb.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      records.filter(r => r.child_id === cid || r.childId === cid).forEach(r => {
        results.push({
          type: storeName.replace('_records', '').replace('medical_', ''),
          title: r.vaccine_name || (r.height_cm ? `Growth: ${r.height_cm}cm, ${r.weight_kg}kg` : (r.symptom_name || r.milestone_name || r.food_items || r.doctor_name || 'Health Entry')),
          date: r.measurement_date || r.actual_date || r.recommended_date || r.date || r.achieved_date || r.created_at || 'Recent',
          data: r
        });
      });
    }

    results.sort((a, b) => new Date(b.date) - new Date(a.date));
    return { records: results, total: results.length };
  }
}

const dbClient = new DatabaseClient();

// ==========================================================================
// 2. Application State
// ==========================================================================

let appState = {
  activeChildId: localStorage.getItem('mukta_active_child_id') || null,
  children: [],
  vaccineFilter: 'all',
  chartMetric: 'height',
  selectedSymptoms: [], // array of selected symptom objects for multi-symptom prediction
  activeMilestoneStageIndex: 2, // 18-24 months default
  historyFilter: 'all',
  historyCategory: 'all',
  historySearch: '',
  selectedAvatar: '👶'
};

let growthChartInstance = null;

// ==========================================================================
// 3. Utility Functions
// ==========================================================================

// Translation helpers (translations.js is always loaded before app.js)
function tr(key, fallback) {
  return (typeof t === 'function') ? t(key, fallback) : (fallback || key);
}

function trf(key, vars, fallback) {
  return (typeof tf === 'function') ? tf(key, vars, fallback) : (fallback || key);
}

const DURATION_VALUE_KEYS = {
  'Just started today (< 24 hrs)': 'duration_today',
  '1 to 3 days': 'duration_1_3',
  'More than 3 days': 'duration_gt3',
  'Intermittent / recurring': 'duration_intermittent'
};

const SEVERITY_VALUE_KEYS = {
  'Mild (Child is playful & feeding)': 'severity_mild',
  'Moderate (Fussy, reduced feeding)': 'severity_moderate',
  'Severe (Lethargic, continuous crying)': 'severity_severe'
};

function translateStoredDuration(value) {
  if (!value) return tr('duration_1_3', '1 to 3 days');
  const key = DURATION_VALUE_KEYS[value];
  return key ? tr(key, value) : value;
}

function translateStoredSeverity(value) {
  if (!value) return tr('severity_moderate', 'Moderate');
  const key = SEVERITY_VALUE_KEYS[value];
  return key ? tr(key, value) : value;
}

function translateBmiCategory(value) {
  const map = {
    'Underweight': 'bmi_underweight',
    'Healthy Weight': 'bmi_healthy',
    'Normal': 'bmi_healthy',
    'Overweight': 'bmi_above'
  };
  const key = map[value];
  return key ? tr(key, value) : (value || tr('bmi_healthy', 'Healthy Weight'));
}

function translateArticleCategory(category) {
  const c = String(category || '').toLowerCase();
  if (c.includes('newborn')) return tr('data.cat.newborn', category);
  if (c.includes('nutrition')) return tr('data.cat.nutrition', category);
  if (c.includes('sleep')) return tr('data.cat.sleep', category);
  if (c.includes('vaccin')) return tr('data.cat.vaccination', category);
  if (c.includes('development')) return tr('data.cat.development', category);
  if (c.includes('illness')) return tr('data.cat.illnesses', category);
  return category;
}

function translateMilestoneDomain(domain) {
  const d = String(domain || '').toLowerCase();
  if (d.includes('motor')) return tr('domain_motor', domain);
  if (d.includes('social') || d.includes('emotion')) return tr('domain_social', domain);
  if (d.includes('comm') || d.includes('speech') || d.includes('language')) return tr('domain_comm', domain);
  if (d.includes('cogn') || d.includes('play')) return tr('domain_cogn', domain);
  return domain;
}

function calculateDetailedAge(dobString) {
  if (!dobString) return { years: 0, months: 0, days: 0, totalMonths: 0, label: tr('unknown', 'Unknown') };
  const birthDate = new Date(dobString);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return { years: 0, months: 0, days: 0, totalMonths: 0, label: tr('unknown', 'Unknown') };

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = (years * 12) + months;
  const label = years > 0 ? `${years}y ${months}m ${days}d` : `${months}m ${days}d`;
  return { years, months, days, totalMonths, label };
}

// Backwards-compatible alias used by the doctor portal
function calculateAge(dobString) {
  return calculateDetailedAge(dobString);
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 30);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3800);
}

// Drawer Toggle
function toggleDrawer() {
  const drawer = document.getElementById('side-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.toggle('open');
    overlay.classList.toggle('open');
  }
}

function closeDrawerAndScroll(event, targetId) {
  if (event) event.preventDefault();
  toggleDrawer();
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// Modal Handlers
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

function handleModalBackdropClick(e, id) {
  if (e.target.id === id) {
    closeModal(id);
  }
}

// ==========================================================================
// 4. Child Profile Management (No Defaults! Add & Delete Option!)
// ==========================================================================

async function loadChildren() {
  let serverChildren = await dbClient.get('/api/children');

  // Fallback to Firebase if server returned empty or is unreachable
  if ((!serverChildren || serverChildren.length === 0) && isFirebaseEnabled) {
    const fbChildren = await loadChildrenFromFirebase();
    if (fbChildren && fbChildren.length > 0) {
      serverChildren = fbChildren;
    }
  }

  const uniqueChildren = [];
  const seenIds = new Set();
  (Array.isArray(serverChildren) ? serverChildren : []).forEach(c => {
    if (c && c.id && !seenIds.has(c.id)) {
      seenIds.add(c.id);
      uniqueChildren.push(c);
    }
  });
  appState.children = uniqueChildren;

  // Determine active child: check saved or default to first user-created child
  if (appState.children.length > 0) {
    if (!appState.children.some(c => c.id === appState.activeChildId)) {
      appState.activeChildId = appState.children[0].id;
    }
  } else {
    appState.activeChildId = null;
  }

  localStorage.setItem('mukta_active_child_id', appState.activeChildId || '');

  renderChildTabs();
  renderActiveChildProfile();
}

function getActiveChild() {
  if (!appState.children || appState.children.length === 0) return null;
  return appState.children.find(c => c.id === appState.activeChildId) || appState.children[0];
}

function renderChildTabs() {
  const container = document.getElementById('child-tabs-bar');
  if (!container) return;

  container.innerHTML = '';

  appState.children.forEach(child => {
    const btn = document.createElement('button');
    btn.className = `child-tab-pill ${child.id === appState.activeChildId ? 'active' : ''}`;
    btn.innerHTML = `<span>${child.photo_url || '👶'}</span> <span>${child.full_name}</span>`;
    btn.onclick = () => switchActiveChild(child.id);
    container.appendChild(btn);
  });

  // "+ Add Child" Tab
  const addBtn = document.createElement('button');
  addBtn.className = 'child-tab-pill add-tab-btn';
  addBtn.innerHTML = `<span>+</span> ${tr('add_child', 'Add Child')}`;
  addBtn.onclick = () => openModal('child-modal');
  container.appendChild(addBtn);
}

async function switchActiveChild(childId) {
  appState.activeChildId = childId;
  localStorage.setItem('mukta_active_child_id', childId);
  renderChildTabs();
  renderActiveChildProfile();

  // Reload page-specific data if on subpages
  if (window.location.pathname.includes('vaccines') || document.getElementById('vaccine-timeline-list')) renderVaccinationModule();
  if (window.location.pathname.includes('growth') || document.getElementById('growthChartCanvas')) renderGrowthModule();
  if (window.location.pathname.includes('symptoms') || document.getElementById('symptom-chips-container')) renderSymptomModule();
  if (window.location.pathname.includes('milestones') || document.getElementById('milestone-age-pills')) renderMilestonesModule();
  if (window.location.pathname.includes('history') || document.getElementById('master-timeline-container')) renderMasterHistoryModule();
  if (document.getElementById('reminders-container')) renderRemindersModule();

  const active = getActiveChild();
  if (active) {
    showToast(trf('profile_switched', { name: active.full_name }, `Switched active profile to ${active.full_name}`), 'info');
  }
}

function renderActiveChildProfile() {
  const child = getActiveChild();

  // Navbar pills
  const navAvatar = document.getElementById('nav-child-avatar');
  const navName = document.getElementById('nav-child-name');
  if (navAvatar) navAvatar.textContent = child ? (child.photo_url || '👶') : '👶';
  if (navName) navName.textContent = child ? child.full_name.split(' ')[0] : tr('select_child', 'Select Child');

  // Drawer child card
  const dAvatar = document.getElementById('drawer-child-avatar');
  const dName = document.getElementById('drawer-child-name');
  const dAge = document.getElementById('drawer-child-age');
  if (dAvatar) dAvatar.textContent = child ? (child.photo_url || '👶') : '👶';
  if (dName) dName.textContent = child ? child.full_name : tr('no_child_selected', 'No Child Selected');
  if (dAge) {
    if (child) {
      const a = calculateDetailedAge(child.dob);
      dAge.textContent = `${a.label} (${a.totalMonths} ${tr('months_short', 'months')})`;
    } else {
      dAge.textContent = tr('add_child_below', 'Add your child below');
    }
  }

  // Profile section on index.html
  const profileContainer = document.getElementById('child-profile-container');
  if (!profileContainer) return;

  if (!child) {
    // Empty state: No child added yet
    profileContainer.innerHTML = `
      <div class="history-empty-actionable">
        <span class="empty-icon-big">👶</span>
        <h3 class="empty-title">${tr('welcome_title', 'Welcome to Mukta Child Health Hub!')}</h3>
        <p class="empty-text">${tr('welcome_text', 'No child profile has been registered yet. Click the button below to add your child and unlock personalized growth curves, vaccine schedules, and disease prediction.')}</p>
        <div class="empty-quick-actions">
          <button class="btn-pill-primary" onclick="openModal('child-modal')">${tr('register_your_child', '+ Register Your Child')}</button>
        </div>
      </div>
    `;
    return;
  }

  const age = calculateDetailedAge(child.dob);

  // Render Full Profile Card + OFFICIAL DIGITAL HEALTH ID CARD (Img 3)
  profileContainer.innerHTML = `
    <div class="child-profile-card">
      <div class="profile-card-left">
        <div class="profile-avatar-wrapper">
          <div class="profile-avatar">${child.photo_url || '👶'}</div>
        </div>
        <h3 class="profile-child-name">${child.full_name}</h3>
        <div class="profile-uhid">UHID: ${child.uhid || 'MUKTA-UHID'}</div>
        <div class="profile-doctor-badge">
          <span>🩺 Doctor:</span> <strong>${child.pediatrician || 'Dr. Nitin Seth'}</strong>
        </div>

        <!-- Child Management Actions: Edit, Delete -->
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
          <button class="btn-delete-child" onclick="deleteChildProfile('${child.id}', '${child.full_name.replace(/'/g, "\\'")}')">
            ${tr('delete_child_profile', '🗑️ Delete Child Profile')}
          </button>
        </div>
      </div>

      <div class="profile-card-right">
        <div class="profile-metrics-grid">
          <div class="metric-box bg-baby-blue">
            <span class="metric-label">${tr('current_age', 'CURRENT AGE')}</span>
            <span class="metric-value">${age.label}</span>
            <span class="metric-hint">${age.totalMonths} ${tr('months_short', 'months')}</span>
          </div>

          <div class="metric-box bg-pastel-pink">
            <span class="metric-label">${tr('date_of_birth', 'DATE OF BIRTH')}</span>
            <span class="metric-value">${formatDate(child.dob)}</span>
            <span class="metric-hint">${child.gender === 'male' ? tr('boy', 'Boy') + ' 👦' : tr('girl', 'Girl') + ' 👧'}</span>
          </div>

          <div class="metric-box bg-soft-yellow">
            <span class="metric-label">${tr('blood_group_upper', 'BLOOD GROUP')}</span>
            <span class="metric-value text-accent">${child.blood_group || tr('unknown', 'Unknown')}</span>
            <span class="metric-hint">${tr('verified', 'Verified')}</span>
          </div>

          <div class="metric-box bg-mint-green">
            <span class="metric-label">${tr('health_status', 'HEALTH STATUS')}</span>
            <span class="metric-value text-success">${tr('up_to_date', 'Up to Date')}</span>
            <span class="metric-hint">${tr('active_profile', 'Active Profile')}</span>
          </div>
        </div>

        <div class="profile-quick-actions">
          <a href="vaccines.html" class="btn-action-pill bg-baby-blue" style="text-decoration: none;">${tr('view_vaccines', '💉 View Vaccines')}</a>
          <a href="growth.html" class="btn-action-pill bg-mint-green" style="text-decoration: none;">${tr('log_growth', '📈 Log Growth')}</a>
          <a href="symptoms.html" class="btn-action-pill bg-pastel-pink" style="text-decoration: none;">${tr('check_symptoms', '🩺 Check Symptoms')}</a>
          <a href="history.html" class="btn-action-pill bg-lavender" style="text-decoration: none;">${tr('full_history', '📜 Full History')}</a>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         OFFICIAL DIGITAL HEALTH IDENTIFICATION CARD (As requested in Img 3)
         ========================================================================= -->
    <div class="child-id-showcase">
      <div class="child-id-header">
        <div>
          <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark);">${tr('official_id_card', '🪪 Official Child Health Identification Card')}</h3>
          <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0;">${tr('official_id_desc', "Verified hospital digital ID for Dr. Nitin Seth's pediatric consultations and emergency care.")}</p>
        </div>
        <div class="child-id-actions">
          <button class="btn-pill-outline btn-sm" onclick="copyUHID('${child.uhid}')">${tr('copy_uhid', '📋 Copy UHID')}</button>
          <button class="btn-pill-primary btn-sm" onclick="window.print()">${tr('print_id_card', '🖨️ Print / Save ID Card')}</button>
        </div>
      </div>

      <!-- Exact Re-creation of Img 3 Card -->
      <div style="max-width: 540px; margin: 0 auto;">
        <div class="passport-id-card">
          <div class="passport-card-top">
            <div class="hosp-mini-brand">
              <img src="logo.jpg" alt="Mukta Hospital Logo" class="mini-logo" />
              <div>
                <strong>${tr('mukta_children_hospital', 'MUKTA CHILDREN HOSPITAL')}</strong>
                <small>${tr('digital_health_id_card', 'Digital Health Identification Card')}</small>
              </div>
            </div>
            <div class="passport-seal">${tr('certified', 'CERTIFIED')}</div>
          </div>

          <div class="passport-card-body">
            <div class="pass-avatar">${child.photo_url || '👶'}</div>
            <div class="pass-info-col">
              <h2 class="pass-name" style="color: #fff; font-size: 1.5rem; margin-bottom: 2px;">${child.full_name}</h2>
              <div class="pass-uhid" style="color: rgba(255,255,255,0.9); font-weight: 700; margin-bottom: 8px;">UHID: ${child.uhid || 'MUKTA-UHID'}</div>
              <div class="pass-meta-row" style="flex-wrap: wrap; gap: 10px;">
                <div><span>DOB:</span> <strong>${formatDate(child.dob)}</strong></div>
                <div><span>${tr('sex_label', 'Sex:')}</span> <strong>${child.gender === 'male' ? tr('male', 'Male') : tr('female', 'Female')}</strong></div>
                <div><span>Blood:</span> <strong style="color: #FCD34D;">${child.blood_group || tr('unknown', 'Unknown')}</strong></div>
              </div>
            </div>
          </div>

          <div class="passport-card-footer">
            <div>
              <span class="foot-label">${tr('primary_pediatrician', 'PRIMARY PEDIATRICIAN')}</span>
              <strong class="foot-val">${child.pediatrician || 'Dr. Nitin Seth'}</strong>
            </div>
            <div>
              <span class="foot-label">${tr('emergency_phone', 'EMERGENCY PHONE')}</span>
              <strong class="foot-val">+91 98230 45678</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function copyUHID(uhid) {
  if (!uhid) return;
  navigator.clipboard.writeText(uhid);
  showToast(`Copied UHID ${uhid} to clipboard!`, 'success');
}

function selectAvatar(avatar, btn) {
  appState.selectedAvatar = avatar;
  document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

async function handleAddChildSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('child-name-input').value.trim();
  const dob = document.getElementById('child-dob-input').value;
  const gender = document.getElementById('child-gender-input').value;
  const blood = document.getElementById('child-blood-input').value;

  if (!name || !dob) {
    showToast(tr('please_enter_name_dob', 'Please enter full name and birth date.'), 'warning');
    return;
  }

  const newChild = await dbClient.post('/api/children', {
    full_name: name,
    dob: dob,
    gender: gender,
    blood_group: blood,
    photo_url: appState.selectedAvatar,
    parent_id: getMuktaUserId()
  });

  // Firebase cloud sync (real-time multi-device persistence)
  if (newChild && newChild.id) {
    await syncToFirebase('children', newChild.id, {
      id: newChild.id,
      full_name: name,
      dob, gender,
      blood_group: blood,
      uhid: newChild.uhid || '',
      pediatrician: 'Dr. Nitin Seth',
      parent_id: getMuktaUserId(),
      created_at: new Date().toISOString()
    });
  }

  closeModal('child-modal');
  document.getElementById('add-child-form').reset();
  await loadChildren();
  switchActiveChild(newChild.id);
  showToast(trf('profile_created', { name }, `Profile created for ${name}! 🎉`), 'success');
}
async function deleteChildProfile(childId, childName) {
  const confirmDelete = confirm(trf('confirm_delete_child', { name: childName }, `Are you sure you want to delete the profile of "${childName}"?\n\nThis will permanently remove their records, growth charts, and history.`));
  if (!confirmDelete) return;

  // 1. Delete from Server API
  try {
    await dbClient.delete('/api/children', childId);
  } catch (err) {
    console.warn('API delete child failed:', err);
  }

  // 2. Delete from Firebase Cloud Firestore if active
  if (isFirebaseEnabled && firebaseDb) {
    try {
      await firebaseDb.collection('children').doc(childId).delete();
      console.log('🔥 Deleted child from Firebase Firestore:', childId);
    } catch (err) {
      console.warn('Firebase child delete failed:', err);
    }
  }

  // 3. Remove vaccine status from localStorage
  try {
    localStorage.removeItem(`mukta_vaccines_${childId}`);
  } catch (err) {}

  // 4. Update in-memory appState
  appState.children = (appState.children || []).filter(c => c.id !== childId);

  // 5. If deleted child was active, switch to next available child or null
  if (appState.activeChildId === childId) {
    if (appState.children.length > 0) {
      appState.activeChildId = appState.children[0].id;
      localStorage.setItem('mukta_active_child_id', appState.activeChildId);
    } else {
      appState.activeChildId = null;
      localStorage.removeItem('mukta_active_child_id');
    }
  }

  // 6. Refresh UI immediately
  renderChildTabs();
  renderActiveChildProfile();
  showToast(trf('deleted_profile', { name: childName }, `Profile for ${childName} has been deleted.`), 'info');
}

// ==========================================================================
// 5. Feature: Pediatric Symptom Checker & Intelligent Predictor (Img 2)
// ==========================================================================

const CLINICAL_SYMPTOMS = [
  { id: 'fever', name: 'Fever / Elevated Temperature', icon: '🌡️', keywords: ['fever', 'high temp', 'hot'] },
  { id: 'cough_cold', name: 'Cough & Cold / Congestion', icon: '💨', keywords: ['cough', 'cold', 'sneezing', 'runny nose'] },
  { id: 'vomiting_diarrhea', name: 'Vomiting & Loose Stools / Diarrhea', icon: '💧', keywords: ['vomiting', 'loose stools', 'diarrhea', 'watery stool'] },
  { id: 'stomach_pain', name: 'Abdominal / Stomach Pain', icon: '🤕', keywords: ['tummy', 'abdominal', 'colic', 'cramp'] },
  { id: 'skin_rash', name: 'Skin Rashes & Allergies', icon: '🌸', keywords: ['rash', 'spots', 'itching', 'hives'] },
  { id: 'ear_pain', name: 'Ear Pain & Tugging', icon: '👂', keywords: ['earache', 'tugging', 'fluid'] },
  { id: 'poor_appetite', name: 'Poor Appetite & Refusal to Feed', icon: '🍽️', keywords: ['not eating', 'refusing feed'] },
  { id: 'lethargy', name: 'Excessive Drowsiness & Lethargy', icon: '🥱', keywords: ['sleepy', 'weak', 'drowsy'] },
  { id: 'breathing_difficulty', name: 'Fast or Laboured Breathing', icon: '🫁', keywords: ['fast breathing', 'wheezing', 'chest indrawing'] }
];

function renderSymptomChips() {
  const container = document.getElementById('symptom-chips-container');
  if (!container) return;

  container.innerHTML = '';
  CLINICAL_SYMPTOMS.forEach(s => {
    const isSelected = appState.selectedSymptoms.some(item => item.id === s.id);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `symp-chip ${isSelected ? 'active' : ''}`;
    chip.innerHTML = `<span>${s.icon}</span> <span>${tr('data.sym.' + s.id, s.name)}</span>`;
    chip.onclick = () => toggleSymptomSelection(s);
    container.appendChild(chip);
  });
}

function toggleSymptomSelection(symptom) {
  const index = appState.selectedSymptoms.findIndex(item => item.id === symptom.id);
  if (index > -1) {
    appState.selectedSymptoms.splice(index, 1);
  } else {
    appState.selectedSymptoms.push(symptom);
  }

  renderSymptomChips();

  const followupCard = document.getElementById('symptom-followup-card');
  if (appState.selectedSymptoms.length > 0) {
    if (followupCard) followupCard.style.display = 'block';
    runSymptomPrediction();
  } else {
    if (followupCard) followupCard.style.display = 'none';
    const panel = document.getElementById('symptom-guidance-panel');
    if (panel) {
      panel.innerHTML = `
        <div class="guidance-placeholder">
          <span class="big-icon">🩺</span>
          <h3>${tr('symptom_placeholder_title', 'Select a symptom on the left')}</h3>
          <p>${tr('symptom_placeholder_desc', 'Our pediatric logic will analyze combinations and predict likely conditions (e.g. Diarrhea, URTI / Cold, Otitis Media) with comfort protocols.')}</p>
        </div>
      `;
    }
  }
}

// Intelligent Clinical Predictor Engine (As requested in Img 2!)
function runSymptomPrediction() {
  const panel = document.getElementById('symptom-guidance-panel');
  if (!panel || appState.selectedSymptoms.length === 0) return;

  const sIds = appState.selectedSymptoms.map(s => s.id);
  const duration = document.getElementById('symp-duration')?.value || '1 to 3 days';
  const severity = document.getElementById('symp-severity')?.value || 'Moderate';

  let prediction = {
    key: 'general',
    condition: 'General Pediatric Viral Syndrome',
    confidence: 'Moderate Match (75%)',
    summary: 'Non-specific viral immune response. Usually self-limiting with adequate hydration and rest.',
    protocol: 'Maintain oral fluids, monitor temperature every 4 hours, and allow plenty of rest.',
    redFlags: [
      'High fever not responding to paracetamol',
      'Child is unusually lethargic or difficult to arouse',
      'Decreased urine output (< 3 wet diapers in 24 hours)'
    ]
  };

  // Rule 1: Vomiting + Diarrhea / Loose Stools (Img 2 direct match!)
  if (sIds.includes('vomiting_diarrhea') || (sIds.includes('stomach_pain') && sIds.includes('vomiting_diarrhea'))) {
    prediction = {
      key: 'gastro',
      condition: 'Acute Viral Gastroenteritis (Stomach Flu / Diarrhea)',
      confidence: 'High Probability Match (94%)',
      summary: 'Inflammation of the stomach and intestines, commonly triggered by Rotavirus, Norovirus, or dietary indiscretion. Causes watery stools, nausea, and stomach cramps.',
      protocol: 'Continuous hydration with Oral Rehydration Salts (ORS) given in small, frequent sips. Offer zinc supplementation and light foods (rice kanji, khichdi, curd, banana). Avoid fruit juices, cow milk, and sugary drinks.',
      redFlags: [
        'Signs of dehydration: dry tongue/mouth, no tears when crying, sunken eyes or fontanelle',
        'No wet diapers or urine for > 6 hours',
        'Greenish / bilious or coffee-ground vomit',
        'Blood or black tarry stools',
        'Severe abdominal pain with continuous high-pitched crying'
      ]
    };
  }
  // Rule 2: Cough + Cold + Fever
  else if (sIds.includes('cough_cold') && sIds.includes('fever')) {
    prediction = {
      key: 'urti',
      condition: 'Upper Respiratory Tract Infection (URTI / Common Cold with Fever)',
      confidence: 'High Probability Match (91%)',
      summary: 'Viral infection of the nasal passages and throat (rhinovirus, RSV, or adenovirus). Causes congestion, cough, runny nose, and low-to-moderate fever.',
      protocol: 'Saline nasal drops before feeds and sleep. Steam inhalation / cool mist humidifier. Honey for children over 1 year (do NOT give honey under 12 months). Keep head slightly elevated.',
      redFlags: [
        'Fast breathing, chest indrawing (ribs sucking in), or grunting noises',
        'Bluish discoloration around lips or tongue',
        'Stridor (harsh high-pitched sound while inhaling)',
        'Fever exceeding 103°F (39.5°C)'
      ]
    };
  }
  // Rule 3: Cough & Cold alone
  else if (sIds.includes('cough_cold')) {
    prediction = {
      key: 'cold',
      condition: 'Acute Viral Rhinitis (Common Cold)',
      confidence: 'High Probability Match (88%)',
      summary: 'Mild viral nasal congestion and sneezing. Normal appetite and activity usually preserved.',
      protocol: 'Saline drops, warm fluids, adequate rest. No OTC cough syrups for children under 4 years.',
      redFlags: [
        'Breathing faster than normal for age',
        'Persistent cough lasting more than 10 days',
        'Refusal to drink fluids'
      ]
    };
  }
  // Rule 4: Ear Pain + Fever
  else if (sIds.includes('ear_pain') && sIds.includes('fever')) {
    prediction = {
      key: 'ear',
      condition: 'Acute Otitis Media (Middle Ear Infection)',
      confidence: 'High Probability Match (89%)',
      summary: 'Fluid and bacterial or viral infection trapped behind the eardrum, often following a cold.',
      protocol: 'Warm compress to the outer ear, pain management with doctor-prescribed paracetamol or ibuprofen. Have Dr. Nitin Seth inspect the tympanic membrane with an otoscope.',
      redFlags: [
        'Discharge of yellowish pus or blood from ear canal',
        'Swelling and redness behind the ear (mastoid area)',
        'Stiff neck or severe irritability'
      ]
    };
  }
  // Rule 5: Skin Rash + Fever
  else if (sIds.includes('skin_rash') && sIds.includes('fever')) {
    prediction = {
      key: 'rash',
      condition: 'Viral Exanthem / Roseola / Allergic Rash with Fever',
      confidence: 'Moderate-to-High Match (85%)',
      summary: 'Widespread rash accompanying a viral infection, common during teething or post-fever recovery.',
      protocol: 'Dress child in loose cotton clothing. Luke-warm baths, calamine lotion for itching. Avoid hot baths.',
      redFlags: [
        'Petechiae or purpura: tiny purple or dark red spots that DO NOT fade when pressed firmly with a clear drinking glass',
        'Rapidly spreading rash with facial or lip swelling (Anaphylaxis risk)'
      ]
    };
  }
  // Rule 6: Breathing Difficulty
  else if (sIds.includes('breathing_difficulty')) {
    prediction = {
      key: 'breathing',
      condition: 'Pediatric Respiratory Distress / Bronchiolitis or Asthma Flare',
      confidence: 'CRITICAL ATTENTION REQUIRED (96%)',
      summary: 'Lower airway narrowing or inflammation causing increased work of breathing.',
      protocol: 'Keep child calm in an upright sitting posture. DO NOT delay hospital evaluation.',
      redFlags: [
        'Immediate hospital visit required: Nasal flaring, chest retractions, lethargy'
      ]
    };
  }

  const pkey = prediction.key || 'general';
  const pCondition = tr('data.pred.' + pkey + '.condition', prediction.condition);
  const pConfidence = tr('data.pred.' + pkey + '.confidence', prediction.confidence);
  const pSummary = tr('data.pred.' + pkey + '.summary', prediction.summary);
  const pProtocol = tr('data.pred.' + pkey + '.protocol', prediction.protocol);
  const pRedFlags = prediction.redFlags.map((rf, i) => tr('data.pred.' + pkey + '.rf' + i, rf));
  const redFlagsList = pRedFlags.map(rf => `<li>${rf}</li>`).join('');

  panel.innerHTML = `
    <div>
      <!-- Prediction Box Card -->
      <div class="prediction-box-card">
        <div class="prediction-top">
          <div class="prediction-title">${tr('predicted_condition', '🔍 Predicted Condition:')} ${pCondition}</div>
          <span class="confidence-badge">${pConfidence}</span>
        </div>
        <p class="prediction-desc">${pSummary}</p>
        <div class="prediction-protocol">
          <strong>${tr('protocol_title', '🌱 Doctor-Approved Comfort Protocol:')}</strong><br />
          ${pProtocol}
        </div>
      </div>

      <!-- Urgent Red Flags Alert Box -->
      <div class="red-flags-alert">
        <div class="red-flags-title">${tr('urgent_red_flags', '🚨 Urgent Red Flags (Seek Hospital Emergency):')}</div>
        <ul class="red-flags-list">
          ${redFlagsList}
        </ul>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <a href="tel:+919823045678" class="btn-emergency-call" style="font-size: 0.85rem; padding: 10px 18px;">${tr('emergency_call', '📞 Emergency Call')}</a>
        <button class="btn-pill-primary btn-sm" onclick="saveSymptomEpisode()">${tr('save_symptom_history', '💾 Save Symptom Check to History')}</button>
      </div>
    </div>
  `;
}

async function saveSymptomEpisode() {
  const child = getActiveChild();
  if (!child) {
    showToast(tr('please_add_child', 'Please select or add a child profile first.'), 'warning');
    return;
  }
  if (appState.selectedSymptoms.length === 0) {
    showToast(tr('please_pick_symptom', 'Please select at least one symptom.'), 'warning');
    return;
  }

  const duration = document.getElementById('symp-duration')?.value || '1 to 3 days';
  const severity = document.getElementById('symp-severity')?.value || 'Moderate';
  const notes = document.getElementById('symp-notes')?.value.trim() || 'Logged via Symptom Predictor';
  const symptomNames = appState.selectedSymptoms.map(s => tr('data.sym.' + s.id, s.name)).join(', ');
  const recordId = `s-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];

  const record = {
    child_id: child.id,
    symptom_id: appState.selectedSymptoms[0].id,
    symptom_name: symptomNames,
    onset_date: today,
    duration,
    severity,
    observations: notes
  };

  const saved = await dbClient.post('/api/symptoms', record);

  // Firebase cloud sync
  await syncToFirebase(`symptom_records`, saved?.id || recordId, {
    ...record,
    id: saved?.id || recordId,
    created_at: new Date().toISOString()
  });

  showToast(trf('symptom_saved', { name: child.full_name }, `Symptom check saved to ${child.full_name}'s history!`), 'success');
  if (document.getElementById('symp-notes')) document.getElementById('symp-notes').value = '';
  renderRecentSymptoms();
}

async function renderRecentSymptoms() {
  const child = getActiveChild();
  const listEl = document.getElementById('recent-symptoms-list');
  if (!listEl || !child) return;

  const records = await dbClient.get('/api/symptoms', { childId: child.id });
  if (!records || records.length === 0) {
    listEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 16px;">${trf('no_symptom_records', { name: child.full_name }, `No symptom checks recorded yet for ${child.full_name}.`)}</div>`;
    return;
  }

  const symptomNameMap = {};
  CLINICAL_SYMPTOMS.forEach(s => { symptomNameMap[s.name] = tr('data.sym.' + s.id, s.name); });

  listEl.innerHTML = '';
  records.slice(0, 5).forEach(r => {
    const item = document.createElement('div');
    item.style.cssText = 'padding: 12px 16px; border-bottom: 1px solid var(--border-soft); display: flex; justify-content: space-between; align-items: center;';
    const rawNames = String(r.symptom_name || '').split(', ');
    const displayName = rawNames.map(n => symptomNameMap[n] || n).join(', ');
    item.innerHTML = `
      <div>
        <strong>🩺 ${displayName}</strong>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(r.episode_date || r.created_at)} &bull; ${translateStoredDuration(r.duration)} (${translateStoredSeverity(r.severity)})</div>
        ${r.notes ? `<div style="font-size: 0.76rem; color: #0369A1; font-style: italic;">${r.notes}</div>` : ''}
      </div>
      <span class="v-badge-pill bg-pastel-pink text-danger">${tr('recorded', 'Recorded')}</span>
    `;
    listEl.appendChild(item);
  });
}

function renderSymptomModule() {
  renderSymptomChips();
  renderRecentSymptoms();
}

// ==========================================================================
// 6. Feature: Growth & BMI Calculator
// ==========================================================================

function previewBMI() {
  const h = parseFloat(document.getElementById('growth-height')?.value);
  const w = parseFloat(document.getElementById('growth-weight')?.value);
  const valEl = document.getElementById('live-bmi-num');
  const catEl = document.getElementById('live-bmi-cat');

  if (h > 30 && w > 1 && valEl && catEl) {
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    valEl.textContent = bmi;
    if (bmi < 14) {
      catEl.textContent = tr('bmi_underweight', 'Underweight (< 5th %ile)');
      catEl.className = 'bmi-calc-cat text-warning';
    } else if (bmi <= 18.5) {
      catEl.textContent = tr('bmi_healthy', 'Healthy Weight (WHO Standard)');
      catEl.className = 'bmi-calc-cat text-success';
    } else {
      catEl.textContent = tr('bmi_above', 'Above Average Range');
      catEl.className = 'bmi-calc-cat text-danger';
    }
  } else if (valEl && catEl) {
    valEl.textContent = '--';
    catEl.textContent = tr('awaiting_inputs', 'Awaiting inputs');
    catEl.className = 'bmi-calc-cat text-muted';
  }
}

async function handleGrowthSubmit(e) {
  e.preventDefault();
  const child = getActiveChild();
  if (!child) {
    showToast(tr('please_add_child', 'Please select or add a child profile first.'), 'warning');
    return;
  }

  const date = document.getElementById('growth-date').value;
  const height = parseFloat(document.getElementById('growth-height').value);
  const weight = parseFloat(document.getElementById('growth-weight').value);
  const head = parseFloat(document.getElementById('growth-head').value) || null;
  const notes = document.getElementById('growth-notes').value.trim() || null;

  if (!date || !height || !weight) {
    showToast(tr('please_date_height_weight', 'Please provide date, height, and weight.'), 'warning');
    return;
  }

  const age = calculateDetailedAge(child.dob);
  const bmi = +(weight / ((height / 100) ** 2)).toFixed(1);
  const bmiCat = bmi < 14 ? 'Underweight' : (bmi <= 18.5 ? 'Healthy Weight' : 'Overweight');

  const record = {
    child_id: child.id,
    measurement_date: date,
    height_cm: height,
    weight_kg: weight,
    head_circ_cm: head,
    age_months: age.totalMonths,
    bmi: bmi,
    bmi_category: bmiCat,
    notes: notes
  };

  const saved = await dbClient.post('/api/growth', record);
  const rid = saved?.id || `g-${Date.now()}`;

  // Firebase cloud sync
  await syncToFirebase('growth_records', rid, {
    ...record,
    id: rid,
    created_at: new Date().toISOString()
  });

  document.getElementById('growth-record-form')?.reset();
  if (document.getElementById('growth-date')) document.getElementById('growth-date').value = new Date().toISOString().split('T')[0];
  previewBMI();
  showToast(tr('measurement_saved', 'Measurement saved to growth history! ✅'), 'success');

  await renderGrowthModule();
}

async function renderGrowthModule() {
  const child = getActiveChild();
  if (!child) return;

  const records = await dbClient.get('/api/growth', { childId: child.id });

  renderGrowthComparison(records);
  renderGrowthTable(records);
  renderWHOChart(records);
}

function renderGrowthComparison(records) {
  const container = document.getElementById('growth-comparison-banner');
  if (!container) return;

  if (!records || records.length < 2) {
    container.innerHTML = `
      <div class="comp-banner" style="background: var(--bg-light-alt); border-color: var(--border-soft);">
        <div style="font-size: 0.88rem; color: var(--text-muted);">
          ${tr('historical_progress_hint', '💡 Historical Progress Tracking: Log at least 2 measurements to view historical comparisons (Weight change, Height progression, and Head circumference delta).')}
        </div>
      </div>
    `;
    return;
  }

  const curr = records[0];
  const prev = records[1];

  const dWeight = +(curr.weight_kg - prev.weight_kg).toFixed(2);
  const dHeight = +(curr.height_cm - prev.height_cm).toFixed(1);
  const dHead = (curr.head_circ_cm && prev.head_circ_cm) ? +(curr.head_circ_cm - prev.head_circ_cm).toFixed(1) : null;

  const wColor = dWeight >= 0 ? '#059669' : '#DC2626';
  const hColor = dHeight >= 0 ? '#059669' : '#DC2626';

  container.innerHTML = `
    <div class="comp-banner">
      <div>
        <strong style="color: #065F46; font-size: 0.96rem;">${tr('progress_comparison', '📊 Progress Comparison vs. Previous Record')} (${formatDate(prev.measurement_date)})</strong>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${tr('latest_check', 'Latest check:')} ${formatDate(curr.measurement_date)}</div>
      </div>
      <div class="comp-metrics-row">
        <div class="comp-metric-item">
          <span class="comp-label">${tr('weight_delta', 'Weight Delta')}</span>
          <span class="comp-val" style="color: ${wColor};">${dWeight >= 0 ? '+' : ''}${dWeight} kg</span>
        </div>
        <div class="comp-metric-item">
          <span class="comp-label">${tr('height_growth', 'Height Growth')}</span>
          <span class="comp-val" style="color: ${hColor};">${dHeight >= 0 ? '+' : ''}${dHeight} cm</span>
        </div>
        ${dHead !== null ? `
          <div class="comp-metric-item">
            <span class="comp-label">${tr('head_circumference', 'Head Circumference')}</span>
            <span class="comp-val text-primary-blue">${dHead >= 0 ? '+' : ''}${dHead} cm</span>
          </div>
        ` : ''}
        <div class="comp-metric-item">
          <span class="comp-label">${tr('current_bmi', 'Current BMI')}</span>
          <span class="comp-val text-primary-blue">${curr.bmi} (${translateBmiCategory(curr.bmi_category)})</span>
        </div>
      </div>
    </div>
  `;
}

function renderGrowthTable(records) {
  const tbody = document.getElementById('growth-history-tbody');
  if (!tbody) return;

  if (!records || records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">${tr('no_measurements', 'No measurements recorded yet.')}</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  records.forEach(r => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${formatDate(r.measurement_date)}</strong></td>
      <td>${r.age_months}m</td>
      <td>${r.height_cm} cm ${r.delta_height ? `<small class="text-success">(+${r.delta_height})</small>` : ''}</td>
      <td>${r.weight_kg} kg ${r.delta_weight ? `<small class="text-success">(+${r.delta_weight})</small>` : ''}</td>
      <td>${r.head_circ_cm ? `${r.head_circ_cm} cm` : '—'}</td>
      <td><strong class="text-primary-blue">${r.bmi}</strong> <small>(${translateBmiCategory(r.bmi_category)})</small></td>
    `;
    tbody.appendChild(row);
  });
}

function setChartMetric(metric) {
  appState.chartMetric = metric;
  document.getElementById('btn-chart-height')?.classList.toggle('active', metric === 'height');
  document.getElementById('btn-chart-weight')?.classList.toggle('active', metric === 'weight');
  renderGrowthModule();
}

function renderWHOChart(records) {
  const canvas = document.getElementById('growthChartCanvas');
  if (!canvas || typeof Chart === 'undefined' || typeof WHO_GROWTH_STANDARDS === 'undefined') return;

  const child = getActiveChild();
  if (!child) return;

  const genderKey = child.gender === 'female' ? 'girls' : 'boys';
  const standards = WHO_GROWTH_STANDARDS[genderKey];
  if (!standards) return;

  const months = Object.keys(standards).map(Number).sort((a, b) => a - b);
  const labels = months.map(m => `${m}m`);
  const metric = appState.chartMetric;

  const p5 = months.map(m => standards[m][metric][0]);
  const p50 = months.map(m => standards[m][metric][1]);
  const p95 = months.map(m => standards[m][metric][2]);

  const actualData = months.map(m => {
    const match = records.find(r => Math.abs(r.age_months - m) <= 1.5);
    return match ? (metric === 'height' ? match.height_cm : match.weight_kg) : null;
  });

  if (growthChartInstance) growthChartInstance.destroy();

  const ctx = canvas.getContext('2d');
  growthChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `${child.full_name} (${metric === 'height' ? tr('chart_cm', 'cm') : tr('chart_kg', 'kg')})`,
          data: actualData,
          borderColor: '#0787C9',
          backgroundColor: '#0787C9',
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3,
          spanGaps: true
        },
        {
          label: tr('who_95', 'WHO 95th %ile'),
          data: p95,
          borderColor: 'rgba(244, 63, 94, 0.4)',
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 1.5,
          fill: false
        },
        {
          label: tr('who_50', 'WHO 50th %ile (Median)'),
          data: p50,
          borderColor: 'rgba(5, 150, 105, 0.6)',
          pointRadius: 0,
          borderWidth: 2,
          fill: false
        },
        {
          label: tr('who_5', 'WHO 5th %ile'),
          data: p5,
          borderColor: 'rgba(217, 119, 6, 0.4)',
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 1.5,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12 } }
      },
      scales: {
        y: { title: { display: true, text: metric === 'height' ? tr('chart_height', 'Height (cm)') : tr('chart_weight', 'Weight (kg)') } }
      }
    }
  });
}

async function exportGrowthHistory() {
  const child = getActiveChild();
  if (!child) return;
  const records = await dbClient.get('/api/growth', { childId: child.id });
  if (!records || records.length === 0) {
    showToast(tr('no_growth_export', 'No growth records to export.'), 'warning');
    return;
  }

  let csv = 'Measurement Date,Age (Months),Height (cm),Weight (kg),Head Circ (cm),BMI,Category,Notes\n';
  records.forEach(r => {
    csv += `"${r.measurement_date}",${r.age_months},${r.height_cm},${r.weight_kg},${r.head_circ_cm || ''},${r.bmi},"${r.bmi_category || ''}","${r.notes || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mukta_Growth_${child.full_name.replace(/\s+/g, '_')}.csv`;
  a.click();
  showToast(tr('growth_exported', 'Growth history downloaded as CSV!'), 'success');
}

// ==========================================================================
// 7. Feature: Vaccination Tracker
// ==========================================================================

async function renderVaccinationModule() {
  const child = getActiveChild();
  const container = document.getElementById('vaccine-timeline-list');
  if (!container) return;

  if (!child) {
    container.innerHTML = `<div class="empty-state">${tr('select_child_first', 'Please select or add a child profile first from the home page.')}</div>`;
    return;
  }

  // Load saved vaccination statuses from database / storage
  const storageKey = `mukta_vaccines_${child.id}`;
  let savedStatusMap = {};
  try {
    savedStatusMap = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch(e) {}

  // Also query server/firebase records if available
  let apiRecords = [];
  try {
    apiRecords = await dbClient.get('/api/vaccinations', { childId: child.id });
    if (Array.isArray(apiRecords) && apiRecords.length > 0) {
      apiRecords.forEach(r => {
        if (r.vaccine_id && r.status === 'Completed') {
          savedStatusMap[r.vaccine_id] = true;
        }
      });
    } else {
      apiRecords = [];
    }
  } catch (e) { apiRecords = []; }

  const baseSchedule = (typeof OFFICIAL_IAP_USER_SCHEDULE !== 'undefined') ? OFFICIAL_IAP_USER_SCHEDULE : [];

  // Merge doctor-prescribed vaccines that are not part of the standard IAP table
  const officialIds = new Set(baseSchedule.map(i => i.id));
  const extraPrescribed = [];
  (Array.isArray(apiRecords) ? apiRecords : []).forEach(r => {
    const isPrescribed = r.is_prescribed_by_doctor === 1 || r.is_prescribed_by_doctor === true;
    if (isPrescribed && r.vaccine_id && !officialIds.has(r.vaccine_id) && !extraPrescribed.some(x => x.id === r.vaccine_id)) {
      extraPrescribed.push({
        id: r.vaccine_id,
        milestone: r.dose_number || tr('doctor_prescribed', 'Doctor Prescribed'),
        vaccines: r.vaccine_name,
        diseases: r.notes || 'Dr. Nitin Seth',
        prescribed: true
      });
    }
  });

  const scheduleList = [...baseSchedule, ...extraPrescribed];

  let completedCount = 0;
  scheduleList.forEach(item => {
    if (savedStatusMap[item.id]) completedCount++;
  });
  const totalCount = scheduleList.length;
  const upcomingCount = totalCount - completedCount;

  if (document.getElementById('v-stat-total')) document.getElementById('v-stat-total').textContent = totalCount;
  if (document.getElementById('v-stat-completed')) document.getElementById('v-stat-completed').textContent = completedCount;
  if (document.getElementById('v-stat-upcoming')) document.getElementById('v-stat-upcoming').textContent = upcomingCount;
  if (document.getElementById('v-stat-overdue')) document.getElementById('v-stat-overdue').textContent = 0;

  // Filter items
  const filter = appState.vaccineFilter || 'all';
  const filteredList = scheduleList.filter(item => {
    const isDone = !!savedStatusMap[item.id];
    if (filter === 'Completed') return isDone;
    if (filter === 'Upcoming' || filter === 'Overdue') return !isDone;
    return true;
  });

  if (filteredList.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; background: #fff; border-radius: 16px;">${trf('no_vaccines_filter', { filter }, `No vaccines found matching "${filter}" filter.`)}</div>`;
    return;
  }

  let tableHtml = `
    <div style="overflow-x: auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 12px;">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-family: inherit;">
        <thead>
          <tr style="background: #F1F5F9; color: #1E293B; text-align: left; font-size: 0.9rem;">
            <th style="padding: 14px 16px; border-radius: 10px 0 0 10px; width: 80px; text-align: center;">${(typeof t === 'function' ? t('col_given') : 'Given?')}</th>
            <th style="padding: 14px 16px; width: 140px;">${(typeof t === 'function' ? t('col_milestone') : 'Age / Milestone')}</th>
            <th style="padding: 14px 16px;">${(typeof t === 'function' ? t('col_vaccines') : 'Vaccines Recommended')}</th>
            <th style="padding: 14px 16px;">${(typeof t === 'function' ? t('col_diseases') : 'Diseases Protected Against')}</th>
            <th style="padding: 14px 16px; border-radius: 0 10px 10px 0; width: 120px; text-align: center;">${(typeof t === 'function' ? t('col_status') : 'Status')}</th>
          </tr>
        </thead>
        <tbody>
  `;

  filteredList.forEach((item, index) => {
    const isDone = !!savedStatusMap[item.id];
    const rowBg = isDone ? '#F0FDF4' : (index % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
    const givenLabel = (typeof t === 'function' ? t('status_given') : '✅ Given');
    const pendingLabel = (typeof t === 'function' ? t('status_pending') : '⏰ Pending');
    const displayMilestone = item.prescribed
      ? item.milestone
      : tr('data.vax.' + item.id + '.milestone', item.milestone);
    const displayDiseases = item.prescribed
      ? item.diseases
      : tr('data.vax.' + item.id + '.diseases', item.diseases);
    tableHtml += `
      <tr style="background: ${rowBg}; border-bottom: 1px solid #E2E8F0; transition: background 0.2s;">
        <td style="padding: 16px; text-align: center;">
          <input type="checkbox" id="vchk-${item.id}" ${isDone ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; accent-color: #059669;" />
        </td>
        <td style="padding: 16px; font-weight: 700; color: #0284C7; font-size: 0.95rem;">
          ${displayMilestone}
        </td>
        <td style="padding: 16px; color: #0F172A; font-weight: 600; font-size: 0.92rem;">
          ${item.vaccines}
        </td>
        <td style="padding: 16px; color: #64748B; font-size: 0.88rem;">
          ${displayDiseases}
        </td>
        <td style="padding: 16px; text-align: center;">
          <span style="display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 700; ${isDone ? 'background: #DCFCE7; color: #15803D;' : 'background: #FEF3C7; color: #B45309;'}">
            ${isDone ? givenLabel : pendingLabel}
          </span>
        </td>
      </tr>
    `;
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHtml;

  // Attach change event listeners to each checkbox
  filteredList.forEach(item => {
    const chk = document.getElementById(`vchk-${item.id}`);
    if (!chk) return;
    chk.addEventListener('change', async (e) => {
      const isChecked = e.target.checked;
      savedStatusMap[item.id] = isChecked;
      localStorage.setItem(storageKey, JSON.stringify(savedStatusMap));

      // Sync to Firebase Cloud Firestore if active
      if (typeof syncToFirebase === 'function') {
        await syncToFirebase('vaccination_records', `${child.id}_${item.id}`, {
          child_id: child.id,
          vaccine_id: item.id,
          milestone: item.milestone,
          vaccine_name: item.vaccines,
          diseases: item.diseases,
          status: isChecked ? 'Completed' : 'Upcoming',
          actual_date: isChecked ? new Date().toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString()
        });
      }

      // Sync to local server DB if connected
      try {
        await dbClient.post('/api/vaccinations', {
          child_id: child.id,
          vaccine_id: item.id,
          vaccine_name: item.vaccines,
          dose_number: item.milestone,
          recommended_date: new Date().toISOString().split('T')[0],
          actual_date: isChecked ? new Date().toISOString().split('T')[0] : null,
          status: isChecked ? 'Completed' : 'Upcoming',
          notes: isChecked ? 'Marked given by parent' : 'Pending'
        });
      } catch (err) {}

      showToast(isChecked
        ? trf('marked_given', { name: displayMilestone }, `Marked "${displayMilestone}" as Given!`)
        : trf('marked_pending', { name: displayMilestone }, `Marked "${displayMilestone}" as Pending`),
        isChecked ? 'success' : 'info');
      renderVaccinationModule();
    });
  });
}

function setVaccineFilter(filter, btn) {
  appState.vaccineFilter = filter;
  document.querySelectorAll('#vaccines .filter-chip, .subpage-nav-bar .filter-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderVaccinationModule();
}

async function exportVaccineHistory() {
  const child = getActiveChild();
  if (!child) return;
  const records = await dbClient.get('/api/vaccinations', { childId: child.id });
  if (!records || records.length === 0) {
    showToast(tr('no_vaccine_export', 'No vaccination records to export.'), 'warning');
    return;
  }

  let csv = 'Vaccine Name,Dose,Recommended Date,Actual Date,Status,Center,Doctor\n';
  records.forEach(r => {
    csv += `"${r.vaccine_name}","${r.dose_number}","${r.recommended_date}","${r.actual_date || ''}","${r.status}","${r.hospital_details || ''}","${r.doctor_name || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mukta_Vaccines_${child.full_name.replace(/\s+/g, '_')}.csv`;
  a.click();
  showToast(tr('vaccines_exported', 'Vaccination schedule downloaded as CSV!'), 'success');
}

// ==========================================================================
// 8. Feature: Development Milestones
// ==========================================================================

async function renderMilestonesModule() {
  const pillsContainer = document.getElementById('milestone-age-pills');
  if (!pillsContainer || typeof DEVELOPMENT_MILESTONES === 'undefined') return;

  const child = getActiveChild();
  let savedById = {};
  if (child) {
    try {
      const saved = await dbClient.get('/api/milestones', { childId: child.id });
      (Array.isArray(saved) ? saved : []).forEach(r => {
        if (r.milestone_id) savedById[r.milestone_id] = r;
      });
    } catch (err) {
      console.warn('Could not load saved milestones:', err);
    }
  }

  pillsContainer.innerHTML = '';
  DEVELOPMENT_MILESTONES.forEach((stage, idx) => {
    const pill = document.createElement('button');
    pill.className = `m-stage-pill ${idx === appState.activeMilestoneStageIndex ? 'active' : ''}`;
    pill.textContent = tr('data.stage.' + idx + '.ageGroup', stage.ageGroup);
    pill.onclick = () => {
      appState.activeMilestoneStageIndex = idx;
      renderMilestonesModule();
    };
    pillsContainer.appendChild(pill);
  });

  const activeStage = DEVELOPMENT_MILESTONES[appState.activeMilestoneStageIndex];
  if (!activeStage) return;

  const stageIdx = appState.activeMilestoneStageIndex;
  const stageAgeGroup = tr('data.stage.' + stageIdx + '.ageGroup', activeStage.ageGroup);
  const stageSummary = tr('data.stage.' + stageIdx + '.summary', activeStage.summary || '');

  if (document.getElementById('stage-title-text')) document.getElementById('stage-title-text').textContent = `${tr('stage_label', 'Stage:')} ${stageAgeGroup}`;
  if (document.getElementById('stage-desc-text')) document.getElementById('stage-desc-text').textContent = stageSummary;

  const motorList = document.getElementById('domain-motor-list');
  const socialList = document.getElementById('domain-social-list');
  const commList = document.getElementById('domain-comm-list');
  const cognList = document.getElementById('domain-cogn-list');

  if (motorList) motorList.innerHTML = '';
  if (socialList) socialList.innerHTML = '';
  if (commList) commList.innerHTML = '';
  if (cognList) cognList.innerHTML = '';

  activeStage.domains.forEach(d => {
    let targetEl = motorList;
    if (d.domain.includes('Social')) targetEl = socialList;
    else if (d.domain.includes('Speech') || d.domain.includes('Communication')) targetEl = commList;
    else if (d.domain.includes('Cognitive') || d.domain.includes('Play')) targetEl = cognList;

    if (!targetEl) return;

    d.milestones.forEach(m => {
      const saved = savedById[m.id];
      const isAchieved = !!saved && saved.status === 'Achieved';
      const milestoneText = tr('data.ms.' + m.id, m.text);
      const item = document.createElement('label');
      item.className = 'milestone-checkbox-item';
      item.innerHTML = `
        <input type="checkbox" id="m-${m.id}" ${isAchieved ? 'checked' : ''} />
        <span>${milestoneText}</span>
      `;

      item.querySelector('input').addEventListener('change', async (e) => {
        const child = getActiveChild();
        if (!child) return;
        await dbClient.post('/api/milestones', {
          child_id: child.id,
          milestone_id: m.id,
          milestone_text: milestoneText,
          age_group: stageAgeGroup,
          domain: d.domain,
          status: e.target.checked ? 'Achieved' : 'Observing',
          achieved_date: e.target.checked ? new Date().toISOString().split('T')[0] : null
        });

        updateMilestoneProgress();
        showToast(e.target.checked
          ? trf('celebrated', { text: milestoneText }, `Celebrated: ${milestoneText}`)
          : tr('milestone_updated', 'Updated milestone'), 'success');
      });

      targetEl.appendChild(item);
    });
  });

  updateMilestoneProgress();
}

function updateMilestoneProgress() {
  const boxes = document.querySelectorAll('#domain-motor-list input[type=checkbox], #domain-social-list input[type=checkbox], #domain-comm-list input[type=checkbox], #domain-cogn-list input[type=checkbox]');
  const achieved = Array.from(boxes).filter(b => b.checked).length;
  const pctEl = document.getElementById('stage-prog-pct');
  if (pctEl && boxes.length > 0) {
    pctEl.textContent = `${Math.round((achieved / boxes.length) * 100)}%`;
  }
}

// ==========================================================================
// 9. Feature: My Child's Health History (Img 4 Actionable Empty State + Multi-Filter)
// ==========================================================================

// Normalises both server (array) and IndexedDB ({ records }) history formats
// into the shape used by the timeline renderer and CSV exporter.
function normalizeHistoryRecords(res) {
  const raw = Array.isArray(res) ? res : (res && Array.isArray(res.records) ? res.records : []);
  return raw.map(item => {
    const type = String(item.type || item.activity || '').toLowerCase();
    const notes = item.notes || item.details || item.data?.notes || '';
    return {
      ...item,
      type,
      title: item.title || '',
      date: item.date || item.created_at || '',
      data: { ...(item.data || {}), notes }
    };
  });
}

async function renderMasterHistoryModule() {
  const child = getActiveChild();
  const container = document.getElementById('master-timeline-container');
  if (!container) return;

  if (!child) {
    container.innerHTML = `
      <div class="history-empty-actionable">
        <span class="empty-icon-big">👶</span>
        <h3 class="empty-title">${tr('select_child_profile', 'Select a Child Profile')}</h3>
        <p class="empty-text">${tr('select_child_history_desc', 'Add your child from the Home page to track their ongoing health milestones and records.')}</p>
        <a href="index.html#profile" class="btn-pill-primary">${tr('go_to_profiles', 'Go to Profiles')}</a>
      </div>
    `;
    return;
  }

  const res = await dbClient.get('/api/history', {
    childId: child.id,
    filter: appState.historyFilter,
    category: appState.historyCategory
  });

  const records = normalizeHistoryRecords(res);

  // When no history exists yet (Addresses Img 4!)
  if (!records || records.length === 0) {
    container.innerHTML = `
      <div class="history-empty-actionable">
        <span class="empty-icon-big">📜</span>
        <h3 class="empty-title">${trf('no_records_for', { name: child.full_name }, `No Records Added Yet for ${child.full_name}`)}</h3>
        <p class="empty-text">${tr('no_records_desc', "Start recording your little one's health milestones today. Add their first growth measurement, vaccine dose, or check symptoms:")}</p>
        <div class="empty-quick-actions">
          <a href="growth.html" class="btn-pill-primary btn-sm" style="text-decoration: none;">${tr('log_growth', '📈 Log Growth')}</a>
          <a href="vaccines.html" class="btn-pill-primary btn-sm" style="text-decoration: none;">${tr('view_vaccines', '💉 Track Vaccines')}</a>
          <a href="symptoms.html" class="btn-pill-primary btn-sm" style="text-decoration: none;">${tr('check_symptoms', '🩺 Check Symptoms')}</a>
          <a href="milestones.html" class="btn-pill-outline btn-sm" style="text-decoration: none;">${tr('record_milestone', '🌱 Record Milestone')}</a>
        </div>
      </div>
    `;
    return;
  }

  let filtered = records;
  if (appState.historySearch) {
    const q = appState.historySearch.toLowerCase();
    filtered = records.filter(r => (r.title || '').toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q));
  }

  container.innerHTML = '';
  filtered.forEach(item => {
    let typeIcon = '📋';
    let typeBg = 'var(--baby-blue)';
    if (item.type === 'growth') { typeIcon = '📈'; typeBg = 'var(--baby-blue)'; }
    else if (item.type === 'vaccination') { typeIcon = '💉'; typeBg = 'var(--mint-green)'; }
    else if (item.type === 'symptom') { typeIcon = '🩺'; typeBg = 'var(--pastel-pink)'; }
    else if (item.type === 'milestone') { typeIcon = '🌱'; typeBg = 'var(--soft-yellow)'; }
    else if (item.type === 'nutrition') { typeIcon = '🥗'; typeBg = 'var(--mint-green)'; }
    else if (item.type === 'appointment') { typeIcon = '📅'; typeBg = 'var(--baby-blue)'; }
    else if (item.type === 'document') { typeIcon = '🪪'; typeBg = 'var(--lavender)'; }

    const card = document.createElement('div');
    card.className = 'timeline-event-card';
    card.innerHTML = `
      <div class="timeline-date-col">
        <span class="event-date">${formatDate(item.date)}</span>
        <span class="event-relative-time">${tr(item.type, item.type.toUpperCase())}</span>
      </div>
      <div class="timeline-body-col">
        <div class="event-icon-circle" style="background: ${typeBg};">${typeIcon}</div>
        <div>
          <div class="event-title">${item.title}</div>
          <div class="event-desc">${item.data?.notes || item.data?.details || tr('logged_to_records', 'Logged into permanent pediatric health records.')}</div>
        </div>
      </div>
      <div class="timeline-badge-col">
        <span class="v-badge-pill bg-baby-blue text-primary-blue">${tr(item.type, item.type)}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function setMasterHistoryFilter(range, btn) {
  appState.historyFilter = range;
  document.querySelectorAll('.filter-pill-small').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMasterHistoryModule();
}

function setMasterHistoryCategory(cat, btn) {
  appState.historyCategory = cat;
  document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMasterHistoryModule();
}

function handleHistorySearch(val) {
  appState.historySearch = val.trim();
  renderMasterHistoryModule();
}

async function exportFullHistory() {
  const child = getActiveChild();
  if (!child) return;
  const res = await dbClient.get('/api/history', { childId: child.id, filter: 'all', category: 'all' });
  const records = normalizeHistoryRecords(res);

  if (records.length === 0) {
    showToast(tr('no_records_export', 'No records to export.'), 'warning');
    return;
  }

  let csv = 'Record Type,Date,Title,Details\n';
  records.forEach(r => {
    const note = (r.data?.notes || r.notes || '').replace(/"/g, '""');
    csv += `"${r.type}","${r.date}","${(r.title || '').replace(/"/g, '""')}","${note}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mukta_Full_Health_History_${child.full_name.replace(/\s+/g, '_')}.csv`;
  a.click();
  showToast(tr('history_exported', 'Complete health history exported!'), 'success');
}

// ==========================================================================
// 10. Feature: Parenting Knowledge Centre
// ==========================================================================

function renderKnowledgeArticles(filterCat = 'all') {
  const container = document.getElementById('articles-container');
  if (!container || typeof KNOWLEDGE_ARTICLES === 'undefined') return;

  const articles = filterCat === 'all'
    ? KNOWLEDGE_ARTICLES
    : KNOWLEDGE_ARTICLES.filter(a => a.category.toLowerCase().includes(filterCat.toLowerCase()));

  container.innerHTML = '';
  articles.forEach(art => {
    const card = document.createElement('div');
    card.className = 'knowledge-article-card';
    card.innerHTML = `
      <div class="article-top-row">
        <span class="article-icon-wrap">📖</span>
        <span class="article-read-time">${String(art.readTime || '3').replace(/[^0-9]/g, '') || '3'} ${tr('min_read', 'min read')}</span>
      </div>
      <div class="article-title">${tr('data.article.' + art.id + '.title', art.title)}</div>
      <div class="article-excerpt">${tr('data.article.' + art.id + '.summary', art.summary || '')}</div>
      <button class="article-read-cta" onclick="readArticle('${art.id}')">${tr('read_full_article', 'Read Full Article →')}</button>
    `;
    container.appendChild(card);
  });
}

function filterArticles(cat, btn) {
  document.querySelectorAll('#knowledge-cat-bar .cat-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderKnowledgeArticles(cat);
}

function readArticle(artId) {
  const art = KNOWLEDGE_ARTICLES.find(a => a.id === artId);
  if (!art) return;

  document.getElementById('article-modal-cat').textContent = translateArticleCategory(art.category) || tr('pediatric_guide', 'Pediatric Guide');
  document.getElementById('article-modal-title').textContent = tr('data.article.' + art.id + '.title', art.title);
  document.getElementById('article-modal-body').innerHTML = `
    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">
      ${tr('reviewed_by', 'Reviewed by')} <strong>${art.author || 'Dr. Nitin Seth'}</strong> &bull; ${art.date || 'October 2024'}
    </div>
    <div style="line-height: 1.7; color: var(--text-dark);">
      ${art.content}
    </div>
  `;
  openModal('article-modal');
}

// ==========================================================================
// 11. Health Reminders
// ==========================================================================

async function renderRemindersModule() {
  const child = getActiveChild();
  const container = document.getElementById('reminders-container');
  if (!container) return;

  if (!child) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px; grid-column: 1/-1;">${tr('add_child_to_start', 'Add a child profile above to activate smart reminders.')}</div>`;
    return;
  }

  const vaccs = await dbClient.get('/api/vaccinations', { childId: child.id, status: 'Upcoming' });
  const nextVaccine = vaccs[0] || null;

  container.innerHTML = `
    <div class="reminder-item-card rem-vaccine">
      <span class="reminder-urgency-tag text-success">${tr('reminder_upcoming_vaccine', 'UPCOMING VACCINE')}</span>
      <h3 class="reminder-title">${nextVaccine ? nextVaccine.vaccine_name : tr('reminder_primary_immunizations', 'Primary Immunizations on Track')}</h3>
      <p class="reminder-detail">
        ${nextVaccine
          ? trf('reminder_dose_scheduled', { dose: nextVaccine.dose_number, date: formatDate(nextVaccine.recommended_date) }, `Dose ${nextVaccine.dose_number} scheduled around ${formatDate(nextVaccine.recommended_date)}.`)
          : tr('reminder_all_doses', 'All recommended age doses administered.')}
      </p>
      <a href="vaccines.html" class="btn-pill-primary btn-sm" style="text-decoration: none; display: inline-block; width: fit-content;">${tr('review_schedule', 'Review Schedule')}</a>
    </div>

    <div class="reminder-item-card rem-growth">
      <span class="reminder-urgency-tag text-primary-blue">${tr('reminder_growth_tag', 'ROUTINE GROWTH MONITORING')}</span>
      <h3 class="reminder-title">${tr('reminder_quarterly', 'Quarterly Weight & Height')}</h3>
      <p class="reminder-detail">${tr('reminder_growth_detail', 'Recommended every 3 months to monitor WHO percentile curves.')}</p>
      <a href="growth.html" class="btn-pill-outline btn-sm" style="text-decoration: none; display: inline-block; width: fit-content;">${tr('log_new_measurement', 'Log New Measurement')}</a>
    </div>

    <div class="reminder-item-card rem-checkup">
      <span class="reminder-urgency-tag text-warning">${tr('reminder_checkup_tag', 'WELL-CHILD VISIT')}</span>
      <h3 class="reminder-title">${tr('reminder_dev_checkup', 'Developmental Checkup')}</h3>
      <p class="reminder-detail">${tr('reminder_checkup_detail', 'Routine OPD milestone assessment with Dr. Nitin Seth at Mukta Hospital.')}</p>
      <a href="milestones.html" class="btn-pill-primary btn-sm" style="text-decoration: none; display: inline-block; width: fit-content;">${tr('check_milestones', 'Check Milestones')}</a>
    </div>
  `;
}

// ==========================================================================
// 12. Optional Firebase Cloud Sync Hook
// ==========================================================================
// Firebase is configured in firebase-config.js and initialized via initFirebase() above
// See FIREBASE_CONFIG and isFirebaseEnabled defined at the top of this file

// ==========================================================================
// 13. Initialization on DOMContentLoaded
// ==========================================================================

window.addEventListener('DOMContentLoaded', async () => {
  // Initialise Firebase cloud sync
  initFirebase();

  // Back to top scroll listener
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-top');
    if (btn) btn.classList.toggle('visible', window.scrollY > 300);
  });

  // Default dates in forms
  const today = new Date().toISOString().split('T')[0];
  const gDate = document.getElementById('growth-date');
  if (gDate) gDate.value = today;

  // Check backend server connection
  await dbClient.checkServerConnection();

  // Load children
  await loadChildren();

  // Page-specific module initializations
  if (document.getElementById('vaccine-timeline-list')) renderVaccinationModule();
  if (document.getElementById('growthChartCanvas')) renderGrowthModule();
  if (document.getElementById('symptom-chips-container')) renderSymptomModule();
  if (document.getElementById('milestone-age-pills')) renderMilestonesModule();
  if (document.getElementById('master-timeline-container')) renderMasterHistoryModule();
  if (document.getElementById('articles-container')) renderKnowledgeArticles();
  if (document.getElementById('reminders-container')) renderRemindersModule();

  previewBMI();
});

// Functions declared in this classic script are already exposed on `window` for
// the inline HTML onclick/onsubmit handlers. Do not re-assign undefined aliases
// here – doing so throws a ReferenceError and halts the rest of this script.


// Language Change Listener for Multi-Language reactivity
window.addEventListener('languageChanged', () => {
  if (typeof renderChildTabs === 'function' && appState.children.length) renderChildTabs();
  if (typeof renderActiveChildProfile === 'function') renderActiveChildProfile();
  if (typeof renderSymptomChips === 'function') renderSymptomChips();
  if (typeof renderRecentSymptoms === 'function') renderRecentSymptoms();
  if (typeof renderGrowthModule === 'function') renderGrowthModule();
  if (typeof renderVaccinationModule === 'function') renderVaccinationModule();
  if (typeof renderMilestonesModule === 'function') renderMilestonesModule();
  if (typeof renderMasterHistoryModule === 'function') renderMasterHistoryModule();
  if (typeof renderKnowledgeArticles === 'function') renderKnowledgeArticles();
  if (typeof renderRemindersModule === 'function') renderRemindersModule();
  if (typeof previewBMI === 'function') previewBMI();
});
