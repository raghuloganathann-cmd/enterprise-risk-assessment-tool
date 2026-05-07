// =============================================
//  ENTERPRISE RISK ASSESSMENT TOOL — APP
// =============================================

'use strict';

// ── State ──
let currentPage   = 'dashboard';
let sortKey       = 'score';
let sortAsc       = false;
let currentPageNum = 1;
const PER_PAGE    = 8;
let searchQuery   = '';
let selectedCell  = null;

// Chart instances
let charts = {};

// ── Helpers ──
function score(r)    { return r.likelihood * r.impact; }
function severity(r) {
  const s = score(r);
  if (s >= 20) return 'Critical';
  if (s >= 12) return 'High';
  if (s >= 6)  return 'Medium';
  return 'Low';
}
function sevClass(sev) { return sev.toLowerCase(); }
function statusClass(st) { return st.toLowerCase().replace(/\s+/g, '-'); }

function badgeHtml(text, cls) {
  return `<span class="badge badge-${cls}">${text}</span>`;
}

function scoreChipHtml(r) {
  const sev = severity(r);
  return `<span class="score-chip ${sevClass(sev)}">${score(r)}</span>`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Navigation ──
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });

  const labels = {
    dashboard: 'Dashboard', register: 'Risk Register',
    matrix: 'Heat Map', analytics: 'Analytics', controls: 'Controls'
  };
  document.getElementById('breadcrumb').textContent = labels[page] || page;
  currentPage = page;

  if (page === 'dashboard')  renderDashboard();
  if (page === 'register')   renderRegister();
  if (page === 'matrix')     renderMatrix();
  if (page === 'analytics')  renderAnalytics();
  if (page === 'controls')   renderControls();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      switchPage(item.dataset.page);
    });
  });
  renderDashboard();
});

// ── Sidebar toggle (mobile) ──
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Search ──
function handleSearch(val) {
  searchQuery = val.trim().toLowerCase();
  if (currentPage === 'register') renderRegister();
}

// ── Filtered risks ──
function filteredRisks() {
  const fs   = document.getElementById('fSev')?.value  || '';
  const fst  = document.getElementById('fStat')?.value || '';
  const fcat = document.getElementById('fCat')?.value  || '';
  const fdpt = document.getElementById('fDept')?.value || '';

  return risks
    .filter(r =>
      (!fs   || severity(r) === fs) &&
      (!fst  || r.status === fst) &&
      (!fcat || r.category === fcat) &&
      (!fdpt || r.dept === fdpt) &&
      (!searchQuery ||
        r.title.toLowerCase().includes(searchQuery) ||
        r.category.toLowerCase().includes(searchQuery) ||
        r.owner.toLowerCase().includes(searchQuery) ||
        r.dept.toLowerCase().includes(searchQuery))
    )
    .sort((a, b) => {
      let av, bv;
      if (sortKey === 'score')  { av = score(a); bv = score(b); }
      else { av = (a[sortKey]||'').toString(); bv = (b[sortKey]||'').toString(); }
      if (av < bv) return sortAsc ? -1 :  1;
      if (av > bv) return sortAsc ?  1 : -1;
      return 0;
    });
}

function sortBy(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = false; }
  currentPageNum = 1;
  renderRegister();
}

// =============================================
//  DASHBOARD
// =============================================
function renderDashboard() {
  renderKPIs();
  renderRecentList();
  renderStatusBreakdown();
  renderSevDonut();
  renderCatBar();
}

function renderKPIs() {
  const total    = risks.length;
  const critical = risks.filter(r => severity(r) === 'Critical').length;
  const high     = risks.filter(r => severity(r) === 'High').length;
  const open     = risks.filter(r => r.status === 'Open').length;

  const kpis = [
    { label: 'Total Risks', value: total,    sub: 'Across all departments',  icon: 'fa-shield-halved',  color: '#638cff', bg: 'rgba(99,140,255,0.12)' },
    { label: 'Critical',    value: critical,  sub: 'Score ≥ 20',              icon: 'fa-circle-exclamation', color: '#f87171', bg: 'rgba(220,60,60,0.12)' },
    { label: 'High',        value: high,      sub: 'Score 12–19',             icon: 'fa-triangle-exclamation', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Open',        value: open,      sub: 'Require action',          icon: 'fa-door-open',       color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  ];

  document.getElementById('kpiGrid').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon" style="background:${k.bg}; color:${k.color};">
        <i class="fa-solid ${k.icon}"></i>
      </div>
      <div class="kpi-info">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-sub">${k.sub}</div>
      </div>
    </div>
  `).join('');
}

function renderRecentList() {
  const recent = [...risks].sort((a,b) => b.id - a.id).slice(0, 5);
  const colorMap = {
    Critical: { bg: 'var(--critical-bg)', color: 'var(--critical-text)' },
    High:     { bg: 'var(--high-bg)',     color: 'var(--high-text)' },
    Medium:   { bg: 'var(--medium-bg)',   color: 'var(--medium-text)' },
    Low:      { bg: 'var(--low-bg)',      color: 'var(--low-text)' },
  };

  document.getElementById('recentList').innerHTML = recent.map(r => {
    const sev = severity(r);
    const cm  = colorMap[sev];
    return `
      <div class="recent-item">
        <div class="recent-score" style="background:${cm.bg};color:${cm.color};">${score(r)}</div>
        <div class="recent-info">
          <div class="recent-title">${escHtml(r.title)}</div>
          <div class="recent-meta">${r.category} · ${r.dept}</div>
        </div>
        ${badgeHtml(r.status, statusClass(r.status))}
      </div>
    `;
  }).join('');
}

function renderStatusBreakdown() {
  const totals = {};
  STATUSES.forEach(s => totals[s] = 0);
  risks.forEach(r => totals[r.status]++);
  const max = Math.max(...Object.values(totals), 1);

  const colors = {
    'Open':       '#f87171',
    'Mitigating': '#fbbf24',
    'Monitoring': '#7aa2ff',
    'Resolved':   '#34d399'
  };

  document.getElementById('statusBreakdown').innerHTML = STATUSES.map(s => `
    <div class="status-item">
      <span style="font-size:13px;color:var(--text-secondary);min-width:80px;">${s}</span>
      <div class="status-bar-wrap">
        <div class="status-bar-bg">
          <div class="status-bar-fill" style="width:${(totals[s]/max*100).toFixed(0)}%;background:${colors[s]};"></div>
        </div>
      </div>
      <span style="font-size:13px;font-weight:600;font-family:'DM Mono',monospace;min-width:24px;text-align:right;color:var(--text-primary);">${totals[s]}</span>
    </div>
  `).join('');
}

function renderSevDonut() {
  const labels = ['Critical','High','Medium','Low'];
  const counts = labels.map(l => risks.filter(r => severity(r) === l).length);
  const colors = ['#f87171','#fbbf24','#34d399','#7aa2ff'];

  destroyChart('sevDonut');
  charts.sevDonut = new Chart(document.getElementById('sevDonut'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8891a8', font: { size: 12 }, padding: 14, boxWidth: 12 } }
      }
    }
  });
}

function renderCatBar() {
  const counts = CATEGORIES.map(c => risks.filter(r => r.category === c).length);
  const bgColors = ['#638cff','#f87171','#fbbf24','#34d399','#a78bfa','#fb923c','#38bdf8'];

  destroyChart('catBar');
  charts.catBar = new Chart(document.getElementById('catBar'), {
    type: 'bar',
    data: {
      labels: CATEGORIES.map(c => c.length > 10 ? c.slice(0,9)+'…' : c),
      datasets: [{
        label: 'Count',
        data: counts,
        backgroundColor: bgColors.map(c => c + '33'),
        borderColor: bgColors,
        borderWidth: 1.5,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#55607a', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#55607a', stepSize: 1, font: { size: 10 } } }
      }
    }
  });
}

// =============================================
//  RISK REGISTER
// =============================================
function renderRegister() {
  const data   = filteredRisks();
  const total  = data.length;
  const pages  = Math.ceil(total / PER_PAGE);
  if (currentPageNum > pages) currentPageNum = 1;

  const slice = data.slice((currentPageNum - 1) * PER_PAGE, currentPageNum * PER_PAGE);
  const tbody = document.getElementById('registerBody');

  if (slice.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8"><i class="fa-solid fa-circle-check"></i>No risks match your filters.</td></tr>`;
  } else {
    tbody.innerHTML = slice.map(r => `
      <tr>
        <td class="risk-title-cell">
          <strong>${escHtml(r.title)}</strong>
          <span>${escHtml(r.desc.slice(0,60))}…</span>
        </td>
        <td>${escHtml(r.category)}</td>
        <td>${escHtml(r.dept)}</td>
        <td>${scoreChipHtml(r)}</td>
        <td>${badgeHtml(severity(r), sevClass(severity(r)))}</td>
        <td>${badgeHtml(r.status, statusClass(r.status))}</td>
        <td style="font-size:12px;color:var(--text-secondary);">${escHtml(r.owner||'—')}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn" onclick="openEditModal(${r.id})" title="Edit">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn" onclick="cycleStatus(${r.id})" title="Next status">
              <i class="fa-solid fa-rotate-right"></i>
            </button>
            <button class="action-btn danger" onclick="deleteRisk(${r.id})" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Pagination
  const pag = document.getElementById('pagination');
  if (pages <= 1) { pag.innerHTML = ''; return; }
  let html = '';
  if (currentPageNum > 1) html += `<button class="page-btn" onclick="gotoPage(${currentPageNum-1})"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn ${i===currentPageNum?'active':''}" onclick="gotoPage(${i})">${i}</button>`;
  }
  if (currentPageNum < pages) html += `<button class="page-btn" onclick="gotoPage(${currentPageNum+1})"><i class="fa-solid fa-chevron-right"></i></button>`;
  pag.innerHTML = html;
}

function gotoPage(n) { currentPageNum = n; renderRegister(); }

function cycleStatus(id) {
  const r = risks.find(x => x.id === id);
  if (!r) return;
  const idx = STATUSES.indexOf(r.status);
  r.status = STATUSES[(idx + 1) % STATUSES.length];
  renderRegister();
  renderKPIs();
  showToast(`Status → ${r.status}`);
}

function deleteRisk(id) {
  if (!confirm('Delete this risk? This cannot be undone.')) return;
  risks = risks.filter(x => x.id !== id);
  renderRegister();
  renderKPIs();
  showToast('Risk deleted');
}

// =============================================
//  HEAT MAP
// =============================================
function renderMatrix() {
  const grid = document.getElementById('heatMatrix');
  let html = '';

  for (let lik = 5; lik >= 1; lik--) {
    for (let imp = 1; imp <= 5; imp++) {
      const sc    = lik * imp;
      const sev   = sc >= 20 ? 'Critical' : sc >= 12 ? 'High' : sc >= 6 ? 'Medium' : 'Low';
      const here  = risks.filter(r => r.likelihood === lik && r.impact === imp);
      const cnt   = here.length;
      const cls   = 'cell-' + sevClass(sev);
      html += `
        <div class="matrix-cell ${cls}" onclick="selectCell(${lik},${imp})" data-lik="${lik}" data-imp="${imp}">
          ${cnt > 0 ? `<span class="cell-count">${cnt}</span><span class="cell-score">L${lik}×I${imp}</span>` : `<span class="cell-score" style="opacity:0.3;">L${lik}×I${imp}</span>`}
        </div>
      `;
    }
  }
  grid.innerHTML = html;
}

function selectCell(lik, imp) {
  document.querySelectorAll('.matrix-cell').forEach(c => c.classList.remove('selected'));
  const cells = document.querySelectorAll(`.matrix-cell[data-lik="${lik}"][data-imp="${imp}"]`);
  cells.forEach(c => c.classList.add('selected'));

  const here = risks.filter(r => r.likelihood === lik && r.impact === imp);
  const detail = document.getElementById('cellDetail');
  if (here.length === 0) {
    detail.className = 'cell-detail-empty';
    detail.innerHTML = `No risks at L${lik} × I${imp}`;
  } else {
    detail.className = '';
    detail.innerHTML = here.map(r => `
      <div class="cell-detail-risk">
        <strong>${escHtml(r.title)}</strong>
        ${badgeHtml(r.status, statusClass(r.status))}
        <span style="display:block;margin-top:4px;font-size:11px;color:var(--text-muted);">${r.dept} · ${r.owner}</span>
      </div>
    `).join('');
  }
}

// =============================================
//  ANALYTICS
// =============================================
function renderAnalytics() {
  renderDeptChart();
  renderScatterChart();
  renderStackedBar();
}

function renderDeptChart() {
  const depts    = [...new Set(risks.map(r => r.dept))];
  const avgScores = depts.map(d => {
    const dr = risks.filter(r => r.dept === d);
    return Math.round(dr.reduce((a,b) => a + score(b), 0) / dr.length);
  });

  const wrap = document.getElementById('deptWrap');
  wrap.style.height = Math.max(180, depts.length * 44 + 60) + 'px';

  destroyChart('deptChart');
  charts.deptChart = new Chart(document.getElementById('deptChart'), {
    type: 'bar',
    data: {
      labels: depts,
      datasets: [{
        label: 'Avg Risk Score',
        data: avgScores,
        backgroundColor: 'rgba(99,140,255,0.2)',
        borderColor: '#638cff',
        borderWidth: 1.5,
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#55607a', font:{size:11} } },
        y: { grid: { display: false }, ticks: { color: '#8891a8', font:{size:12} } }
      }
    }
  });
}

function renderScatterChart() {
  const sevColors = {
    Critical: '#f87171', High: '#fbbf24', Medium: '#34d399', Low: '#7aa2ff'
  };
  const datasets = ['Critical','High','Medium','Low'].map(sev => ({
    label: sev,
    data: risks.filter(r => severity(r) === sev).map(r => ({ x: r.impact, y: r.likelihood, r: 8 })),
    backgroundColor: sevColors[sev] + '99',
    borderColor: sevColors[sev],
    borderWidth: 1.5
  }));

  destroyChart('scatterChart');
  charts.scatterChart = new Chart(document.getElementById('scatterChart'), {
    type: 'bubble',
    data: { datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8891a8', font:{size:11}, boxWidth:10 } } },
      scales: {
        x: {
          min: 0, max: 6,
          title: { display: true, text: 'Impact', color: '#55607a', font:{size:11} },
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#55607a', stepSize: 1 }
        },
        y: {
          min: 0, max: 6,
          title: { display: true, text: 'Likelihood', color: '#55607a', font:{size:11} },
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#55607a', stepSize: 1 }
        }
      }
    }
  });
}

function renderStackedBar() {
  const sevColors  = { Critical:'#f87171', High:'#fbbf24', Medium:'#34d399', Low:'#7aa2ff' };
  const datasets = ['Critical','High','Medium','Low'].map(sev => ({
    label: sev,
    data: CATEGORIES.map(cat => risks.filter(r => r.category === cat && severity(r) === sev).length),
    backgroundColor: sevColors[sev] + 'bb',
    borderColor: sevColors[sev],
    borderWidth: 0,
    borderRadius: 3
  }));

  destroyChart('stackedBar');
  charts.stackedBar = new Chart(document.getElementById('stackedBar'), {
    type: 'bar',
    data: { labels: CATEGORIES, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8891a8', font:{size:11}, boxWidth:10 } } },
      scales: {
        x: { stacked: true, grid: { display:false }, ticks: { color:'#55607a', font:{size:10} } },
        y: { stacked: true, grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#55607a', stepSize:1 } }
      }
    }
  });
}

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

// =============================================
//  CONTROLS PAGE
// =============================================
function renderControls() {
  const mitigating = risks.filter(r => r.status !== 'Open');
  document.getElementById('controlsList').innerHTML = mitigating.map(r => {
    const eff = Math.min(100, Math.round((1 - (score(r) / 25)) * 100 + Math.random() * 20));
    const sev = severity(r);
    return `
      <div class="control-card">
        <div class="control-header">
          <div>
            <div class="control-title">${escHtml(r.title)}</div>
            <div class="control-cat">${r.category} · ${r.dept}</div>
          </div>
          <div style="display:flex;gap:8px;">
            ${badgeHtml(sev, sevClass(sev))}
            ${badgeHtml(r.status, statusClass(r.status))}
          </div>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${escHtml(r.mitigation || 'No mitigation plan recorded.')}</p>
        <div class="control-meta">
          <span><i class="fa-solid fa-user"></i> ${escHtml(r.owner)}</span>
          <span><i class="fa-solid fa-calendar"></i> ${r.createdAt}</span>
          <span><i class="fa-solid fa-bullseye"></i> Risk Score: ${score(r)}</span>
        </div>
        <div class="effectiveness-bar">
          <div class="effectiveness-label">
            <span>Control Effectiveness</span>
            <span>${eff}%</span>
          </div>
          <div class="eff-track"><div class="eff-fill" style="width:${eff}%;"></div></div>
        </div>
      </div>
    `;
  }).join('');

  if (mitigating.length === 0) {
    document.getElementById('controlsList').innerHTML =
      '<p style="color:var(--text-muted);font-size:13px;padding:20px 0;">No active controls. Add risks with Mitigating / Monitoring / Resolved status.</p>';
  }
}

// =============================================
//  MODAL — ADD / EDIT
// =============================================
function openModal() {
  document.getElementById('modalTitle').textContent = 'Add New Risk';
  document.getElementById('editId').value = '';
  document.getElementById('fTitle').value     = '';
  document.getElementById('fCategory').value  = 'Operational';
  document.getElementById('fDept').value      = 'IT';
  document.getElementById('fLikelihood').value = 3;
  document.getElementById('fImpact').value     = 3;
  document.getElementById('likeVal').textContent = 3;
  document.getElementById('impVal').textContent  = 3;
  document.getElementById('fStatus').value    = 'Open';
  document.getElementById('fOwner').value     = '';
  document.getElementById('fDesc').value      = '';
  document.getElementById('fMitigation').value = '';
  updateScore();
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('fTitle').focus();
}

function openEditModal(id) {
  const r = risks.find(x => x.id === id);
  if (!r) return;
  document.getElementById('modalTitle').textContent = 'Edit Risk';
  document.getElementById('editId').value  = id;
  document.getElementById('fTitle').value  = r.title;
  document.getElementById('fCategory').value  = r.category;
  document.getElementById('fDept').value      = r.dept;
  document.getElementById('fLikelihood').value = r.likelihood;
  document.getElementById('fImpact').value     = r.impact;
  document.getElementById('likeVal').textContent = r.likelihood;
  document.getElementById('impVal').textContent  = r.impact;
  document.getElementById('fStatus').value    = r.status;
  document.getElementById('fOwner').value     = r.owner;
  document.getElementById('fDesc').value      = r.desc;
  document.getElementById('fMitigation').value = r.mitigation || '';
  updateScore();
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function updateScore() {
  const l  = parseInt(document.getElementById('fLikelihood').value);
  const i  = parseInt(document.getElementById('fImpact').value);
  const sc = l * i;
  const sev = sc >= 20 ? 'Critical' : sc >= 12 ? 'High' : sc >= 6 ? 'Medium' : 'Low';
  document.getElementById('scoreVal').textContent   = sc;
  document.getElementById('scoreLabel').textContent = sev;
}

function saveRisk() {
  const title = document.getElementById('fTitle').value.trim();
  if (!title) { alert('Please enter a risk title.'); return; }

  const editId = document.getElementById('editId').value;
  const data = {
    title,
    category:   document.getElementById('fCategory').value,
    dept:       document.getElementById('fDept').value,
    likelihood: parseInt(document.getElementById('fLikelihood').value),
    impact:     parseInt(document.getElementById('fImpact').value),
    status:     document.getElementById('fStatus').value,
    owner:      document.getElementById('fOwner').value.trim() || 'Unassigned',
    desc:       document.getElementById('fDesc').value.trim() || 'No description provided.',
    mitigation: document.getElementById('fMitigation').value.trim(),
    createdAt:  new Date().toISOString().split('T')[0]
  };

  if (editId) {
    const idx = risks.findIndex(x => x.id === parseInt(editId));
    if (idx !== -1) risks[idx] = { ...risks[idx], ...data };
    showToast('Risk updated');
  } else {
    risks.push({ id: nextId++, ...data });
    showToast('Risk added');
  }

  closeModal();
  if (currentPage === 'dashboard')  renderDashboard();
  if (currentPage === 'register')   renderRegister();
  if (currentPage === 'matrix')     renderMatrix();
  if (currentPage === 'analytics')  renderAnalytics();
  if (currentPage === 'controls')   renderControls();
  renderKPIs();
}

// =============================================
//  EXPORT CSV
// =============================================
function exportCSV() {
  const headers = ['ID','Title','Category','Department','Likelihood','Impact','Score','Severity','Status','Owner','Description','Created'];
  const rows = risks.map(r => [
    r.id, `"${r.title}"`, r.category, r.dept,
    r.likelihood, r.impact, score(r), severity(r),
    r.status, r.owner, `"${r.desc.replace(/"/g,'""')}"`, r.createdAt
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `risk-register-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported');
}
