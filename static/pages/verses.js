/* pages/verses.js — Verse Browser: search, filter, display */
'use strict';

Pages.verses = async () => {
  setContent(`
    ${pageHeader('Verse Browser', 'All 701 verses · Bhagavad Gītā · Search Sanskrit, English, Hindi')}
    <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <input id="vs-q"  class="input-field" placeholder="Search verses..." style="flex:2;min-width:180px;">
      <select id="vs-ch" class="select-field">
        <option value="all">All Chapters</option>
        ${Array.from({ length: 18 }, (_, i) => `<option value="${i + 1}">Chapter ${i + 1}</option>`).join('')}
      </select>
      <select id="vs-lang" class="select-field">
        <option value="en">English</option>
        <option value="sa">Sanskrit</option>
        <option value="hi">Hindi</option>
      </select>
      <button class="btn btn-primary btn-sm" id="vs-search">Search</button>
    </div>
    <div id="vs-count" style="font-size:0.78rem;color:var(--text3);margin-bottom:12px;"></div>
    <div id="vs-list"></div>
    <div id="vs-more" style="text-align:center;padding:16px;font-size:0.82rem;color:var(--text3);"></div>
  `);

  const load = async () => {
    const q    = $('vs-q').value;
    const ch   = $('vs-ch').value;
    const lang = $('vs-lang').value;
    const data = await api(`/api/verses?q=${encodeURIComponent(q)}&chapter=${ch}&limit=40`);

    $('vs-count').textContent = `Showing ${data.verses.length} of ${data.total} verses`;
    $('vs-more').textContent  = data.total > 40 ? `Showing first 40 of ${data.total}. Refine your search to see more.` : '';

    $('vs-list').innerHTML = data.verses.map(v => {
      const text = lang === 'sa' ? v.sa : lang === 'hi' ? v.hi : v.en;
      const aiCorpusBadge = v.ai_corpus ? badge('AI CORPUS') : '';
      const concepts = v.concepts.length
        ? `<div style="margin-top:8px;">${v.concepts.map(c => tag(c.replace(/_inst$/, ''))).join('')}</div>`
        : '';
      return card(`
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;">
          <div class="verse-id">${v.chapter}.${v.verse}</div>${aiCorpusBadge}
        </div>
        ${lang === 'sa' || !lang
          ? `<div class="verse-sa">${(v.sa || '').slice(0, 150)}</div>`
          : ''}
        <div class="verse-en">${(text || '').slice(0, 260)}${(text || '').length > 260 ? '…' : ''}</div>
        ${concepts}
      `, 'verse-card');
    }).join('');
  };

  $('vs-search').addEventListener('click',  load);
  $('vs-q').addEventListener('keydown',     e => e.key === 'Enter' && load());
  $('vs-ch').addEventListener('change',     load);
  $('vs-lang').addEventListener('change',   load);
  load();
};
