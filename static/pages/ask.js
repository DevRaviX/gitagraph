/* pages/ask.js — Chat interface + SPARQL competency questions */
'use strict';

Pages.ask = async () => {
  setContent(`
    ${pageHeader('Ask the Gītā', 'Expert System · Forward Chaining · SPARQL · Rule Firing Inference', 'MODULE 4 · EXPERT SYSTEM + SPARQL')}
    ${makeTabs(['💬 Chat with the Gītā', '🔍 SPARQL Explorer'])}

    <div class="tab-panel active" id="tp-0">
      <div class="chat-container">
        <div class="chat-messages" id="chat-msgs">
          <div class="chat-row">
            <span class="chat-avatar">🪷</span>
            <div class="chat-bubble chat-sys">
              Namaste 🙏 I am your Gītā guide. Tell me your concern and goal — I will reason through Krishna's wisdom using the expert system.
            </div>
          </div>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px;">
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <select id="ask-stage"  class="select-field" style="flex:1;">
              <option>beginner</option><option>intermediate</option><option>advanced</option>
            </select>
            <select id="ask-nature" class="select-field" style="flex:1;">
              <option>active</option><option>contemplative</option><option>devotional</option>
            </select>
          </div>
          <input id="chat-concern" class="input-field" placeholder="What troubles your mind? (e.g. anxiety about results...)" style="margin-bottom:8px;">
          <div class="chat-input-row">
            <input id="chat-goal" class="chat-input" placeholder="Your goal (e.g. peace, duty, liberation)...">
            <button class="btn btn-primary" id="chat-send">Ask ✦</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-panel" id="tp-1">
      <div id="sparql-panel"></div>
    </div>
  `);

  initTabs();
  $$('.tab')[1].addEventListener('click', () => {
    if (!$('sparql-panel').innerHTML) loadSparql();
  });

  $('chat-send').addEventListener('click', sendChat);
  $('chat-goal').addEventListener('keydown', e => e.key === 'Enter' && sendChat());
};

async function sendChat() {
  const concern = $('chat-concern').value.trim();
  const goal    = $('chat-goal').value.trim();
  if (!concern && !goal) return;

  const msgs = $('chat-msgs');
  const addMsg = (html, isUser) => {
    const row = el('div', `chat-row ${isUser ? 'user' : ''}`);
    row.innerHTML = `
      <span class="chat-avatar">${isUser ? '🧑' : '🪷'}</span>
      <div class="chat-bubble ${isUser ? 'chat-user' : 'chat-sys'}">${html}</div>`;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  };

  addMsg(`<b>Concern:</b> ${concern || '—'}<br><b>Goal:</b> ${goal || '—'}<br>
    <span style="font-size:0.8rem;color:var(--text2);">${$('ask-stage').value} · ${$('ask-nature').value}</span>`, true);

  /* typing indicator */
  const typing = el('div', 'chat-row');
  typing.innerHTML = `<span class="chat-avatar">🪷</span>
    <div class="chat-bubble chat-sys">
      <div class="typing-indicator">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    </div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  const res = await api('/api/infer', {
    concern, goal,
    stage:  $('ask-stage').value,
    nature: $('ask-nature').value,
  });
  typing.remove();

  const cf  = Math.round((res.confidence || 0) * 100);
  let reply = '';

  if (res.recommend_concept)
    reply += `<div style="margin-bottom:8px;">📌 Recommended path: <b style="color:var(--gold)">${res.recommend_concept.replace(/_inst$/, '')}</b></div>`;

  if (res.start_verse)
    reply += `<div style="margin-bottom:8px;">📖 Begin with Verse <b style="color:var(--saffron)">${res.start_verse.chapter}.${res.start_verse.verse_number}</b><br>
      <i style="font-size:0.82rem;color:var(--text2);">${(res.start_verse.translation || '').slice(0, 160)}…</i></div>`;

  reply += cfBar(cf / 100, `Confidence: ${cf}%`);

  if (res.fired_rules?.length) {
    const chainId = `chain-${Date.now()}`;
    reply += `
      <div style="font-size:0.75rem;color:var(--text3);cursor:pointer;margin-top:10px;"
        onclick="document.getElementById('${chainId}').style.display=document.getElementById('${chainId}').style.display==='none'?'block':'none'">
        ▸ Inference chain — ${res.fired_rules.length} rule(s) fired
      </div>
      <div id="${chainId}" style="display:none;margin-top:6px;">
        <div class="chain-container">
          ${res.fired_rules.map(([name, desc], i) => `
            <div class="chain-step fired" style="animation-delay:${i * 0.07}s;">
              <div>
                <div class="chain-rule-name">${name}
                  <span style="font-size:0.68rem;color:var(--text3);margin-left:6px;">
                    cf=${res.rules_info?.find(r => r.name === name)?.cf ?? ''}
                  </span>
                </div>
                <div class="chain-desc">${desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  addMsg(reply, false);
  $('chat-concern').value = '';
  $('chat-goal').value    = '';
}

async function loadSparql() {
  const CQS = ['CQ1','CQ2','CQ3','CQ4','CQ5','CQ6','CQ7','CQ8'];
  $('sparql-panel').innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:14px;align-items:flex-end;">
      <div class="input-group" style="flex:1;margin:0;">
        <div class="input-label">Competency Question</div>
        <select id="cq-sel" class="select-field" style="width:100%;">
          ${CQS.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary" id="cq-run">Execute Query</button>
    </div>
    <div id="cq-info"></div>
    <div id="cq-results"></div>
  `;

  $('cq-run').addEventListener('click', async () => {
    const restore = spinnerBtn($('cq-run'), 'Execute Query');
    const cq  = $('cq-sel').value;
    const res = await api(`/api/sparql/${cq}`);
    restore();

    $('cq-info').innerHTML = card(`
      <div style="font-size:0.7rem;color:var(--saffron);font-family:'JetBrains Mono',monospace;margin-bottom:4px;">${cq} · ${res.technique || ''}</div>
      <div style="font-size:0.95rem;color:var(--text1);margin-bottom:10px;">${res.question || ''}</div>
      <div class="sparql-toggle" onclick="const b=this.nextElementSibling;b.style.display=b.style.display==='block'?'none':'block';">▸ Show SPARQL Query</div>
      <pre class="sparql-block">${res.query || ''}</pre>
    `);

    if (res.rows?.length) {
      const cols = Object.keys(res.rows[0]);
      $('cq-results').innerHTML = `
        <div style="font-size:0.8rem;color:var(--text2);margin-bottom:8px;">
          Returned <b style="color:var(--gold)">${res.rows.length}</b> result(s)
        </div>
        <table class="trace-table">
          <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>
            ${res.rows.map(r =>
              `<tr>${cols.map(c => `<td>${(r[c] || '').toString().slice(0, 100)}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>`;
    } else {
      $('cq-results').innerHTML = `<div class="alert alert-info">
        No results returned. Transitive inferences (e.g. CQ3) require OWL reasoning (Fuseki + HermiT).
        The SPARQL query is shown above.</div>`;
    }
  });
}
