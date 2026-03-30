/* pages/uncertainty.js — MYCIN CF gauges, fuzzy radar, belief revision, sliders */
'use strict';

Pages.uncertainty = async () => {
  setContent(`
    ${pageHeader('Uncertainty Handling', 'MYCIN CF · Fuzzy Membership · Non-Monotonic Belief Revision', 'MODULE 6 · UNCERTAINTY')}
    ${makeTabs(['🎯 Certainty Factors', '🌀 Fuzzy Membership', '🔄 Belief Revision'])}

    <div class="tab-panel active" id="tp-0">
      <div class="grid-2" style="margin-bottom:14px;">
        <div class="input-group">
          <div class="input-label">Verse</div>
          <select id="cf-verse" class="select-field" style="width:100%;"></select>
        </div>
        <div class="input-group">
          <div class="input-label">Concept</div>
          <select id="cf-concept" class="select-field" style="width:100%;"></select>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" id="cf-run">Analyse Certainty Factor</button>
      <div id="cf-result" style="margin-top:14px;"></div>

      <div style="margin-top:24px;border-top:1px solid var(--border);padding-top:18px;">
        <div class="input-label" style="margin-bottom:12px;">🎛️ SIMULATE EVIDENCE — MYCIN COMBINATOR</div>
        ${['Textual Evidence', 'Tradition Authority', 'Contextual Merit'].map((lbl, i) => `
          <div class="slider-row">
            <div class="slider-label">${lbl}</div>
            <input type="range" class="slider-input cf-slider" min="-100" max="100"
              value="${[70, 50, 30][i]}" data-idx="${i}">
            <div class="slider-val" id="sv-${i}">0.${[70, 50, 30][i]}</div>
          </div>`).join('')}
        <div id="sim-result" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="tab-panel" id="tp-1">
      <div class="input-group">
        <div class="input-label">Select Verse</div>
        <select id="fz-verse" class="select-field" style="width:60%;"></select>
      </div>
      <div id="fz-result" style="margin-top:14px;"></div>
    </div>

    <div class="tab-panel" id="tp-2">
      <div class="input-group">
        <div class="input-label">Reader Nature</div>
        <select id="br-nature" class="select-field">
          <option>contemplative</option><option>active</option><option>devotional</option>
        </select>
      </div>
      <button class="btn btn-primary" id="br-run">Run Belief Revision Demo</button>
      <div id="br-result" style="margin-top:14px;"></div>
    </div>
  `);

  initTabs();
  await initCFTab();
  initSliders();
  await initFuzzyTab();
  initBeliefTab();
};

async function initCFTab() {
  const init = await api('/api/cf', { verse: 'Verse_2_47', concept: 'KarmaYoga_inst' });
  const verses  = init.all_verses || [];
  const cForV   = init.concepts_for_verse || {};

  const cfV = $('cf-verse');
  cfV.innerHTML = verses.map(v => `<option>${v}</option>`).join('');

  const updateConcepts = () => {
    const cs = cForV[cfV.value] || [];
    $('cf-concept').innerHTML = cs.map(c => `<option>${c}</option>`).join('');
  };
  cfV.addEventListener('change', updateConcepts);
  updateConcepts();

  $('cf-run').addEventListener('click', async () => {
    const restore = spinnerBtn($('cf-run'), 'Analyse Certainty Factor');
    const res = await api('/api/cf', { verse: cfV.value, concept: $('cf-concept').value });
    restore();

    if (!res.cf_combined) {
      $('cf-result').innerHTML = `<div class="alert alert-warn">${res.note || 'No CF data available.'}</div>`;
      return;
    }

    $('cf-result').innerHTML = card(`
      <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
        <div style="text-align:center;">
          ${gaugeSVG(res.cf_combined, 110)}
          <div style="font-size:0.72rem;color:var(--text2);margin-top:4px;">${res.interpretation}</div>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:var(--gold);margin-bottom:12px;">
            ${res.formula || ''}
          </div>
          ${(res.evidence || []).map(e => {
            const c = e.cf >= 0.7 ? '#2ECC71' : e.cf >= 0.4 ? '#C9A84C' : '#E74C3C';
            return `<div class="evidence-row">
              <div class="evidence-source">${e.source}</div>
              <div class="evidence-track">
                <div class="evidence-fill" style="width:${Math.abs(e.cf)*100}%;background:${c};"></div>
              </div>
              <div class="evidence-val" style="color:${c};">${e.cf.toFixed(2)}</div>
            </div>`;
          }).join('')}
          ${res.flag ? `<div style="color:#E74C3C;font-size:0.8rem;margin-top:8px;">${res.flag}</div>` : ''}
        </div>
      </div>
    `);
  });
}

function initSliders() {
  const sliders = $$('.cf-slider');
  const update  = () => {
    const vals = [...sliders].map(s => s.value / 100);
    vals.forEach((v, i) => $(`sv-${i}`).textContent = v.toFixed(2));

    /* MYCIN combination formula */
    let r = vals[0];
    for (let i = 1; i < vals.length; i++) {
      const a = r, b = vals[i];
      if      (a >= 0 && b >= 0) r = a + b * (1 - a);
      else if (a <  0 && b <  0) r = a + b * (1 + a);
      else                       r = (a + b) / (1 - Math.min(Math.abs(a), Math.abs(b)));
    }
    r = Math.max(-1, Math.min(1, Math.round(r * 10000) / 10000));
    const interp = r >= 0.8 ? 'Strong Belief' : r >= 0.6 ? 'Moderate Belief' : r >= 0.4 ? 'Weak Belief' : r < 0 ? 'Disbelief' : 'Very Weak';

    $('sim-result').innerHTML = card(`
      <div style="font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:var(--gold);text-align:center;margin-bottom:10px;">
        ${vals.map(v => v.toFixed(2)).join(' ⊕ ')} = <span style="font-size:1.3rem;">${r.toFixed(4)}</span>
      </div>
      ${cfBar(Math.max(0, r), `${interp} · ${Math.round(r * 100)}%`)}
    `);
  };
  sliders.forEach(s => s.addEventListener('input', update));
  update();
}

async function initFuzzyTab() {
  try {
    const init = await api('/api/fuzzy/Verse_2_47');
    const verses = init.all_verses || [];
    const fzV    = $('fz-verse');
    fzV.innerHTML = verses.map(v => `<option>${v}</option>`).join('');
    selectDefault(fzV, 'Verse_6_47');

    const loadFuzzy = async () => {
      const res   = await api(`/api/fuzzy/${fzV.value}`);
      const paths = res.yoga_paths || [];
      const mems  = res.memberships || {};
      const lbls  = res.linguistic_labels || {};
      const COLS  = { KarmaYoga: '#FF9933', JnanaYoga: '#9B59B6', DhyanaYoga: '#3498DB', BhaktiYoga: '#2ECC71' };

      $('fz-result').innerHTML = `
        <div class="fuzzy-grid">
          ${paths.map(p => `
            <div class="fuzzy-item">
              <div class="fuzzy-mu" style="color:${COLS[p]}">${(mems[p] || 0).toFixed(2)}</div>
              <div class="fuzzy-path">${p.replace('Yoga', ' Yoga')}</div>
              <div class="fuzzy-grade" style="color:${lbls[p]==='High'?'#2ECC71':lbls[p]==='Medium'?'#C9A84C':'#706050'}">
                ${lbls[p] || ''}
              </div>
            </div>`).join('')}
        </div>
        <div style="font-size:0.82rem;color:var(--text2);margin:8px 0;">
          Primary: <b style="color:var(--gold)">${res.primary_path || '—'}</b> | ${res.fuzzy_reveals || ''}
        </div>
        <div id="fuzzy-radar"></div>`;

      Plotly.newPlot('fuzzy-radar', [{
        type: 'scatterpolar', fill: 'toself',
        r:    paths.map(p => mems[p] || 0).concat([mems[paths[0]] || 0]),
        theta: paths.concat([paths[0]]),
        fillcolor: 'rgba(26,188,156,0.12)',
        line: { color: '#1ABC9C', width: 2 },
        hovertemplate: '%{theta}: μ=%{r:.2f}<extra></extra>',
      }], {
        polar: {
          radialaxis:  { range: [0, 1], color: '#706050', gridcolor: '#2A2A42',
                         tickvals: [0.2, 0.5, 0.8], ticktext: ['Low','Med','High'] },
          angularaxis: { color: '#B0A090', gridcolor: '#2A2A42' },
          bgcolor: 'rgba(0,0,0,0)',
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        height: 260, showlegend: false,
        margin: { l: 50, r: 50, t: 20, b: 20 },
      }, { displayModeBar: false });
    };

    fzV.addEventListener('change', loadFuzzy);
    loadFuzzy();
  } catch (e) { /* fuzzy tab unavailable */ }
}

function initBeliefTab() {
  $('br-run').addEventListener('click', async () => {
    const restore = spinnerBtn($('br-run'), 'Run Belief Revision Demo');
    const res = await api('/api/belief', { nature: $('br-nature').value });
    restore();

    $('br-result').innerHTML = (res.steps || []).map((s, i) => `
      <div class="belief-section" style="animation-delay:${i * 0.1}s;">
        <div class="belief-step-title">⟶ ${s.step}</div>
        ${(s.belief_changes || []).map(c => `
          <div class="belief-change ${c.type === 'ADD' ? 'belief-add' : 'belief-retract'}">
            <span style="font-weight:600;">${c.type === 'ADD' ? '+' : '−'}</span>
            ${c.belief}
            <span style="font-size:0.72rem;color:var(--text3);display:block;margin-top:2px;">
              Trigger: ${c.trigger} | ${c.reason}
            </span>
          </div>`).join('')}
        ${(s.active_beliefs || []).map(b => `<div class="belief-active">✓ ${b}</div>`).join('')}
      </div>`).join('');
  });
}
