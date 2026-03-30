/* utils.js — Shared utilities, API client, Router, UI helpers */
'use strict';

// ── API Client ────────────────────────────────────────────────────────────────
const api = async (url, body) => {
  const opts = body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : {};
  const r = await fetch(url, opts);
  return r.json();
};

// ── DOM Helpers ───────────────────────────────────────────────────────────────
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls)  e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};
const content = () => $('page-content');
const setContent = html => { content().innerHTML = html; content().scrollTop = 0; };

// ── UI Components ─────────────────────────────────────────────────────────────
const card = (inner, extra = '') =>
  `<div class="card ${extra}" style="margin-bottom:14px;">${inner}</div>`;

const metricCard = (val, lbl, delay = 0) =>
  `<div class="metric-card" style="animation-delay:${delay}s">
    <div class="metric-val">${val}</div>
    <div class="metric-lbl">${lbl}</div>
  </div>`;

const tag   = (txt, cls = '')        => `<span class="tag ${cls}">${txt}</span>`;
const badge = (txt, cls = 'badge-gold') => `<span class="badge ${cls}">${txt}</span>`;

const cfBar = (val, label = '') => {
  const pct   = Math.round(Math.max(0, Math.min(1, val)) * 100);
  const color = val >= 0.8 ? '#2ECC71' : val >= 0.6 ? '#C9A84C' : val >= 0.4 ? '#FF9933' : '#E74C3C';
  return `${label ? `<div style="font-size:0.78rem;color:var(--text2);margin-bottom:3px;">${label}</div>` : ''}
  <div class="cf-bar-track"><div class="cf-bar-fill" style="width:${pct}%;background:${color}"></div></div>`;
};

const gaugeSVG = (val, size = 90) => {
  const r = 30, cx = 40, cy = 42, pct = Math.max(0, Math.min(1, val));
  const color = pct >= 0.8 ? '#2ECC71' : pct >= 0.6 ? '#C9A84C' : pct >= 0.4 ? '#FF9933' : '#E74C3C';
  const toXY = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const endA = -135 + pct * 270;
  const [x1, y1] = toXY(-135), [x2, y2] = toXY(endA);
  const large = pct > 0.5 ? 1 : 0;
  return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" class="gauge-svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#22223A" stroke-width="7"
      stroke-dasharray="212 300" stroke-linecap="round" transform="rotate(-135,${cx},${cy})"/>
    <path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}"
      fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
    <text x="${cx}" y="${cy + 5}" text-anchor="middle"
      font-family="Cinzel,serif" font-size="12" fill="${color}">${Math.round(pct * 100)}%</text>
  </svg>`;
};

const pageHeader = (title, sub, module = '') =>
  `<div class="page-header">
    <div class="page-title">${title}</div>
    ${module ? `<div class="module-badge">${module}</div>` : ''}
    <div class="page-sub">${sub}</div>
    <div class="hero-divider"></div>
  </div>`;

const makeTabs = (items) =>
  `<div class="tabs">${items.map((t, i) =>
    `<div class="tab${i === 0 ? ' active' : ''}" data-tab="${i}">${t}</div>`).join('')}</div>`;

const initTabs = () => {
  $$('.tab').forEach((t, i) => t.addEventListener('click', () => {
    $$('.tab').forEach((tt, j) => tt.classList.toggle('active', j === i));
    $$('.tab-panel').forEach((p,  j) => p.classList.toggle('active', j === i));
  }));
};

const spinnerBtn = (btn, label = '▶ Run') => {
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';
  return () => { btn.disabled = false; btn.textContent = label; };
};

const selectDefault = (sel, val) => {
  for (const o of sel.options) if (o.value === val) { o.selected = true; break; }
};

// ── Router ────────────────────────────────────────────────────────────────────
const Router = {
  go(page) {
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    setContent(`<div class="empty-state">
      <div class="spinner" style="width:32px;height:32px;border-width:3px;margin:0 auto 14px;"></div>
      <div class="empty-msg">Loading...</div></div>`);
    window.Pages[page]?.();
  },
  init() {
    $$('.nav-item').forEach(n => n.addEventListener('click', () => this.go(n.dataset.page)));
    $('panel-close').addEventListener('click', () => $('node-panel').classList.remove('open'));
    this.go('home');
  }
};

window.Pages = {};
window.api   = api;
window.$     = $;
window.$$    = $$;
window.el    = el;
window.card  = card;
window.metricCard  = metricCard;
window.tag         = tag;
window.badge       = badge;
window.cfBar       = cfBar;
window.gaugeSVG    = gaugeSVG;
window.pageHeader  = pageHeader;
window.makeTabs    = makeTabs;
window.initTabs    = initTabs;
window.spinnerBtn  = spinnerBtn;
window.selectDefault = selectDefault;
window.setContent  = setContent;
window.Router      = Router;
