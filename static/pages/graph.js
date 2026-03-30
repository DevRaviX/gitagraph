/* pages/graph.js — D3 Force-directed Knowledge Graph with click-to-inspect */
'use strict';

Pages.graph = async () => {
  setContent(`
    ${pageHeader('Knowledge Graph', 'Interactive RDF graph · Click nodes to inspect · D3 Force Layout', 'MODULE 2 · OWL ONTOLOGY')}
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
      <label style="display:flex;align-items:center;gap:6px;font-size:0.82rem;color:var(--text2);cursor:pointer;">
        <input type="checkbox" id="kg-verses" checked style="accent-color:var(--gold);"> Show Verse Nodes
      </label>
      <select id="kg-filter" class="select-field btn-sm">
        <option value="">All Types</option>
        <option value="Attainment">Attainment</option>
        <option value="Practice">Practice</option>
        <option value="YogaPath">Yoga Path</option>
        <option value="DownfallCause">Downfall Cause</option>
        <option value="Guna">Guna</option>
        <option value="EthicalConcept">Ethical Concept</option>
      </select>
      <button class="btn btn-ghost btn-sm" id="kg-reset">⟳ Reset</button>
    </div>
    <div class="graph-container" style="height:520px;" id="graph-wrap">
      <svg id="graph-svg" style="width:100%;height:520px;"></svg>
    </div>
    <div class="graph-legend" id="graph-legend"></div>
  `);

  let allData = null;

  const loadGraph = async () => {
    const showV = $('kg-verses').checked;
    const filterCat = $('kg-filter').value;
    allData = allData || await api(`/api/graph?verses=true`);
    let nodes = allData.nodes.filter(n => showV || n.type !== 'Verse');
    if (filterCat) nodes = nodes.filter(n => n.category === filterCat || n.type !== 'Concept');
    const nodeIds = new Set(nodes.map(n => n.id));
    const links  = allData.links.filter(l => nodeIds.has(l.source?.id || l.source) && nodeIds.has(l.target?.id || l.target));
    renderD3({ nodes: nodes.map(n => ({ ...n })), links: links.map(l => ({ ...l })) });
  };

  $('kg-verses').addEventListener('change', loadGraph);
  $('kg-filter').addEventListener('change', loadGraph);
  $('kg-reset').addEventListener('click',   () => { allData = null; loadGraph(); });
  loadGraph();
};

function renderD3({ nodes, links }) {
  const wrap = $('graph-wrap');
  const W = wrap.clientWidth, H = 520;
  d3.select('#graph-svg').selectAll('*').remove();

  const svg = d3.select('#graph-svg').attr('viewBox', `0 0 ${W} ${H}`);
  const g   = svg.append('g');

  svg.call(d3.zoom().scaleExtent([0.15, 5])
    .on('zoom', e => g.attr('transform', e.transform)));

  const sim = d3.forceSimulation(nodes)
    .force('link',    d3.forceLink(links).id(d => d.id).distance(80).strength(0.4))
    .force('charge',  d3.forceManyBody().strength(-220))
    .force('center',  d3.forceCenter(W / 2, H / 2))
    .force('collide', d3.forceCollide(24));

  /* Arrow markers */
  const defs = svg.append('defs');
  ['#444', '#C9A84C', '#3498DB', '#E74C3C', '#9B59B6', '#1ABC9C', '#E67E22'].forEach(col => {
    defs.append('marker').attr('id', `arr-${col.replace('#', '')}`)
      .attr('viewBox', '0 -4 8 8').attr('refX', 18).attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', col).attr('opacity', 0.7);
  });

  const link = g.append('g').selectAll('line').data(links).join('line')
    .attr('stroke', d => d.color || '#444')
    .attr('stroke-width', 1.2)
    .attr('stroke-opacity', 0.5)
    .attr('marker-end', d => `url(#arr-${(d.color || '#444').replace('#', '')})`);

  const node = g.append('g').selectAll('g').data(nodes).join('g')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
    .on('click',         (e, d) => openNodePanel(d))
    .on('mouseover',     (e, d) => highlightNeighbours(d, nodes, links, node, link))
    .on('mouseout',      ()     => resetHighlight(node, link));

  node.append('circle')
    .attr('r',            d => d.size || 8)
    .attr('fill',         d => d.color || '#666')
    .attr('stroke',       'rgba(255,255,255,0.12)')
    .attr('stroke-width', 1.5);

  node.append('text')
    .attr('dy', '1.9em').attr('text-anchor', 'middle')
    .style('font-size', '7px').style('fill', '#B0A090').style('pointer-events', 'none')
    .text(d => (d.label || '').slice(0, 14));

  node.append('title').text(d => `${d.id}\nType: ${d.type}\nCategory: ${d.category}`);

  sim.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  /* Legend */
  const cats = [['Attainment','#2ECC71'],['Practice','#3498DB'],['YogaPath','#9B59B6'],
                ['DownfallCause','#E74C3C'],['Guna','#E67E22'],['Verse','#C9A84C']];
  $('graph-legend').innerHTML = cats.map(([c, col]) =>
    `<div class="legend-item"><div class="legend-dot" style="background:${col}"></div>${c}</div>`).join('');
}

function highlightNeighbours(d, nodes, links, node, link) {
  const connected = new Set([d.id]);
  links.forEach(l => {
    const s = l.source?.id || l.source, t = l.target?.id || l.target;
    if (s === d.id) connected.add(t);
    if (t === d.id) connected.add(s);
  });
  node.style('opacity', n => connected.has(n.id) ? 1 : 0.2);
  link.style('opacity', l => {
    const s = l.source?.id || l.source, t = l.target?.id || l.target;
    return s === d.id || t === d.id ? 1 : 0.05;
  });
}

function resetHighlight(node, link) {
  node.style('opacity', 1);
  link.style('opacity', 0.5);
}

function openNodePanel(d) {
  const yogaEmoji = { KarmaYoga: '⚡', JnanaYoga: '📚', DhyanaYoga: '🧘', BhaktiYoga: '🙏' };
  $('panel-content').innerHTML = `
    <div class="panel-title">${d.id.replace(/_inst$/, '').replace(/_/g, ' ')}</div>
    <div class="panel-type">${d.type} · ${d.category || '—'}</div>
    ${d.definition ? `<div style="font-size:0.82rem;color:var(--text2);margin:10px 0;line-height:1.6;">${d.definition}</div>` : ''}
    ${d.translation ? `<div style="font-size:0.82rem;color:var(--text2);font-style:italic;margin:8px 0;line-height:1.6;">${d.translation}</div>` : ''}
    ${d.type === 'Verse' ? `
      <div class="panel-section-title">VERSE INFO</div>
      <div style="font-size:0.82rem;color:var(--text2);margin-bottom:4px;">
        Chapter ${d.chapter} · Verse ${d.verse_number} ·
        <span style="color:var(--gold)">${d.speaker || '—'}</span>
      </div>
      ${cfBar(d.certainty || 0, 'Interpretive Certainty')}
    ` : ''}
    <div class="panel-section-title">NODE ID</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:0.74rem;color:var(--text3);">${d.id}</div>
    <div style="margin-top:10px;"><span class="tag" style="border-color:${d.color}44;color:${d.color};">${d.color}</span></div>
  `;
  $('node-panel').classList.add('open');
}
