/* pages/home.js — Home dashboard with stats + radar chart + module cards */
'use strict';

Pages.home = async () => {
  const s = await api('/api/stats');
  setContent(`
    ${pageHeader('Digital Bhaṣya', "Intelligent Gītā Reader's Assistant — Knowledge · Search · Inference · CSP · Uncertainty")}
    <div class="metric-grid">
      ${metricCard(s.total_verses,  'Total Verses',      0)}
      ${metricCard(s.ai_verses,     'AI Corpus Verses',  0.08)}
      ${metricCard(s.concepts,      'Concepts',          0.16)}
      ${metricCard(s.edges,         'Graph Edges',       0.24)}
      ${metricCard(s.rdf_triples,   'RDF Triples',       0.32)}
      ${metricCard(s.modules,       'AI Modules',        0.40)}
    </div>

    <div class="grid-2" style="margin:20px 0;">
      <div>
        <div style="font-size:0.72rem;color:var(--text3);letter-spacing:1.5px;margin-bottom:10px;">SYSTEM INTELLIGENCE RADAR</div>
        <div id="home-radar"></div>
      </div>
      <div>
        <div style="font-size:0.72rem;color:var(--text3);letter-spacing:1.5px;margin-bottom:10px;">PEAS FRAMEWORK</div>
        ${card(`
          <div style="display:grid;gap:10px;">
            ${[
              ['⚡ Performance', 'Relevant verses retrieved · Shortest paths found · Valid study plans'],
              ['🌍 Environment', '30-verse RDF KG · 23 concepts · Partially observable · Sequential'],
              ['🎯 Actuators',   'Returns verses · Traces chains · Generates study plans'],
              ['👁️ Sensors',     "Reader's concern · Stated goal · Experience stage · Tradition preference"],
            ].map(([k, v]) => `<div>
              <span style="color:var(--gold);font-weight:600;">${k}</span><br>
              <span style="font-size:0.82rem;color:var(--text2);">${v}</span>
            </div>`).join('')}
          </div>
        `)}
      </div>
    </div>

    <div style="font-size:0.72rem;color:var(--text3);letter-spacing:1.5px;margin-bottom:12px;">AI MODULES</div>
    <div class="grid-3">
      ${[
        ['🧬','Knowledge Representation', 'OWL ontology · 16 classes · TransitiveProperty · 658 RDF triples'],
        ['🔍','Graph Search',             'BFS · DFS · A* to Moksha (admissible heuristic) · IDDFS'],
        ['⚡','Expert System',            '8 production rules · Forward chaining · SPARQL · Property chain'],
        ['📅','CSP Study Planner',        'Backtracking CSP · MRV heuristic · Forward checking · 5 constraints'],
        ['🌫️','Uncertainty Handling',     'MYCIN CF · Fuzzy yoga-path membership · Non-monotonic belief revision'],
        ['🤖','Agent Architecture',       'PEAS framework · Environment classification · Goal-based design'],
      ].map(([ico, title, desc]) => card(`
        <div style="font-size:1.6rem;margin-bottom:8px;">${ico}</div>
        <div style="font-family:Cinzel,serif;font-size:0.92rem;color:var(--text1);margin-bottom:6px;">${title}</div>
        <div style="font-size:0.78rem;color:var(--text2);line-height:1.55;">${desc}</div>
      `, 'spotlight-card')).join('')}
    </div>
  `);

  Plotly.newPlot('home-radar', [{
    type: 'scatterpolar', fill: 'toself',
    r:     [9, 8, 8, 7, 8, 7, 9],
    theta: ['Knowledge Rep.','Graph Search','Expert Rules','CSP Planning','Uncertainty','Explainability','Knowledge Rep.'],
    fillcolor: 'rgba(201,168,76,0.12)',
    line: { color: '#C9A84C', width: 2 },
    hovertemplate: '%{theta}: %{r}/10<extra></extra>',
  }], {
    polar: {
      radialaxis:  { range: [0, 10], color: '#706050', gridcolor: '#2A2A42', tickfont: { size: 8, color: '#706050' } },
      angularaxis: { color: '#B0A090', gridcolor: '#2A2A42' },
      bgcolor: 'rgba(0,0,0,0)',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    showlegend: false, height: 280,
    margin: { l: 60, r: 60, t: 10, b: 20 },
    font: { family: 'Inter', color: '#B0A090' },
  }, { displayModeBar: false });
};
