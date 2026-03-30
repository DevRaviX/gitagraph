/* pages/expert.js — Expert System: reader profiles, rule firing chain, rule base */
'use strict';

Pages.expert = async () => {
  setContent(`
    ${pageHeader('Expert System', '8 Production Rules · Forward Chaining · Conflict Resolution by Specificity', 'MODULE 4 CONTINUED · EXPERT SYSTEM')}
    ${makeTabs(['👤 Reader Profiles', '📋 Rule Base'])}

    <div class="tab-panel active" id="tp-0">
      <div class="alert alert-info" style="margin-bottom:14px;">
        Click a profile to run inference — see the full forward-chaining trace.
      </div>
      <div id="profiles-list"><div class="empty-state"><span class="spinner" style="width:24px;height:24px;border-width:2px;display:block;margin:0 auto 8px;"></span></div></div>
    </div>

    <div class="tab-panel" id="tp-1">
      <div id="rule-base"></div>
    </div>
  `);

  initTabs();
  $$('.tab')[1].addEventListener('click', () => {
    if (!$('rule-base').innerHTML) renderRuleBase();
  });

  loadProfiles();
};

async function loadProfiles() {
  const data = await api('/api/profiles');

  $('profiles-list').innerHTML = data.demos.map((d, i) => `
    <div class="expander" id="exp-${i}">
      <div class="expander-header" onclick="toggleExpander('exp-${i}', '${i}', ${JSON.stringify(d).replace(/"/g, '&quot;')})">
        <div>
          <div class="expander-title">
            <b style="color:var(--gold);">${d.label}</b>
          </div>
          <div style="font-size:0.78rem;color:var(--text2);margin-top:3px;">${d.concern.slice(0, 80)}…</div>
        </div>
        <span class="expander-icon">▾</span>
      </div>
      <div class="expander-body" id="exp-body-${i}"></div>
    </div>`).join('');

  /* store demos globally for onclick access */
  window._profileDemos = data.demos;
}

window.toggleExpander = (id, idx, d) => {
  const exp  = $(id);
  const body = $(`exp-body-${idx}`);
  const isOpen = exp.classList.contains('open');

  /* close all */
  document.querySelectorAll('.expander').forEach(e => e.classList.remove('open'));

  if (isOpen) return;
  exp.classList.add('open');

  const demo = window._profileDemos[idx];
  if (!demo) return;

  const cf  = Math.round((demo.confidence || 0) * 100);
  const sv  = demo.start_verse;

  body.innerHTML = `
    <div class="grid-2">
      <div>
        <div style="font-size:0.8rem;color:var(--text2);margin-bottom:10px;">
          <b>Goal:</b> ${demo.goal}<br>
          <b>Concern:</b> ${demo.concern}
        </div>
        <div style="font-size:0.72rem;color:var(--gold);font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:8px;">
          RULES FIRED (in specificity order)
        </div>
        <div class="chain-container">
          ${(demo.fired_rules || []).map(([name, desc], i) => `
            <div class="chain-step fired" style="animation-delay:${i * 0.07}s;">
              <div>
                <div class="chain-rule-name">${name}</div>
                <div class="chain-desc">${desc}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div style="text-align:center;padding:16px 0;">
          ${gaugeSVG(cf / 100, 110)}
          <div style="font-size:0.72rem;color:var(--text2);margin-top:4px;">Inference Confidence</div>
          <div style="margin-top:10px;font-family:Cinzel,serif;font-size:1rem;color:var(--gold);">
            ${(demo.recommend_concept || '').replace(/_inst$/, '')}
          </div>
        </div>
        ${sv ? `
          <div style="font-size:0.82rem;color:var(--text2);text-align:center;">
            Start verse: <b style="color:var(--saffron);">${sv.chapter}.${sv.verse_number}</b>
          </div>
          <div style="font-size:0.78rem;color:var(--text2);font-style:italic;text-align:center;margin-top:6px;line-height:1.5;">
            ${(sv.translation || '').slice(0, 140)}…
          </div>` : ''}
      </div>
    </div>`;
};

async function renderRuleBase() {
  const data = await api('/api/profiles');
  const rules = data.rules || [];

  $('rule-base').innerHTML = `
    <div style="font-size:0.72rem;color:var(--text3);letter-spacing:1.5px;margin-bottom:12px;">
      ${rules.length} RULES · SORTED BY SPECIFICITY (CONFLICT RESOLUTION)
    </div>
    ${rules.map((r, i) => `
      <div class="rule-row" style="animation-delay:${i * 0.05}s;">
        <div style="min-width:28px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:var(--text3);">
          ${i + 1}
        </div>
        <div class="rule-name-col">${r.name}</div>
        <div class="rule-desc-col">${r.description}</div>
        <div class="rule-meta">
          <div class="spec-label">Specificity: <b style="color:var(--gold);">${r.specificity}</b></div>
          ${cfBar(r.cf)}
          <div style="font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:var(--text3);">cf=${r.cf}</div>
        </div>
      </div>`).join('')}
  `;
}
