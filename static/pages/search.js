/* pages/search.js — Graph Search: animated BFS / DFS chain / A* trace */
'use strict';

Pages.search = async () => {
  const { concepts } = await api('/api/concepts');
  const opts = concepts.map(c => `<option value="${c}">${c}</option>`).join('');

  setContent(`
    ${pageHeader('Graph Search', 'BFS · DFS · A* · IDDFS over the Concept-Verse Graph', 'MODULE 3 · GRAPH SEARCH')}
    ${makeTabs(['🔵 BFS — Reading List', '🔴 DFS — Downfall Chain', '⭐ A* — Spiritual Path'])}

    <div class="tab-panel active" id="tp-0">
      <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px;">
        <div class="input-group" style="flex:2;min-width:180px;margin:0;">
          <div class="input-label">Start Concept</div>
          <select id="bfs-start" class="select-field" style="width:100%;">${opts}</select>
        </div>
        <div class="input-group" style="min-width:140px;margin:0;">
          <div class="input-label">Max Hops: <span id="bfs-hops-v">2</span></div>
          <input type="range" id="bfs-hops" min="1" max="3" value="2" style="accent-color:var(--gold);width:100%;margin-top:8px;">
        </div>
        <button class="btn btn-primary" id="run-bfs">▶ Run BFS</button>
      </div>
      <div id="bfs-anim"></div>
      <div id="bfs-results"></div>
    </div>

    <div class="tab-panel" id="tp-1">
      <div style="display:flex;gap:10px;align-items:flex-end;margin-bottom:14px;">
        <div class="input-group" style="flex:2;margin:0;">
          <div class="input-label">Start Node</div>
          <select id="dfs-start" class="select-field" style="width:100%;">${opts}</select>
        </div>
        <button class="btn btn-primary" id="run-dfs">▶ Trace Chain</button>
      </div>
      <div id="dfs-results"></div>
    </div>

    <div class="tab-panel" id="tp-2">
      <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px;">
        <div class="input-group" style="flex:1;min-width:140px;margin:0;">
          <div class="input-label">Start Node</div>
          <select id="as-start" class="select-field" style="width:100%;">${opts}</select>
        </div>
        <div class="input-group" style="flex:1;min-width:140px;margin:0;">
          <div class="input-label">Goal Node</div>
          <select id="as-goal" class="select-field" style="width:100%;">${opts}</select>
        </div>
        <button class="btn btn-primary" id="run-as">▶ Run A*</button>
      </div>
      <div id="as-results"></div>
    </div>
  `);

  initTabs();
  selectDefault($('bfs-start'), 'NishkamaKarma');
  selectDefault($('dfs-start'), 'Kama');
  selectDefault($('as-start'),  'Vairagya');
  selectDefault($('as-goal'),   'Moksha');

  $('bfs-hops').addEventListener('input', () => $('bfs-hops-v').textContent = $('bfs-hops').value);

  /* ── BFS ── */
  $('run-bfs').addEventListener('click', async () => {
    const restore = spinnerBtn($('run-bfs'), '▶ Run BFS');
    const res = await api('/api/bfs', { concept: $('bfs-start').value, hops: +$('bfs-hops').value });
    restore();

    $('bfs-anim').innerHTML = `
      <div style="font-size:0.8rem;color:var(--text2);margin-bottom:6px;">
        Found <b style="color:var(--gold)">${res.count}</b> verses from
        <b style="color:var(--gold)">${res.concept}</b>
      </div>
      <div class="step-pills" id="bfs-pills"></div>
      <div class="traversal-progress" style="margin:8px 0;">
        <div class="traversal-bar" id="bfs-bar" style="width:0%"></div>
      </div>`;
    $('bfs-results').innerHTML = '';

    animatePills(res.results, () => {
      $('bfs-results').innerHTML = res.results.map(r => card(`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div class="verse-id">Verse ${r.chapter}.${r.verse_number}</div>
          <span style="font-size:0.74rem;color:${['#2ECC71','#C9A84C','#FF9933','#E74C3C'][Math.min(r.hop_depth,3)]};font-family:'JetBrains Mono',monospace;">
            Hop ${r.hop_depth} via ${(r.reached_via || '').replace(/_inst$/, '')}
          </span>
        </div>
        <div class="verse-en">${(r.translation || '').slice(0, 220)}</div>
      `)).join('');
    });
  });

  /* ── DFS ── */
  $('run-dfs').addEventListener('click', async () => {
    const restore = spinnerBtn($('run-dfs'), '▶ Trace Chain');
    const res = await api('/api/dfs', { start: $('dfs-start').value });
    restore();

    const chain = res.chain || [];
    $('dfs-results').innerHTML = `
      <div class="path-chain">
        ${chain.map((n, i) => `
          <span class="path-node${i === chain.length - 1 ? ' goal-node' : ''}">${n}</span>
          ${i < chain.length - 1 ? '<span class="path-arrow">→</span>' : ''}
        `).join('')}
      </div>
      ${(res.annotated || []).map((s, i) => card(`
        <div style="font-family:Cinzel,serif;font-size:0.92rem;color:var(--gold);margin-bottom:4px;">${s.node}</div>
        <div style="font-size:0.8rem;color:var(--text2);margin-bottom:4px;">${(s.definition || '').slice(0, 130)}</div>
        <div style="font-size:0.76rem;color:var(--text3);">Taught by:
          <span style="color:var(--saffron);">
            ${s.taught_by_verses?.map(v => `${v.chapter}.${v.verse_number}`).join(', ') || 'No direct verse'}
          </span>
        </div>
      `, `" style="animation-delay:${i * 0.08}s;`)).join('')}
    `;
  });

  /* ── A* ── */
  $('run-as').addEventListener('click', async () => {
    const restore = spinnerBtn($('run-as'), '▶ Run A*');
    const res = await api('/api/astar', { start: $('as-start').value, goal: $('as-goal').value });
    restore();

    if (!res.found) {
      $('as-results').innerHTML = `<div class="alert alert-warn">No path found: ${res.error || ''}</div>`;
      return;
    }
    const path = res.path || [];
    $('as-results').innerHTML = `
      <div class="path-chain">
        ${path.map((n, i) => `
          <span class="path-node${n === $('as-goal').value ? ' goal-node' : ''}">${n.replace(/_inst$/, '')}</span>
          ${i < path.length - 1 ? '<span class="path-arrow">→</span>' : ''}
        `).join('')}
      </div>
      <div style="font-size:0.82rem;color:var(--text2);margin:8px 0;">
        Shortest path: <b style="color:var(--gold)">${res.total_hops} hops</b> ·
        h(n) admissible: <span style="color:#2ECC71;">✓</span>
      </div>
      <div style="font-size:0.82rem;color:var(--gold);margin:10px 0 6px;">f(n) = g(n) + h(n) expansion trace:</div>
      <table class="trace-table">
        <thead><tr><th>Node</th><th>g(n) cost</th><th>h(n) heuristic</th><th>f(n) total</th></tr></thead>
        <tbody>
          ${(res.f_values || []).map(([n, g, h, f]) => `
            <tr>
              <td>${n.replace(/_inst$/, '')}</td>
              <td class="val-g">${g}</td>
              <td class="val-h">${h}</td>
              <td class="val-f">${f}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="font-size:0.74rem;color:var(--text3);margin-top:8px;font-style:italic;">${res.admissibility_note || ''}</div>
    `;
  });
};

/* Animated pill reveal for BFS traversal */
function animatePills(results, onDone) {
  const pills = $('bfs-pills'), bar = $('bfs-bar');
  let i = 0;
  const iv = setInterval(() => {
    if (i >= results.length) { clearInterval(iv); onDone(); return; }
    const r = results[i];
    const cls = ['visiting', 'visited', 'visited', 'visited'][Math.min(r.hop_depth, 3)];
    const pill = el('span', `step-pill ${cls}`,
      `<span class="step-dot"></span>${r.chapter}.${r.verse_number} H${r.hop_depth}`);
    pills.appendChild(pill);
    bar.style.width = `${Math.round((i + 1) / results.length * 100)}%`;
    i++;
  }, 130);
}
