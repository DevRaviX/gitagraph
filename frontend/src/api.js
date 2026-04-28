const BASE = '/api'

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

export const api = {
  stats:          ()           => req('GET',  '/stats'),
  verses:         (q,ch)       => req('GET',  `/verses?q=${encodeURIComponent(q||'')}&chapter=${encodeURIComponent(ch||'')}&limit=1000`),
  graph:          (verses)     => req('GET',  `/graph?verses=${verses}`),
  concepts:       ()           => req('GET',  '/concepts'),
  bfs:            (b)          => req('POST', '/bfs',              b),
  dfs:            (b)          => req('POST', '/dfs',              b),
  astar:          (b)          => req('POST', '/astar',            b),
  infer:          (b)          => req('POST', '/infer',            b),
  solve:          (b)          => req('POST', '/solve',            b),
  profiles:       ()           => req('GET',  '/profiles'),
  plan:           (b)          => req('POST', '/plan',             b),
  cf:             (b)          => req('POST', '/cf',               b),
  cfAll:          ()           => req('GET',  '/cf/all'),
  fuzzy:          (verse)      => req('GET',  `/fuzzy/${verse}`),
  belief:         (b)          => req('POST', '/belief',           b),
  sparql:         (cq)         => req('GET',  `/sparql/${cq}`),
  // Semantic search (RAG)
  semanticSearch: (q, k)       => req('GET',  `/semantic_search?q=${encodeURIComponent(q||'')}&k=${k||10}`),
  // Study plan persistence
  plansSave:      (b)          => req('POST', '/plans/save',       b),
  plansList:      (sid)        => req('GET',  `/plans/list?session_id=${sid||'default'}`),
  // Verse progress tracking
  progressUpdate: (b)          => req('POST', '/progress/update',  b),
  progressGet:    (sid)        => req('GET',  `/progress/get?user_session_id=${sid||'default'}`),
  // IDDFS search
  iddfs:          (b)          => req('POST', '/iddfs',            b),
  // Ollama
  ollamaStatus:   ()           => req('GET',  '/ollama_status'),
  contextualize:  (b)          => req('POST', '/contextualize',    b),
}
