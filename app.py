"""
app.py — Digital Bhaṣya: Intelligent Gītā Reader's Assistant
Premium Streamlit UI with animations, interactive knowledge graph,
and full integration of all 6 AI modules.
"""

import os
import sys
import csv
import json
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import networkx as nx
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── Page config (must be first Streamlit call) ────────────────────────────────
st.set_page_config(
    page_title="Digital Bhaṣya — Gītā Reader's Assistant",
    page_icon="🪷",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={"About": "Digital Bhaṣya — AI Minor Project | Bhagavad Gītā Knowledge System"}
)

# ── Load CSV dataset ──────────────────────────────────────────────────────────
CSV_PATH = os.path.join(os.path.dirname(__file__), "Bhagwad_Gita.csv")

@st.cache_data
def load_gita_csv():
    rows = []
    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

# ── Load knowledge graph ──────────────────────────────────────────────────────
@st.cache_resource
def load_kg():
    from modules.knowledge_graph import GitaKnowledgeGraph
    return GitaKnowledgeGraph()

# ── CSS: Premium Animated Dark Theme ─────────────────────────────────────────
def inject_css():
    st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Noto+Serif+Devanagari:wght@400;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Variables ── */
:root {
  --gold:        #C9A84C;
  --gold-light:  #F0D060;
  --gold-dim:    #8A6E2A;
  --saffron:     #FF9933;
  --crimson:     #C0392B;
  --teal:        #1ABC9C;
  --bg:          #0A0A10;
  --bg2:         #12121C;
  --bg3:         #1A1A28;
  --bg4:         #22223A;
  --border:      #2A2A42;
  --text1:       #EDE8DC;
  --text2:       #B0A090;
  --text3:       #706050;
}

/* ── Global ── */
* { box-sizing: border-box; }

html, body, .stApp {
  background: var(--bg) !important;
  color: var(--text1) !important;
  font-family: 'Inter', sans-serif !important;
}

/* ── Animated cosmic background ── */
.stApp {
  background:
    radial-gradient(ellipse at 20% 20%, rgba(201,168,76,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(255,153,51,0.03) 0%, transparent 60%),
    linear-gradient(180deg, #0A0A10 0%, #0E0E1A 50%, #0A0A10 100%) !important;
  background-attachment: fixed !important;
}

/* ── Keyframes ── */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.15), 0 0 40px rgba(201,168,76,0.05); }
  50%       { box-shadow: 0 0 40px rgba(201,168,76,0.35), 0 0 80px rgba(201,168,76,0.12); }
}
@keyframes float-up {
  from { opacity:0; transform: translateY(28px); }
  to   { opacity:1; transform: translateY(0);    }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes lotus-bloom {
  0%   { transform: scale(0.8) rotate(-5deg); opacity:0; }
  100% { transform: scale(1)   rotate(0deg);  opacity:1; }
}
@keyframes text-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}
@keyframes border-travel {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── Hero ── */
.hero-container {
  text-align: center;
  padding: 2.5rem 1rem 1.5rem;
  animation: float-up 0.8s ease-out;
}
.om-glyph {
  font-family: 'Noto Serif Devanagari', serif;
  font-size: 4rem;
  color: var(--gold);
  display: block;
  animation: text-float 4s ease-in-out infinite;
  text-shadow: 0 0 40px rgba(201,168,76,0.8), 0 0 80px rgba(201,168,76,0.3);
  margin-bottom: 0.5rem;
  line-height: 1;
}
.hero-title {
  font-family: 'Cinzel', serif;
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(90deg, #8A6E2A, #C9A84C, #F0D060, #FF9933, #F0D060, #C9A84C, #8A6E2A);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 5s linear infinite;
  margin: 0 0 0.3rem;
  line-height: 1.1;
}
.hero-sanskrit {
  font-family: 'Noto Serif Devanagari', serif;
  font-size: 1.3rem;
  color: rgba(201,168,76,0.85);
  margin: 0.3rem 0;
  text-shadow: 0 0 20px rgba(201,168,76,0.4);
}
.hero-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  color: var(--text2);
  margin-top: 0.5rem;
  animation: float-up 1.2s ease-out;
}
.hero-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-dim), var(--saffron), var(--gold-dim), transparent);
  margin: 1.5rem 0;
  animation: border-travel 4s ease infinite;
  background-size: 200% 200%;
}

/* ── Cards ── */
.gita-card {
  background: linear-gradient(135deg, var(--bg3) 0%, var(--bg4) 100%);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px 22px;
  margin: 10px 0;
  position: relative;
  overflow: hidden;
  animation: float-up 0.6s ease-out, glow-pulse 4s ease-in-out infinite;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.gita-card::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  animation: shimmer 3s linear infinite;
}
.gita-card:hover {
  transform: translateY(-3px) scale(1.005);
  border-color: rgba(201,168,76,0.5);
  box-shadow: 0 12px 40px rgba(201,168,76,0.12), 0 0 0 1px rgba(201,168,76,0.08);
}

/* ── Metric cards ── */
.metric-grid { display:flex; gap:14px; flex-wrap:wrap; margin: 1rem 0; }
.metric-card {
  flex:1; min-width:120px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
  animation: float-up 0.8s ease-out;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.metric-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), var(--saffron));
}
.metric-card:hover {
  border-color: var(--gold-dim);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(201,168,76,0.15);
}
.metric-val { font-family:'Cinzel',serif; font-size:2.2rem; color:var(--gold); font-weight:700; line-height:1; }
.metric-lbl { font-size:0.75rem; color:var(--text2); margin-top:4px; text-transform:uppercase; letter-spacing:1px; }

/* ── Verse cards ── */
.verse-id {
  font-family:'Cinzel',serif; font-size:0.75rem;
  color:var(--saffron); letter-spacing:2px; font-weight:600;
  text-transform:uppercase; margin-bottom:6px;
}
.verse-translation {
  font-size:1.02rem; color:var(--text1); line-height:1.75; margin-bottom:10px;
}
.verse-sanskrit {
  font-family:'Noto Serif Devanagari',serif; font-size:0.95rem;
  color:rgba(201,168,76,0.7); line-height:1.7; margin-bottom:8px;
}
.verse-context {
  font-size:0.82rem; color:var(--text2); font-style:italic;
  border-left:2px solid var(--gold-dim); padding-left:10px; margin-top:8px;
}
.speaker-badge {
  display:inline-block; padding:2px 10px; border-radius:20px;
  font-size:0.7rem; font-weight:600; letter-spacing:1px;
  text-transform:uppercase; margin-bottom:8px;
}
.speaker-krishna { background:rgba(201,168,76,0.15); border:1px solid rgba(201,168,76,0.4); color:var(--gold); }
.speaker-arjuna  { background:rgba(26,188,156,0.10); border:1px solid rgba(26,188,156,0.4); color:var(--teal);  }

/* ── Concept tags ── */
.tag {
  display:inline-block;
  background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.25);
  color:var(--gold); padding:3px 10px; border-radius:20px;
  font-size:0.72rem; margin:3px 3px 3px 0;
  transition: all 0.2s ease;
  cursor: default;
}
.tag:hover { background:rgba(201,168,76,0.2); border-color:var(--gold); }

.tag-downfall { background:rgba(192,57,43,0.1); border-color:rgba(192,57,43,0.4); color:#E74C3C; }
.tag-attainment{ background:rgba(46,204,113,0.1); border-color:rgba(46,204,113,0.4); color:#2ECC71; }
.tag-practice { background:rgba(52,152,219,0.1); border-color:rgba(52,152,219,0.4); color:#3498DB; }
.tag-yoga     { background:rgba(155,89,182,0.1); border-color:rgba(155,89,182,0.4); color:#9B59B6; }

/* ── Path chain ── */
.path-chain {
  display:flex; align-items:center; flex-wrap:wrap; gap:6px;
  padding:14px 16px;
  background:rgba(201,168,76,0.04);
  border:1px solid rgba(201,168,76,0.15);
  border-radius:12px;
  animation: float-up 0.6s ease-out;
}
.path-node {
  background:rgba(201,168,76,0.12); border:1px solid rgba(201,168,76,0.35);
  color:var(--gold-light); padding:7px 14px; border-radius:8px;
  font-size:0.88rem; font-weight:500; transition: all 0.2s;
}
.path-node:hover { background:rgba(201,168,76,0.22); }
.path-node.goal { background:rgba(46,204,113,0.15); border-color:rgba(46,204,113,0.5); color:#2ECC71; }
.path-arrow { color:var(--saffron); font-size:1.1rem; font-weight:bold; }

/* ── Study plan ── */
.session-card {
  background:linear-gradient(135deg, var(--bg3), var(--bg4));
  border:1px solid var(--border);
  border-left:4px solid var(--gold);
  border-radius:0 12px 12px 0;
  padding:14px 18px; margin:8px 0;
  animation: float-up 0.5s ease-out;
  transition: all 0.3s ease;
}
.session-card:hover { transform:translateX(4px); border-left-color:var(--saffron); }
.session-num {
  font-family:'Cinzel',serif; font-size:0.7rem; color:var(--saffron);
  text-transform:uppercase; letter-spacing:2px; margin-bottom:4px;
}
.session-theme { font-size:0.82rem; color:var(--text2); margin-top:4px; font-style:italic; }

/* ── CF bar ── */
.cf-row { margin:8px 0; }
.cf-label { font-size:0.8rem; color:var(--text2); margin-bottom:3px; }
.cf-bar-bg { background:var(--bg4); border-radius:6px; height:8px; overflow:hidden; }
.cf-bar { height:100%; border-radius:6px; transition:width 1s ease;
  background:linear-gradient(90deg, var(--gold), var(--saffron)); }

/* ── Fuzzy circles ── */
.fuzzy-grid { display:flex; gap:12px; flex-wrap:wrap; margin:12px 0; }
.fuzzy-item {
  text-align:center; flex:1; min-width:80px;
  padding:12px 8px;
  background:var(--bg3); border:1px solid var(--border);
  border-radius:12px; transition: all 0.3s;
}
.fuzzy-item:hover { border-color:var(--gold-dim); }
.fuzzy-mu { font-family:'Cinzel',serif; font-size:1.6rem; font-weight:700; }
.fuzzy-path { font-size:0.7rem; color:var(--text2); margin-top:2px; }

/* ── Rule fire log ── */
.rule-fired {
  background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.2);
  border-radius:8px; padding:8px 12px; margin:5px 0;
  font-size:0.82rem; color:var(--text2);
  animation: fade-in 0.4s ease-out;
}
.rule-name { color:var(--gold); font-weight:600; font-family:'JetBrains Mono',monospace; }

/* ── Belief retract ── */
.belief-active   { color:#2ECC71; font-size:0.85rem; padding:4px 0; }
.belief-retracted{ color:var(--crimson); font-size:0.85rem; text-decoration:line-through; padding:4px 0; }
.belief-source   { font-size:0.72rem; color:var(--text3); }

/* ── Sidebar ── */
[data-testid="stSidebar"] {
  background:linear-gradient(180deg, #0D0D18 0%, #0A0A12 100%) !important;
  border-right:1px solid var(--border) !important;
}
[data-testid="stSidebar"] .stRadio label { color:var(--text2) !important; font-size:0.9rem; }
[data-testid="stSidebar"] .stRadio label:hover { color:var(--gold) !important; }

/* ── Streamlit overrides ── */
h1,h2,h3,h4 { font-family:'Cinzel',serif !important; color:var(--text1) !important; }
h1 { font-size:1.8rem !important; }
h2 { font-size:1.3rem !important; color:var(--gold) !important; }
h3 { font-size:1.1rem !important; }
p, li, .stMarkdown { color:var(--text1) !important; }
.stButton>button {
  background:linear-gradient(135deg, var(--gold-dim), var(--gold)) !important;
  color:#0A0A10 !important; border:none !important; border-radius:8px !important;
  font-family:'Cinzel',serif !important; font-weight:700 !important;
  letter-spacing:1px !important; transition:all 0.3s ease !important;
  padding:10px 24px !important;
}
.stButton>button:hover {
  transform:translateY(-2px) !important;
  box-shadow:0 8px 24px rgba(201,168,76,0.35) !important;
}
.stTextInput>div>div>input,
.stTextArea>div>div>textarea,
.stSelectbox>div>div {
  background:var(--bg3) !important; border:1px solid var(--border) !important;
  color:var(--text1) !important; border-radius:8px !important;
}
.stSelectbox>div>div:focus-within { border-color:var(--gold) !important; }
[data-testid="stMetricValue"] { color:var(--gold) !important; font-family:'Cinzel',serif !important; }
[data-testid="stMetricLabel"] { color:var(--text2) !important; }
::-webkit-scrollbar { width:5px; height:5px; }
::-webkit-scrollbar-track { background:var(--bg2); }
::-webkit-scrollbar-thumb { background:var(--gold-dim); border-radius:3px; }
::-webkit-scrollbar-thumb:hover { background:var(--gold); }
.stTabs [data-baseweb="tab"] { color:var(--text2) !important; font-family:'Cinzel',serif !important; font-size:0.85rem !important; }
.stTabs [aria-selected="true"] { color:var(--gold) !important; border-bottom-color:var(--gold) !important; }
hr { border-color:var(--border) !important; }
.stAlert { background:var(--bg3) !important; border:1px solid var(--border) !important; }
</style>
""", unsafe_allow_html=True)

# ── Helper: render HTML safely ────────────────────────────────────────────────
def html(content: str):
    st.markdown(content, unsafe_allow_html=True)

# ── Helper: tag color by category ─────────────────────────────────────────────
CATEGORY_TAG_CLASS = {
    "DownfallCause": "tag-downfall",
    "Attainment":    "tag-attainment",
    "Practice":      "tag-practice",
    "YogaPath":      "tag-yoga",
    "Guna":          "tag-yoga",
    "EthicalConcept":"tag-practice",
}

def concept_tag(concept_name: str, kg=None, category: str = "") -> str:
    if kg and concept_name in kg.nodes:
        category = kg.nodes[concept_name].category
    cls = CATEGORY_TAG_CLASS.get(category, "tag")
    display = concept_name.replace("_inst", "").replace("_", " ")
    return f'<span class="tag {cls}">{display}</span>'

# ── Helper: verse card HTML ───────────────────────────────────────────────────
def verse_card_html(verse_node, kg, show_sanskrit=True) -> str:
    speaker_cls = "speaker-krishna" if verse_node.speaker == "Krishna" else "speaker-arjuna"
    concepts = list(kg.neighbours_by_edge(verse_node.name, "teaches"))
    tags_html = "".join(concept_tag(c, kg) for c in concepts)
    sanskrit_block = ""
    if show_sanskrit and verse_node.sanskrit:
        sanskrit_block = f'<div class="verse-sanskrit">{verse_node.sanskrit}</div>'
    context_block = ""
    if verse_node.context:
        context_block = f'<div class="verse-context">{verse_node.context}</div>'
    cf_bar = int(verse_node.certainty * 100)
    return f"""
<div class="gita-card">
  <div class="verse-id">Verse {verse_node.chapter_number}.{verse_node.verse_number}</div>
  <span class="speaker-badge {speaker_cls}">{verse_node.speaker}</span>
  {sanskrit_block}
  <div class="verse-translation">{verse_node.translation}</div>
  {context_block}
  <div style="margin-top:10px;">{tags_html}</div>
  <div style="margin-top:10px;">
    <div style="font-size:0.72rem;color:var(--text3);margin-bottom:3px;">Interpretive confidence</div>
    <div class="cf-bar-bg"><div class="cf-bar" style="width:{cf_bar}%"></div></div>
  </div>
</div>"""

# ═══════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ═══════════════════════════════════════════════════════════════════════════════
def render_sidebar():
    with st.sidebar:
        html('<div class="om-glyph" style="font-size:3rem;text-align:center;margin-bottom:8px;">ॐ</div>')
        html('<div style="font-family:Cinzel,serif;font-size:1rem;color:#C9A84C;text-align:center;letter-spacing:3px;margin-bottom:20px;">DIGITAL BHAṢYA</div>')
        st.divider()

        page = st.radio("Navigate", [
            "🏠  Home",
            "📖  Verse Browser",
            "🕸️  Knowledge Graph",
            "🧠  Ask the Gītā",
            "🔍  Graph Search",
            "📅  Study Planner",
            "❓  Uncertainty",
            "💡  Expert System",
        ], label_visibility="collapsed")

        st.divider()
        html('<div style="font-size:0.72rem;color:#606060;text-align:center;padding:8px 0;">Knowledge Representation · Search<br>Inference · CSP · Uncertainty<br><br>Bhagavad Gītā Chapters 2, 3, 6</div>')
        return page

# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: HOME
# ═══════════════════════════════════════════════════════════════════════════════
def page_home(kg, gita_data):
    html("""
<div class="hero-container">
  <span class="om-glyph">ॐ</span>
  <div class="hero-title">Digital Bhaṣya</div>
  <div class="hero-sanskrit">बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते</div>
  <div class="hero-sub">Intelligent Gītā Reader's Assistant — Knowledge · Search · Inference · CSP · Uncertainty</div>
  <div class="hero-divider"></div>
</div>""")

    stats = kg.stats()
    total_verses = len(gita_data)
    html(f"""
<div class="metric-grid">
  <div class="metric-card"><div class="metric-val">{total_verses}</div><div class="metric-lbl">Total Verses (All 18 Ch.)</div></div>
  <div class="metric-card"><div class="metric-val">{stats['verses']}</div><div class="metric-lbl">AI Corpus Verses</div></div>
  <div class="metric-card"><div class="metric-val">{stats['concepts']}</div><div class="metric-lbl">Philosophical Concepts</div></div>
  <div class="metric-card"><div class="metric-val">{stats['edges']}</div><div class="metric-lbl">RDF Graph Edges</div></div>
  <div class="metric-card"><div class="metric-val">{stats['rdf_triples']}</div><div class="metric-lbl">RDF Triples</div></div>
  <div class="metric-card"><div class="metric-val">6</div><div class="metric-lbl">AI Modules</div></div>
</div>""")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("PEAS Framework")
        html("""<div class="gita-card">
  <div style="display:grid;gap:10px;">
    <div><span style="color:#C9A84C;font-weight:600;">⚡ Performance</span><br><span style="font-size:0.85rem;color:#B0A090;">Relevant verses retrieved · Shortest paths found · Valid study plans · Consistent inferences</span></div>
    <div><span style="color:#C9A84C;font-weight:600;">🌍 Environment</span><br><span style="font-size:0.85rem;color:#B0A090;">30-verse RDF KG · 23 concepts · Partially observable · Sequential · Deterministic</span></div>
    <div><span style="color:#C9A84C;font-weight:600;">🎯 Actuators</span><br><span style="font-size:0.85rem;color:#B0A090;">Returns verses · Traces chains · Generates study plans · Flags uncertain interpretations</span></div>
    <div><span style="color:#C9A84C;font-weight:600;">👁️ Sensors</span><br><span style="font-size:0.85rem;color:#B0A090;">Reader's concern · Stated goal · Experience stage · Commentary tradition preference</span></div>
  </div>
</div>""")

    with col2:
        st.subheader("Environment Classification")
        html("""<div class="gita-card">
  <div style="display:grid;gap:6px;font-size:0.85rem;">
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2A2A42;">
      <span style="color:#B0A090;">Observable</span><span style="color:#FF9933;font-weight:600;">Partially Observable</span></div>
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2A2A42;">
      <span style="color:#B0A090;">Agents</span><span style="color:#FF9933;font-weight:600;">Single Agent</span></div>
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2A2A42;">
      <span style="color:#B0A090;">Deterministic</span><span style="color:#2ECC71;font-weight:600;">Deterministic</span></div>
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2A2A42;">
      <span style="color:#B0A090;">Episodic/Sequential</span><span style="color:#FF9933;font-weight:600;">Sequential ⚠</span></div>
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2A2A42;">
      <span style="color:#B0A090;">Static/Dynamic</span><span style="color:#2ECC71;font-weight:600;">Static</span></div>
    <div style="display:flex;justify-content:space-between;padding:4px 0;">
      <span style="color:#B0A090;">Discrete/Continuous</span><span style="color:#2ECC71;font-weight:600;">Discrete</span></div>
  </div>
</div>""")

    st.subheader("AI Modules")
    modules = [
        ("🗂️ Module 1", "Agent Architecture", "PEAS framework · Environment classification · State space · Goal-based agent design"),
        ("🧬 Module 2", "Knowledge Representation", "OWL ontology · 16 classes · TransitiveProperty · SymmetricProperty · PropertyChain axiom · 30 verse RDF instances"),
        ("🔍 Module 3", "Graph Search", "BFS reading list · DFS downfall chain · A* to Moksha (admissible heuristic) · IDDFS"),
        ("⚡ Module 4", "Inference & Expert System", "8 production rules · Forward chaining · SPARQL for all 8 CQs · Property chain inference"),
        ("📅 Module 5", "CSP Study Planner", "Backtracking CSP · MRV heuristic · Forward checking · 5 constraints"),
        ("🌫️ Module 6", "Uncertainty Handling", "MYCIN CF combination · Fuzzy yoga-path membership · Non-monotonic belief revision"),
    ]
    cols = st.columns(3)
    for i, (num, title, desc) in enumerate(modules):
        with cols[i % 3]:
            html(f"""<div class="gita-card" style="min-height:130px;">
  <div style="font-size:0.7rem;color:#FF9933;font-family:Cinzel,serif;letter-spacing:1px;">{num}</div>
  <div style="font-family:Cinzel,serif;font-size:0.95rem;color:#EDE8DC;margin:5px 0;">{title}</div>
  <div style="font-size:0.78rem;color:#B0A090;line-height:1.5;">{desc}</div>
</div>""")


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: VERSE BROWSER (uses full CSV dataset)
# ═══════════════════════════════════════════════════════════════════════════════
def page_verse_browser(kg, gita_data):
    html('<div class="hero-container" style="padding:1rem 0 0.5rem;"><div class="hero-title" style="font-size:2rem;">Verse Browser</div><div class="hero-sub">All 701 verses · Bhagavad Gītā · Searchable · Filterable</div></div>')

    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        search = st.text_input("Search verses", placeholder="Search Sanskrit, English, Hindi...", label_visibility="collapsed")
    with col2:
        chapters = ["All Chapters"] + [str(i) for i in range(1, 19)]
        ch_filter = st.selectbox("Chapter", chapters, label_visibility="collapsed")
    with col3:
        lang = st.selectbox("Language", ["English", "Hindi", "Sanskrit", "All"], label_visibility="collapsed")

    # Filter data
    filtered = gita_data
    if ch_filter != "All Chapters":
        filtered = [r for r in filtered if r["Chapter"] == ch_filter]
    if search:
        s = search.lower()
        filtered = [r for r in filtered if
                    s in r.get("EngMeaning","").lower() or
                    s in r.get("HinMeaning","").lower() or
                    s in r.get("Shloka","").lower() or
                    s in r.get("Transliteration","").lower()]

    html(f'<div style="font-size:0.8rem;color:#706050;margin:8px 0;">Showing {len(filtered)} verses</div>')

    # Display
    for row in filtered[:50]:
        ch = row["Chapter"]; v = row["Verse"]
        is_ai_verse = f"Verse_{ch}_{v}" in kg.nodes
        ai_badge = '<span style="background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.4);color:#C9A84C;font-size:0.65rem;padding:2px 8px;border-radius:10px;margin-left:8px;">AI CORPUS</span>' if is_ai_verse else ""

        content = ""
        if lang in ("Sanskrit", "All"):
            content += f'<div class="verse-sanskrit">{row.get("Shloka","")}</div>'
        if lang in ("English", "All"):
            content += f'<div class="verse-translation">{row.get("EngMeaning","")[:300]}{"..." if len(row.get("EngMeaning","")) > 300 else ""}</div>'
        if lang in ("Hindi", "All"):
            content += f'<div style="font-size:0.9rem;color:#B0A090;line-height:1.7;">{row.get("HinMeaning","")[:200]}...</div>'

        # AI verse concepts
        extra = ""
        if is_ai_verse:
            v_node = kg.nodes[f"Verse_{ch}_{v}"]
            concepts = list(kg.neighbours_by_edge(v_node.name, "teaches"))
            if concepts:
                tags = "".join(concept_tag(c, kg) for c in concepts)
                extra = f'<div style="margin-top:8px;">{tags}</div>'

        html(f"""<div class="gita-card">
  <div class="verse-id">{ch}.{v} {ai_badge}</div>
  {content}{extra}
</div>""")

    if len(filtered) > 50:
        html(f'<div style="text-align:center;color:#706050;padding:16px;font-size:0.85rem;">Showing first 50 of {len(filtered)} results. Refine your search to see more.</div>')


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: KNOWLEDGE GRAPH
# ═══════════════════════════════════════════════════════════════════════════════
def page_knowledge_graph(kg):
    html('<div class="hero-container" style="padding:1rem 0 0.5rem;"><div class="hero-title" style="font-size:2rem;">Knowledge Graph</div><div class="hero-sub">Interactive RDF concept-verse graph · Hover to inspect nodes · Color by category</div></div>')

    col1, col2, col3 = st.columns(3)
    with col1:
        show_verses = st.checkbox("Show Verse Nodes", value=True)
    with col2:
        show_edge_labels = st.checkbox("Show Edge Labels", value=False)
    with col3:
        layout_choice = st.selectbox("Layout", ["Spring", "Kamada-Kawai", "Circular"], label_visibility="visible")

    # Build subgraph for visualization
    G = kg.nx
    subG = nx.DiGraph()
    COLOR_MAP = {
        "Attainment":    "#2ECC71",
        "Practice":      "#3498DB",
        "YogaPath":      "#9B59B6",
        "DownfallCause": "#E74C3C",
        "Guna":          "#E67E22",
        "EthicalConcept":"#1ABC9C",
        "Verse":         "#C9A84C",
        "Chapter":       "#95A5A6",
        "Person":        "#F39C12",
    }

    for node_name, node_data in kg.nodes.items():
        if node_data.node_type == "Verse" and not show_verses:
            continue
        subG.add_node(node_name, **{"type": node_data.node_type,
                                    "category": node_data.category,
                                    "label": node_name})

    for u, v, d in G.edges(data=True):
        if u in subG and v in subG:
            subG.add_edge(u, v, relation=d.get("relation",""))

    if layout_choice == "Spring":
        pos = nx.spring_layout(subG, seed=42, k=2.5)
    elif layout_choice == "Kamada-Kawai":
        pos = nx.kamada_kawai_layout(subG)
    else:
        pos = nx.circular_layout(subG)

    # Build Plotly figure
    edge_traces = []
    for u, v, d in subG.edges(data=True):
        if u not in pos or v not in pos:
            continue
        x0, y0 = pos[u]; x1, y1 = pos[v]
        rel = d.get("relation", "")
        color = {"leadsTo":"#C9A84C","teaches":"#3498DB","contrastsWith":"#E74C3C",
                 "subConceptOf":"#9B59B6","requires":"#1ABC9C","respondsTo":"#E67E22"}.get(rel,"#444")
        edge_traces.append(go.Scatter(
            x=[x0, x1, None], y=[y0, y1, None],
            mode="lines",
            line=dict(width=1.5, color=color),
            hoverinfo="none",
            showlegend=False,
        ))

    node_x, node_y, node_text, node_color, node_size, node_hover = [], [], [], [], [], []
    for node_name in subG.nodes():
        if node_name not in pos:
            continue
        node = kg.nodes.get(node_name)
        if not node:
            continue
        x, y = pos[node_name]
        node_x.append(x); node_y.append(y)
        display = node_name.replace("_inst","").replace("_"," ")
        node_text.append(display if node.node_type != "Verse" else
                         f"{node.chapter_number}.{node.verse_number}")
        cat = node.category if node.category else node.node_type
        node_color.append(COLOR_MAP.get(cat, COLOR_MAP.get(node.node_type, "#666")))
        node_size.append(20 if node.node_type == "Verse" else
                         28 if node.node_type == "Concept" else 18)
        hover = f"<b>{node_name}</b><br>Type: {node.node_type}<br>Category: {node.category}"
        if node.definition:
            hover += f"<br><i>{node.definition[:80]}...</i>"
        if node.translation:
            hover += f"<br><i>{node.translation[:80]}...</i>"
        node_hover.append(hover)

    node_trace = go.Scatter(
        x=node_x, y=node_y, mode="markers+text",
        marker=dict(size=node_size, color=node_color,
                    line=dict(width=1.5, color="rgba(255,255,255,0.1)")),
        text=node_text, textposition="top center",
        textfont=dict(size=8, color="#B0A090"),
        hovertext=node_hover, hoverinfo="text",
        showlegend=False,
    )

    # Legend
    legend_traces = [
        go.Scatter(x=[None], y=[None], mode="markers",
                   marker=dict(size=10, color=color),
                   name=cat, showlegend=True)
        for cat, color in COLOR_MAP.items()
        if cat in ["Attainment","Practice","YogaPath","DownfallCause","Guna","EthicalConcept","Verse"]
    ]

    fig = go.Figure(data=edge_traces + [node_trace] + legend_traces)
    fig.update_layout(
        showlegend=True, hovermode="closest",
        margin=dict(b=10, l=10, r=10, t=10),
        paper_bgcolor="rgba(10,10,16,0)",
        plot_bgcolor="rgba(10,10,16,0)",
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        legend=dict(bgcolor="rgba(26,26,40,0.8)", bordercolor="#2A2A42",
                    font=dict(color="#B0A090", size=11)),
        height=600,
    )
    st.plotly_chart(fig, use_container_width=True)

    # Stats
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Nodes", subG.number_of_nodes())
    col2.metric("Edges", subG.number_of_edges())
    col3.metric("RDF Triples", kg.stats()["rdf_triples"])
    col4.metric("Concepts", kg.stats()["concepts"])


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: GRAPH SEARCH (Module 3)
# ═══════════════════════════════════════════════════════════════════════════════
def page_graph_search(kg):
    from modules.search_agent import bfs_reading_list, dfs_chain, astar_to_moksha, COMPLEXITY_TABLE
    html('<div class="hero-container" style="padding:1rem 0 0.5rem;"><div class="hero-title" style="font-size:2rem;">Graph Search</div><div class="hero-sub">Module 3 — BFS · DFS · A* · IDDFS over the Concept-Verse Graph</div></div>')

    tab1, tab2, tab3 = st.tabs(["🔵 BFS — Reading List", "🔴 DFS — Downfall Chain", "⭐ A* — Spiritual Path"])

    concept_names = [n for n, node in kg.nodes.items() if node.node_type == "Concept"]
    concept_names.sort()

    with tab1:
        st.subheader("BFS Reading List")
        col1, col2 = st.columns([3,1])
        with col1:
            bfs_start = st.selectbox("Start concept", concept_names,
                                      index=concept_names.index("NishkamaKarma") if "NishkamaKarma" in concept_names else 0,
                                      key="bfs_start")
        with col2:
            max_hops = st.slider("Max hops", 1, 3, 2, key="bfs_hops")
        if st.button("Run BFS", key="run_bfs"):
            results = bfs_reading_list(bfs_start, kg, max_hops)
            if results:
                html(f'<div style="color:#B0A090;font-size:0.85rem;margin:8px 0;">Found <b style="color:#C9A84C">{len(results)}</b> verses reachable from <b style="color:#C9A84C">{bfs_start}</b> within {max_hops} hops</div>')
                for r in results:
                    v_node = kg.nodes.get(r["verse"])
                    if v_node:
                        hop_color = ["#2ECC71","#C9A84C","#FF9933","#E74C3C"][min(r["hop_depth"],3)]
                        html(f"""<div class="gita-card">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
  <div class="verse-id">{v_node.chapter_number}.{v_node.verse_number}</div>
  <span style="color:{hop_color};font-size:0.8rem;font-family:JetBrains Mono,monospace;">Hop {r['hop_depth']} via {r['reached_via'].replace('_inst','').replace('_',' ')}</span>
</div>
<div class="verse-translation">{r['translation']}</div>
</div>""")
            else:
                st.info("No verses found. Try a different concept or increase hops.")

    with tab2:
        st.subheader("DFS — Downfall Chain Tracer")
        dfs_start = st.selectbox("Start node", concept_names,
                                  index=concept_names.index("Kama") if "Kama" in concept_names else 0,
                                  key="dfs_start")
        if st.button("Trace Chain", key="run_dfs"):
            result = dfs_chain(dfs_start, kg, "leadsTo")
            if result["chain"]:
                chain = result["chain"]
                arrows = " ".join(
                    f'<span class="path-node{"" if i < len(chain)-1 else " goal"}">{c}</span>' +
                    (' <span class="path-arrow">→</span>' if i < len(chain)-1 else "")
                    for i, c in enumerate(chain)
                )
                html(f'<div class="path-chain">{arrows}</div>')
                st.write("")
                for step in result["annotated"]:
                    verses_str = ", ".join(f"{v['chapter']}.{v['verse_number']}" for v in step["taught_by_verses"])
                    html(f"""<div class="gita-card">
<div style="font-family:Cinzel,serif;font-size:0.9rem;color:#C9A84C;">{step['node']}</div>
<div style="font-size:0.82rem;color:#B0A090;margin:4px 0;">{step['definition'][:120]}</div>
<div style="font-size:0.78rem;color:#706050;">Taught by: <span style="color:#FF9933;">{verses_str or "No direct verse"}</span></div>
</div>""")
            else:
                st.info("No chain found from this node.")

    with tab3:
        st.subheader("A* — Shortest Spiritual Path to Moksha")
        col1, col2 = st.columns(2)
        with col1:
            astar_start = st.selectbox("Start node", concept_names,
                                        index=concept_names.index("Vairagya") if "Vairagya" in concept_names else 0,
                                        key="astar_start")
        with col2:
            astar_goal = st.selectbox("Goal node", concept_names,
                                       index=concept_names.index("Moksha") if "Moksha" in concept_names else 0,
                                       key="astar_goal")
        if st.button("Run A*", key="run_astar"):
            result = astar_to_moksha(astar_start, kg, astar_goal)
            if result["found"]:
                path = result["path"]
                arrows = " ".join(
                    f'<span class="path-node{"" if n != astar_goal else " goal"}">{n.replace("_inst","").replace("_"," ")}</span>' +
                    (' <span class="path-arrow">→</span>' if i < len(path)-1 else "")
                    for i, n in enumerate(path)
                )
                html(f'<div style="color:#B0A090;font-size:0.85rem;margin-bottom:8px;">Shortest path: <b style="color:#C9A84C">{result["total_hops"]} hops</b></div>')
                html(f'<div class="path-chain">{arrows}</div>')
                st.write("")
                html('<div style="font-size:0.85rem;color:#C9A84C;margin:10px 0;">f(n) = g(n) + h(n) expansion trace:</div>')
                for name, g, h_val, f_val in result["f_values"]:
                    node = kg.nodes.get(name)
                    cat = node.category if node else ""
                    html(f"""<div style="display:flex;align-items:center;gap:16px;padding:6px 12px;background:rgba(26,26,40,0.8);border-radius:8px;margin:3px 0;font-family:JetBrains Mono,monospace;font-size:0.8rem;">
<span style="color:#C9A84C;min-width:160px;">{name.replace('_inst','')}</span>
<span style="color:#706050;">[{cat}]</span>
<span>g=<b style="color:#3498DB">{g}</b></span>
<span>h=<b style="color:#FF9933">{h_val}</b></span>
<span>f=<b style="color:#2ECC71">{f_val}</b></span>
</div>""")
                html(f'<div style="font-size:0.78rem;color:#706050;margin-top:8px;font-style:italic;">{result.get("admissibility_note","")}</div>')
            else:
                st.warning(f"No path found: {result.get('error','')}")

    st.divider()
    st.subheader("Complexity Analysis")
    df = pd.DataFrame(COMPLEXITY_TABLE)
    st.dataframe(df, use_container_width=True, hide_index=True)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: ASK THE GĪTĀ (Expert System → SPARQL, Module 4)
# ═══════════════════════════════════════════════════════════════════════════════
def page_ask_gita(kg):
    from modules.expert_system import ExpertSystem, SPARQL_QUERIES, run_all_cqs
    html('<div class="hero-container" style="padding:1rem 0 0.5rem;"><div class="hero-title" style="font-size:2rem;">Ask the Gītā</div><div class="hero-sub">Module 4 — 8 Competency Questions · SPARQL Queries · Production Rule Inference</div></div>')

    tab1, tab2 = st.tabs(["💬 SPARQL Competency Questions", "🔍 Natural Query"])

    with tab1:
        cq_options = {k: v["question"] for k, v in SPARQL_QUERIES.items() if k != "CQ_CONSTRUCT"}
        selected_cq = st.selectbox("Select a Competency Question", list(cq_options.keys()),
                                    format_func=lambda k: f"{k}: {cq_options[k]}")
        cq_data = SPARQL_QUERIES[selected_cq]
        html(f"""<div class="gita-card">
<div style="font-size:0.7rem;color:#FF9933;font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:6px;">{selected_cq} — {cq_data['technique']}</div>
<div style="font-size:1rem;color:#EDE8DC;margin-bottom:12px;">{cq_data['question']}</div>
<details><summary style="color:#706050;font-size:0.8rem;cursor:pointer;">Show SPARQL query</summary>
<pre style="background:#0A0A10;padding:12px;border-radius:8px;font-size:0.75rem;color:#B0A090;overflow-x:auto;margin-top:8px;">{cq_data['query'].strip()}</pre>
</details>
</div>""")
        if st.button("Execute Query", key=f"cq_{selected_cq}"):
            results = kg.sparql(cq_data["query"])
            html(f'<div style="color:#B0A090;font-size:0.85rem;margin:8px 0;">Returned <b style="color:#C9A84C">{len(results)}</b> results</div>')
            if results:
                df = pd.DataFrame(results)
                st.dataframe(df, use_container_width=True, hide_index=True)
            else:
                st.info("No results returned. This may require OWL reasoning (Fuseki + HermiT) for transitive/chain inferences.")

    with tab2:
        st.subheader("Natural Language Query")
        concern = st.text_area("What is your concern or question?",
                                placeholder="e.g., I am anxious about the results of my work and feel worried about outcomes...", height=80)
        goal = st.text_input("What is your goal?",
                              placeholder="e.g., peace of mind, meditation, understand my duty...")
        col1, col2 = st.columns(2)
        with col1:
            stage = st.selectbox("Experience level", ["beginner","intermediate","advanced"])
        with col2:
            nature = st.selectbox("Your nature", ["active","contemplative","devotional"])
        if st.button("Consult the Gītā", key="consult"):
            es = ExpertSystem(kg)
            result = es.infer(concern=concern, goal=goal, stage=stage, nature=nature)
            wm = result["working_memory"]

            html('<div style="margin:12px 0;font-family:Cinzel,serif;color:#C9A84C;">Rules Fired:</div>')
            for rule_name, desc in result["fired_rules"]:
                html(f'<div class="rule-fired"><span class="rule-name">{rule_name}</span> — {desc}</div>')

            if result["start_verse"]:
                sv = result["start_verse"]
                v_node = kg.nodes.get(sv["verse"])
                if v_node:
                    html(f'<div style="margin:16px 0 6px;font-family:Cinzel,serif;color:#C9A84C;">Recommended Starting Verse:</div>')
                    html(verse_card_html(v_node, kg))

            cf_pct = int(result["confidence"] * 100)
            html(f"""<div style="margin:12px 0;">
<div style="font-size:0.8rem;color:#B0A090;margin-bottom:4px;">Recommendation confidence: {cf_pct}%</div>
<div class="cf-bar-bg"><div class="cf-bar" style="width:{cf_pct}%"></div></div>
</div>""")

            if result["recommended_verses"]:
                html('<div style="margin:12px 0 6px;font-family:Cinzel,serif;color:#C9A84C;">Further Reading:</div>')
                for rv in result["recommended_verses"][:3]:
                    v = kg.nodes.get(rv["verse"])
                    if v:
                        html(verse_card_html(v, kg, show_sanskrit=False))


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: STUDY PLANNER (Module 5)
# ═══════════════════════════════════════════════════════════════════════════════
def page_study_planner(kg):
    from modules.study_planner import StudyPlanner, GOAL_CONSTRAINTS
    html('<div class="hero-container" style="padding:1rem 0 0.5rem;"><div class="hero-title" style="font-size:2rem;">Study Planner</div><div class="hero-sub">Module 5 — CSP Backtracking · MRV Heuristic · Forward Checking · 5-Session Plan</div></div>')

    col1, col2, col3 = st.columns(3)
    with col1:
        reader_goal = st.selectbox("Your reading goal", list(GOAL_CONSTRAINTS.keys()),
                                    format_func=lambda x: x.capitalize())
    with col2:
        num_sessions = st.slider("Sessions", 3, 7, 5)
    with col3:
        verses_per = st.slider("Verses per session", 2, 3, 2)

    if st.button("Generate Study Plan", key="gen_plan"):
        planner = StudyPlanner(kg)
        with st.spinner("Running CSP backtracking solver..."):
            result = planner.generate_plan(reader_goal=reader_goal,
                                            num_sessions=num_sessions,
                                            verses_per_session=verses_per)

        if result["success"]:
            plan = result["plan"]
            html(f'<div style="color:#B0A090;font-size:0.85rem;margin:8px 0;">Generated a <b style="color:#C9A84C">{len(plan)}-session</b> plan · Chapters covered: <b style="color:#C9A84C">{", ".join(str(c) for c in result["chapters_covered"])}</b> · Goal: <b style="color:#C9A84C">{reader_goal}</b></div>')

            # Timeline visualization
            fig = go.Figure()
            for i, s in enumerate(plan):
                for j, vd in enumerate(s["verse_details"]):
                    color_map = {2:"#C9A84C", 3:"#3498DB", 6:"#2ECC71"}
                    color = color_map.get(vd["chapter"],"#9B59B6")
                    fig.add_trace(go.Bar(
                        x=[1], y=[f"Session {s['session']}"],
                        orientation="h",
                        marker_color=color,
                        text=f"{vd['chapter']}.{vd['verse_number']}",
                        textposition="inside",
                        name=f"{vd['chapter']}.{vd['verse_number']}",
                        showlegend=False,
                        hovertext=vd["translation"][:100],
                        hoverinfo="text",
                    ))
            fig.update_layout(
                barmode="stack",
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                yaxis=dict(color="#B0A090"),
                height=200,
                margin=dict(l=10, r=10, t=10, b=10),
            )
            st.plotly_chart(fig, use_container_width=True)

            for s in plan:
                v_labels = " + ".join(f"{vd['chapter']}.{vd['verse_number']}" for vd in s["verse_details"])
                shared = s["shared_concepts"]
                tags = "".join(concept_tag(c, kg) for c in shared) if shared else '<span style="color:#706050">General pairing</span>'
                speaker_labels = " · ".join(vd["speaker"] for vd in s["verse_details"])
                html(f"""<div class="session-card">
<div class="session-num">Session {s['session']}</div>
<div style="font-family:Cinzel,serif;font-size:1rem;color:#EDE8DC;">{v_labels}</div>
<div class="session-theme">Theme: {s['theme']} · Speakers: {speaker_labels}</div>
<div style="margin-top:6px;">{tags}</div>
</div>""")
                with st.expander(f"Session {s['session']} verse details"):
                    for vd in s["verse_details"]:
                        v_node = kg.nodes.get(vd["name"])
                        if v_node:
                            html(verse_card_html(v_node, kg))
        else:
            st.error(f"CSP solver could not find a valid plan: {result.get('error','')}")
            st.info("Try reducing the number of sessions or adjusting the goal constraint.")


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: UNCERTAINTY (Module 6)
# ═══════════════════════════════════════════════════════════════════════════════
def page_uncertainty(kg):
    from modules.uncertainty_handler import (
        compute_verse_cf, fuzzy_yoga_membership, NonMonotonicEngine,
        cf_analysis_all, dual_membership_verses, VERSE_CF_DATA, YOGA_PATHS
    )
    html('<div class="hero-container" style="padding:1rem 0 0.5rem;"><div class="hero-title" style="font-size:2rem;">Uncertainty Handling</div><div class="hero-sub">Module 6 — MYCIN Certainty Factors · Fuzzy Logic · Non-Monotonic Belief Revision</div></div>')

    tab1, tab2, tab3 = st.tabs(["🎯 Certainty Factors", "🌀 Fuzzy Membership", "🔄 Belief Revision"])

    with tab1:
        st.subheader("MYCIN Certainty Factor Analysis")
        verse_options = list(VERSE_CF_DATA.keys())
        sel_verse = st.selectbox("Select verse", verse_options)
        concepts_for_verse = list(VERSE_CF_DATA[sel_verse].keys())
        sel_concept = st.selectbox("Select concept claim", concepts_for_verse)

        result = compute_verse_cf(sel_verse, sel_concept)
        if result.get("cf_combined") is not None:
            html(f"""<div class="gita-card">
<div class="verse-id">{sel_verse} → {sel_concept.replace('_inst','')}</div>
<div style="font-family:JetBrains Mono,monospace;font-size:0.85rem;color:#C9A84C;margin:8px 0;">{result['formula']}</div>
<div class="cf-row">
  <div class="cf-label">Combined CF: {result['cf_combined']} — {result['interpretation']}</div>
  <div class="cf-bar-bg"><div class="cf-bar" style="width:{int(result['cf_combined']*100)}%"></div></div>
</div>
{('<div style="color:#E74C3C;font-size:0.82rem;margin-top:8px;">'+result['flag']+'</div>') if result['flag'] else ''}
</div>""")

            st.write("**Evidence breakdown:**")
            for ev in result["evidence"]:
                cf_pct = int(abs(ev["cf"]) * 100)
                color = "#2ECC71" if ev["cf"] >= 0.7 else "#C9A84C" if ev["cf"] >= 0.5 else "#E74C3C"
                html(f"""<div style="display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid #2A2A42;">
<span style="min-width:180px;color:#B0A090;font-size:0.82rem;">{ev['source']}</span>
<div class="cf-bar-bg" style="flex:1;"><div class="cf-bar" style="width:{cf_pct}%;background:{color}"></div></div>
<span style="color:{color};font-family:JetBrains Mono,monospace;font-size:0.85rem;">{ev['cf']:.2f}</span>
</div>""")

        # All CF pairs
        if st.checkbox("Show all CF pairs"):
            all_cfs = cf_analysis_all()
            df = pd.DataFrame([{
                "Verse": r["verse"], "Concept": r["concept"].replace("_inst",""),
                "CF": r["cf_combined"], "Interpretation": r["interpretation"]
            } for r in all_cfs if r.get("cf_combined")])
            st.dataframe(df.sort_values("CF", ascending=False), use_container_width=True, hide_index=True)

    with tab2:
        st.subheader("Fuzzy Yoga-Path Membership")
        verse_names = [v.name for v in kg.all_verses() if v.name not in ("Verse_3_1","Verse_6_33")]
        sel_v = st.selectbox("Select verse", verse_names,
                              index=verse_names.index("Verse_6_47") if "Verse_6_47" in verse_names else 0)
        fm = fuzzy_yoga_membership(sel_v, kg)
        path_colors = {"KarmaYoga":"#C9A84C","JnanaYoga":"#9B59B6","DhyanaYoga":"#3498DB","BhaktiYoga":"#2ECC71"}
        html(f"""<div class="gita-card">
<div class="verse-id">{sel_v}</div>
<div class="fuzzy-grid">
{''.join(f"""<div class="fuzzy-item">
<div class="fuzzy-mu" style="color:{path_colors.get(p,'#C9A84C')};">{fm['memberships'].get(p,0):.2f}</div>
<div class="fuzzy-path">{p.replace('Yoga','<br>Yoga')}</div>
<div style="font-size:0.65rem;color:{('#2ECC71' if fm['linguistic_labels'].get(p)=='High' else '#C9A84C' if fm['linguistic_labels'].get(p)=='Medium' else '#706050')};">{fm['linguistic_labels'].get(p,'')}</div>
</div>""" for p in YOGA_PATHS)}
</div>
<div style="font-size:0.82rem;color:#B0A090;margin-top:8px;">Primary: <b style="color:#C9A84C">{fm['primary_path']}</b> | Fuzzy reveals: {fm['fuzzy_reveals']}</div>
</div>""")

        # Radar chart
        fig = go.Figure(go.Scatterpolar(
            r=[fm["memberships"].get(p,0) for p in YOGA_PATHS] + [fm["memberships"].get(YOGA_PATHS[0],0)],
            theta=YOGA_PATHS + [YOGA_PATHS[0]],
            fill="toself",
            line=dict(color="#C9A84C"), fillcolor="rgba(201,168,76,0.15)",
        ))
        fig.update_layout(
            polar=dict(bgcolor="rgba(0,0,0,0)",
                       radialaxis=dict(range=[0,1], color="#706050"),
                       angularaxis=dict(color="#B0A090")),
            paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=40,r=40,t=40,b=40), height=300,
        )
        st.plotly_chart(fig, use_container_width=True)

        if st.checkbox("Show dual-membership verses (μ ≥ 0.5 in 2+ paths)"):
            duals = dual_membership_verses(kg, 0.5)
            for d in duals:
                paths = ", ".join(d["dual_membership_paths"])
                html(f'<div style="padding:6px 0;border-bottom:1px solid #2A2A42;font-size:0.85rem;"><b style="color:#C9A84C">{d["verse"]}</b> <span style="color:#B0A090;">— dual membership in:</span> <span style="color:#FF9933;">{paths}</span></div>')

    with tab3:
        st.subheader("Non-Monotonic Belief Revision")
        st.write("Simulate a reader progressing through the Gītā. Watch default beliefs get retracted when new verses are processed.")
        nature = st.selectbox("Reader's nature", ["contemplative","active","devotional"])
        if st.button("Run Belief Revision Demo"):
            engine = NonMonotonicEngine()
            steps = engine.full_revision_demo()
            for step in steps:
                if "reader_nature" in step:
                    step["reader_nature"] = nature
                html(f'<div style="font-family:Cinzel,serif;font-size:0.9rem;color:#C9A84C;margin:12px 0 6px;">⟶ {step["step"]}</div>')
                if step.get("belief_changes"):
                    for change in step["belief_changes"]:
                        icon = "✅" if change["type"] == "ADD" else "❌"
                        color = "#2ECC71" if change["type"] == "ADD" else "#E74C3C"
                        html(f'<div style="padding:5px 10px;border-left:2px solid {color};margin:3px 0;font-size:0.82rem;"><span style="color:{color}">{icon} {change["type"]}</span> — {change["belief"]}<br><span style="color:#706050;font-size:0.72rem;">Trigger: {change["trigger"]} | {change["reason"]}</span></div>')
                active = step.get("active_beliefs", [])
                if active:
                    html('<div style="font-size:0.8rem;color:#706050;margin-top:6px;">Active beliefs:</div>')
                    for b in active:
                        html(f'<div class="belief-active">✓ {b}</div>')


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: EXPERT SYSTEM PROFILES (Module 4 continued)
# ═══════════════════════════════════════════════════════════════════════════════
def page_expert_system(kg):
    from modules.expert_system import ExpertSystem
    html('<div class="hero-container" style="padding:1rem 0 0.5rem;"><div class="hero-title" style="font-size:2rem;">Expert System</div><div class="hero-sub">Module 4 — 8 Production Rules · Forward Chaining · Conflict Resolution by Specificity</div></div>')

    st.subheader("Reader Profile Inference Demos")
    es = ExpertSystem(kg)
    demos = es.reader_profiles_demo()

    for demo in demos:
        result = demo["inference"]
        wm = result["working_memory"]
        with st.expander(f"**{demo['label']}** — {demo['concern'][:60]}..."):
            col1, col2 = st.columns(2)
            with col1:
                html(f'<div style="font-size:0.82rem;color:#B0A090;">Concern: {demo["concern"]}<br>Goal: {demo["goal"]}</div>')
                html('<div style="font-family:Cinzel,serif;color:#C9A84C;margin:10px 0 4px;font-size:0.85rem;">Rules Fired (by specificity):</div>')
                for rule_name, desc in result["fired_rules"]:
                    html(f'<div class="rule-fired"><span class="rule-name">{rule_name}</span><br>{desc}</div>')
            with col2:
                cf_pct = int(result["confidence"] * 100)
                html(f"""<div style="text-align:center;padding:16px;">
<div class="metric-val" style="font-size:2rem;">{cf_pct}%</div>
<div class="metric-lbl">Confidence</div>
<div style="margin-top:8px;color:#B0A090;font-size:0.82rem;">Concept: <b style="color:#C9A84C">{result['recommend_concept'].replace('_inst','')}</b></div>
</div>""")
                if result["start_verse"]:
                    sv = result["start_verse"]
                    html(f'<div style="font-size:0.82rem;color:#B0A090;">Start verse: <b style="color:#FF9933">{sv["chapter"]}.{sv["verse_number"]}</b></div>')
                    html(f'<div style="font-size:0.82rem;color:#B0A090;font-style:italic;margin-top:4px;">{sv["translation"][:120]}...</div>')

    st.divider()
    st.subheader("Rule Base")
    from modules.expert_system import PRODUCTION_RULES
    for rule in sorted(PRODUCTION_RULES, key=lambda r: -r.specificity):
        cf_pct = int(rule.cf * 100)
        html(f"""<div style="padding:10px 14px;border:1px solid #2A2A42;border-radius:10px;margin:6px 0;display:flex;align-items:center;gap:16px;">
<div style="font-family:JetBrains Mono,monospace;font-size:0.75rem;color:#C9A84C;min-width:160px;">{rule.name}</div>
<div style="flex:1;font-size:0.82rem;color:#B0A090;">{rule.description}</div>
<div style="text-align:right;min-width:80px;">
  <div style="font-size:0.75rem;color:#706050;">Spec: {rule.specificity} | CF: {rule.cf}</div>
  <div class="cf-bar-bg" style="margin-top:3px;"><div class="cf-bar" style="width:{cf_pct}%"></div></div>
</div>
</div>""")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════
def main():
    inject_css()

    # Load resources
    try:
        kg = load_kg()
        gita_data = load_gita_csv()
    except Exception as e:
        st.error(f"Failed to load knowledge base: {e}")
        st.info("Make sure `knowledge_base/gita_ontology.ttl` exists and requirements are installed.")
        st.code("pip install -r requirements.txt", language="bash")
        return

    # Render sidebar + get page
    page = render_sidebar()

    # Route
    if "Home" in page:
        page_home(kg, gita_data)
    elif "Verse Browser" in page:
        page_verse_browser(kg, gita_data)
    elif "Knowledge Graph" in page:
        page_knowledge_graph(kg)
    elif "Ask" in page:
        page_ask_gita(kg)
    elif "Search" in page:
        page_graph_search(kg)
    elif "Study Planner" in page:
        page_study_planner(kg)
    elif "Uncertainty" in page:
        page_uncertainty(kg)
    elif "Expert System" in page:
        page_expert_system(kg)


if __name__ == "__main__":
    main()
