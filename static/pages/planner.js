/* pages/planner.js — CSP Study Planner: MRV + Forward Checking timeline UI */
'use strict';

Pages.planner = async () => {
  const GOALS = ['general', 'meditation', 'anxiety', 'duty', 'wisdom', 'liberation'];

  setContent(`
    ${pageHeader('Study Planner', 'CSP Backtracking · MRV Heuristic · Forward Checking · Constraint Propagation', 'MODULE 5 · CSP SOLVER')}

    <div class="grid-3" style="margin-bottom:16px;">
      <div class="input-group">
        <div class="input-label">Reading Goal</div>
        <select id="pl-goal" class="select-field" style="width:100%;">
          ${GOALS.map(g => `<option value="${g}">${g.charAt(0).toUpperCase() + g.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <div class="input-label">Sessions: <span id="pl-sess-v" style="color:var(--gold);">5</span></div>
        <input type="range" id="pl-sess" min="3" max="7" value="5"
          style="accent-color:var(--gold);width:100%;margin-top:8px;">
      </div>
      <div class="input-group">
        <div class="input-label">Verses / Session</div>
        <select id="pl-vps" class="select-field" style="width:100%;">
          <option value="2">2</option><option value="3">3</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" id="pl-run">⚙ Generate Study Plan</button>
    <div id="pl-results" style="margin-top:20px;"></div>
  `);

  $('pl-sess').addEventListener('input', () => $('pl-sess-v').textContent = $('pl-sess').value);

  $('pl-run').addEventListener('click', async () => {
    const restore = spinnerBtn($('pl-run'), '⚙ Generate Study Plan');
    const res = await api('/api/plan', {
      goal:       $('pl-goal').value,
      sessions:   $('pl-sess').value,
      verses_per: $('pl-vps').value,
    });
    restore();

    if (!res.success) {
      $('pl-results').innerHTML = `<div class="alert alert-warn">${res.error || 'Could not find a valid plan.'}</div>`;
      return;
    }

    const chColors = { '2': '#C9A84C', '3': '#3498DB', '6': '#2ECC71' };

    $('pl-results').innerHTML = `
      <div class="metric-grid">
        ${metricCard(res.plan.length,               'Sessions Generated')}
        ${metricCard(res.total_verses,              'Total Verses')}
        ${metricCard(res.chapters_covered?.length,  'Chapters Covered')}
        ${metricCard(res.backtrack_count || 0,      'Backtracks')}
      </div>

      <div style="font-size:0.72rem;color:var(--text3);letter-spacing:1.5px;margin:18px 0 10px;">STUDY TIMELINE</div>
      <div class="timeline">
        ${res.plan.map((s, i) => {
          const ch   = String(s.verse_details?.[0]?.chapter || '');
          const col  = chColors[ch] || '#9B59B6';
          const refs = (s.verse_details || []).map(v => `${v.chapter}.${v.verse_number}`).join(' · ');
          const last = i === res.plan.length - 1;
          return `
            <div class="timeline-row">
              <div class="timeline-spine">
                <div class="timeline-dot" style="color:${col};background:${col};"></div>
                ${!last ? '<div class="timeline-line"></div>' : ''}
              </div>
              <div class="timeline-content" style="animation-delay:${i * 0.1}s;">
                <div class="timeline-label" style="color:${col};">
                  SESSION ${s.session} &nbsp;${badge('✓ Consistent', 'badge-green')}
                </div>
                <div class="timeline-title">${refs}</div>
                <div class="timeline-sub">Theme: <b>${s.theme || '—'}</b></div>
                <div style="margin-top:5px;">
                  ${(s.shared_concepts || []).map(c => tag(c.replace(/_inst$/, '').replace(/_/g, ' '))).join('')}
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>

      ${card(`
        <div style="font-size:0.72rem;color:var(--saffron);font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:12px;">
          HOW THE CSP SOLVER WORKED
        </div>
        <div class="constraint-list">
          ${[
            ['⚡', 'MRV Heuristic',       'Assigned session with fewest valid verse-pairs first'],
            ['🔪', 'Forward Checking',     'After each assignment, pruned impossible pairs from remaining domains'],
            ['📊', 'LCV Ordering',         'Preferred pairs sharing the most concepts (least constraining value)'],
            ['🎯', 'Theme Coherence',      'Every session pair must share ≥ 1 philosophical concept'],
            ['📚', 'Chapter Coverage',     'All 3 chapters (2, 3, 6) must appear across the full plan'],
          ].map(([ico, name, desc]) => `
            <div class="constraint-item">
              <span class="constraint-icon">${ico}</span>
              <div>
                <div class="constraint-name">${name}</div>
                <div class="constraint-desc">${desc}</div>
              </div>
            </div>`).join('')}
        </div>
      `)}
    `;
  });
};
