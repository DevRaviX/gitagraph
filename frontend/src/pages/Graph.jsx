import { useQuery } from '@tanstack/react-query'
import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X, ExternalLink } from 'lucide-react'
import { api } from '../api'
import { Badge, Card } from '../components/ui'
import { PageHeader } from '../components/layout/PageTransition'

const NODE_COLORS = {
  Attainment:    '#1ABC9C',
  Practice:      '#3498DB',
  YogaPath:      '#9B59B6',
  DownfallCause: '#E74C3C',
  Guna:          '#E67E22',
  EthicalConcept:'#1ABC9C',
  Verse:         '#C9A84C',
  Chapter:       '#7F8C8D',
  Person:        '#F39C12',
}

function nodeColor(n) {
  for (const [k, v] of Object.entries(NODE_COLORS))
    if (n.type?.includes(k) || n.category?.includes(k)) return v
  return '#2A2A42'
}

export default function Graph() {
  const svgRef    = useRef(null)
  const navigate  = useNavigate()
  const [showVerses, setShowVerses]   = useState(false)
  const [selected, setSelected]       = useState(null)
  const [filter, setFilter]           = useState('All')

  // CF data for edge thickness
  const { data: cfAllData } = useQuery({ queryKey: ['cf_all'], queryFn: api.cfAll })

  // Build verse→max-CF map
  const verseCF = {}
  ;(cfAllData?.results ?? []).forEach(r => {
    verseCF[r.verse] = Math.max(...Object.values(r.concept_cfs ?? {}).map(c => c.combined_cf ?? 0), 0)
  })

  const { data, isLoading } = useQuery({
    queryKey: ['graph', showVerses],
    queryFn: () => api.graph(showVerses),
  })

  useEffect(() => {
    if (!data || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = svgRef.current.clientWidth
    const H = svgRef.current.clientHeight

    const nodes = data.nodes.filter(n => filter === 'All' || n.type?.includes(filter) || n.category?.includes(filter))
    const nodeIds = new Set(nodes.map(n => n.id))
    const links  = data.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))

    const g = svg.append('g')

    svg.call(
      d3.zoom()
        .scaleExtent([0.2, 3])
        .on('zoom', e => g.attr('transform', e.transform))
    )

    const sim = d3.forceSimulation(nodes)
      .force('link',   d3.forceLink(links).id(d => d.id).distance(70).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide(18))

    const defs = svg.append('defs')
    defs.append('marker').attr('id','arrow').attr('viewBox','0 -4 8 8')
      .attr('refX',16).attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto')
      .append('path').attr('d','M0,-4L8,0L0,4').attr('fill','#2A2A42')

    // CF scale for edge thickness: 0 → 1px, 1 → 4px
    const cfScale = d3.scaleLinear().domain([0, 1]).range([1, 4]).clamp(true)

    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', d => d.color || '#2A2A42')
      .attr('stroke-width', d => {
        // Use source node CF if it's a verse, else 1.2
        const srcId = typeof d.source === 'object' ? d.source.id : d.source
        const cf = verseCF[srcId] ?? 0
        return cf > 0 ? cfScale(cf) : 1.2
      })
      .attr('stroke-opacity', 0.7)
      .attr('marker-end','url(#arrow)')

    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('cursor','pointer')
      .call(
        d3.drag()
          .on('start', (e,d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y })
          .on('drag',  (e,d) => { d.fx=e.x; d.fy=e.y })
          .on('end',   (e,d) => { if (!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null })
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        setSelected(d)
      })

    node.append('circle')
      .attr('r', d => d.type?.includes('Verse') ? 7 : 9)
      .attr('fill', d => nodeColor(d))
      .attr('stroke','#0A0A10').attr('stroke-width',1.5)
      .attr('opacity', 0.9)

    node.append('text')
      .attr('dy', -13).attr('text-anchor','middle')
      .attr('font-size', 9).attr('fill','#B0A090')
      .text(d => d.label || (d.id.length > 14 ? d.id.slice(0,12)+'…' : d.id))

    sim.on('tick', () => {
      link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y)
          .attr('x2',d=>d.target.x).attr('y2',d=>d.target.y)
      node.attr('transform',d=>`translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [data, filter, verseCF])

  const FILTERS = ['All', 'Verse', 'YogaPath', 'Attainment', 'Practice', 'DownfallCause', 'Guna']

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 pb-0">
        <PageHeader
          title="Knowledge Graph"
          subtitle={`Interactive OWL 2 ontology — ${data?.nodes?.length ?? '…'} nodes, ${data?.links?.length ?? '…'} edges`}
          module="MODULE 2 — Ontology"
          icon={Share2}
        />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  filter === f
                    ? 'border-gold-dim bg-gold-faint text-gold'
                    : 'border-border text-ink-2 hover:border-border-bright hover:text-ink-1'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-ink-2 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={showVerses}
              onChange={e => setShowVerses(e.target.checked)}
              className="w-auto accent-gold"
            />
            Show verse nodes
          </label>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="flex-1 relative mx-6 mb-6 rounded-xl overflow-hidden border border-border bg-bg-2">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-ink-2">Loading knowledge graph…</span>
            </div>
          </div>
        )}
        <svg ref={svgRef} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass rounded-xl p-3 border border-border">
          <p className="label mb-2">Node Types</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(NODE_COLORS).slice(0,6).map(([k,v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: v }} />
                <span className="text-[10px] text-ink-2">{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Node detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-4 right-4 w-72 glass-gold rounded-xl border border-gold/30 p-4 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: nodeColor(selected) }} />
                  <span className="font-semibold text-sm text-ink-1">{selected.id}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-ink-3 hover:text-ink-1 transition-colors">
                  <X size={14} />
                </button>
              </div>
              {selected.type && <Badge variant="gold" className="mb-3">{selected.type}</Badge>}
              {selected.definition && (
                <p className="text-xs text-ink-2 leading-relaxed mb-2">{selected.definition}</p>
              )}
              {selected.translation && (
                <p className="text-xs text-ink-2 leading-relaxed border-t border-border pt-2 mt-2">
                  {selected.translation}
                </p>
              )}
              {selected.chapter && (
                <p className="text-xs text-ink-3 mt-2">Chapter {selected.chapter}</p>
              )}
              {selected.type?.includes('Verse') && selected.chapter && selected.verse_number && (
                <button
                  onClick={() => navigate(`/verses?chapter=${selected.chapter}&verse=${selected.verse_number}`)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-gold border border-gold-dim rounded-lg py-1.5 hover:bg-gold-faint transition-colors"
                >
                  <ExternalLink size={11} /> Open in Verse Browser
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
