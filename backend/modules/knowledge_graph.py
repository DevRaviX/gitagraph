"""
knowledge_graph.py — Digital Bhaṣya
Shared Knowledge Graph: loads the TTL ontology into RDFLib + NetworkX.
All other modules import this as their single source of truth.

Author: Ravi Kant Gupta (@DevRaviX)
Module: Core Architecture & Knowledge Graph
"""

import os
import networkx as nx
from rdflib import Graph as RDFGraph, Namespace, RDF, RDFS, OWL, URIRef, Literal
from rdflib.namespace import XSD

GITA = Namespace("http://example.org/gita#")
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
TTL_PATH = os.path.join(PROJECT_ROOT, "Data", "ontology", "gita_ontology.ttl")

# ─────────────────────────────────────────────────────────────────────────────
# Category heuristic for A* (distance to Moksha)
# ─────────────────────────────────────────────────────────────────────────────
CATEGORY_H = {
    "Attainment":    0,
    "Practice":      1,
    "YogaPath":      2,
    "EthicalConcept":2,
    "Guna":          3,
    "DownfallCause": 4,
}


class GitaNode:
    """Lightweight wrapper for a node in the Gita knowledge graph."""
    def __init__(self, uri: str, name: str, node_type: str,
                 category: str = "", definition: str = "",
                 translation: str = "", context: str = "",
                 verse_number: int = 0, chapter_number: int = 0,
                 sanskrit: str = "", certainty: float = 1.0,
                 speaker: str = ""):
        self.uri = uri
        self.name = name
        self.node_type = node_type       # 'Verse', 'Concept', 'Chapter', 'Person'
        self.category = category         # e.g. 'Attainment', 'Practice', 'YogaPath'
        self.definition = definition
        self.translation = translation
        self.context = context
        self.verse_number = verse_number
        self.chapter_number = chapter_number
        self.sanskrit = sanskrit
        self.certainty = certainty
        self.speaker = speaker

    def __repr__(self):
        return f"GitaNode({self.name!r})"

    def heuristic(self) -> int:
        """A* category-distance heuristic h(n) to Moksha."""
        if self.name == "Moksha":
            return 0
        return CATEGORY_H.get(self.category, 3)


class GitaKnowledgeGraph:
    """
    Loads gita_ontology.ttl into RDFLib and exposes:
    - self.rdf  : rdflib.Graph  (for SPARQL)
    - self.nx   : networkx.DiGraph (for BFS/DFS/A*)
    - self.nodes: dict[local_name -> GitaNode]
    """

    def __init__(self, ttl_path: str = TTL_PATH):
        self.ttl_path = ttl_path
        self.rdf = RDFGraph()
        self.nx: nx.DiGraph = nx.DiGraph()
        self.nodes: dict[str, GitaNode] = {}
        self._load()

    # ── Loading ───────────────────────────────────────────────────────────────

    def _local(self, uri) -> str:
        """Strip namespace prefix to get local name."""
        s = str(uri)
        if "#" in s:
            return s.split("#")[-1]
        return s.split("/")[-1]

    def _load(self):
        self.rdf.parse(self.ttl_path, format="turtle")
        self._build_nodes()
        self._build_edges()

    def _str(self, subject, predicate) -> str:
        vals = list(self.rdf.objects(subject, predicate))
        return str(vals[0]) if vals else ""

    def _int(self, subject, predicate) -> int:
        vals = list(self.rdf.objects(subject, predicate))
        try:
            return int(vals[0]) if vals else 0
        except Exception:
            return 0

    def _float(self, subject, predicate) -> float:
        vals = list(self.rdf.objects(subject, predicate))
        try:
            return float(vals[0]) if vals else 1.0
        except Exception:
            return 1.0

    def _build_nodes(self):
        """Parse all RDF individuals into GitaNode objects."""

        # ── Chapters ──────────────────────────────────────────────────────────
        for subj in self.rdf.subjects(RDF.type, GITA.Chapter):
            name = self._local(subj)
            ch_num = self._int(subj, GITA.chapterNumber)
            label = self._str(subj, RDFS.label)
            node = GitaNode(uri=str(subj), name=name,
                            node_type="Chapter", chapter_number=ch_num,
                            definition=label)
            self.nodes[name] = node
            self.nx.add_node(name, data=node)

        # ── Persons ───────────────────────────────────────────────────────────
        for subj in self.rdf.subjects(RDF.type, GITA.Person):
            name = self._local(subj)
            node = GitaNode(uri=str(subj), name=name, node_type="Person",
                            category=self._str(subj, GITA.category))
            self.nodes[name] = node
            self.nx.add_node(name, data=node)

        # ── Philosophical Concepts ─────────────────────────────────────────────
        concept_classes = [GITA.PhilosophicalConcept, GITA.YogaPath, GITA.Practice,
                           GITA.Attainment, GITA.DownfallCause, GITA.Guna,
                           GITA.EthicalConcept, GITA.KarmaYogaPath, GITA.JnanaYogaPath,
                           GITA.DhyanaYogaPath, GITA.BhaktiYogaPath]
        seen_concepts = set()
        for cls in concept_classes:
            for subj in self.rdf.subjects(RDF.type, cls):
                name = self._local(subj)
                if name in seen_concepts:
                    continue
                seen_concepts.add(name)
                # Determine category from class
                category = self._str(subj, GITA.category)
                if not category:
                    for c, cat in [(GITA.YogaPath, "YogaPath"),
                                   (GITA.KarmaYogaPath, "YogaPath"),
                                   (GITA.JnanaYogaPath, "YogaPath"),
                                   (GITA.DhyanaYogaPath, "YogaPath"),
                                   (GITA.BhaktiYogaPath, "YogaPath"),
                                   (GITA.Practice, "Practice"),
                                   (GITA.Attainment, "Attainment"),
                                   (GITA.DownfallCause, "DownfallCause"),
                                   (GITA.Guna, "Guna"),
                                   (GITA.EthicalConcept, "EthicalConcept")]:
                        if (subj, RDF.type, c) in self.rdf:
                            category = cat
                            break
                node = GitaNode(
                    uri=str(subj), name=name, node_type="Concept",
                    category=category,
                    definition=self._str(subj, GITA.definitionEn),
                )
                self.nodes[name] = node
                self.nx.add_node(name, data=node)

        # ── Verses ────────────────────────────────────────────────────────────
        for subj in self.rdf.subjects(RDF.type, GITA.Verse):
            name = self._local(subj)
            chapter_uri = list(self.rdf.objects(subj, GITA.belongsToChapter))
            chapter_name = self._local(chapter_uri[0]) if chapter_uri else ""
            chapter_node = self.nodes.get(chapter_name)
            ch_num = chapter_node.chapter_number if chapter_node else 0

            speaker_uri = list(self.rdf.objects(subj, GITA.spokenBy))
            speaker = self._local(speaker_uri[0]) if speaker_uri else ""

            node = GitaNode(
                uri=str(subj), name=name, node_type="Verse",
                verse_number=self._int(subj, GITA.verseNumber),
                chapter_number=ch_num,
                translation=self._str(subj, GITA.translationEn),
                context=self._str(subj, GITA.contextNote),
                sanskrit=self._str(subj, GITA.textSanskrit),
                certainty=self._float(subj, GITA.certaintyScore),
                speaker=speaker,
            )
            self.nodes[name] = node
            self.nx.add_node(name, data=node)

    def _build_edges(self):
        """Parse all RDF object properties into NetworkX directed edges."""
        edge_properties = [
            (GITA.leadsTo,          "leadsTo"),
            (GITA.teaches,          "teaches"),
            (GITA.respondsTo,       "respondsTo"),
            (GITA.contrastsWith,    "contrastsWith"),
            (GITA.subConceptOf,     "subConceptOf"),
            (GITA.requires,         "requires"),
            (GITA.belongsToChapter, "belongsToChapter"),
            (GITA.spokenBy,         "spokenBy"),
        ]
        for prop_uri, prop_name in edge_properties:
            for s, o in self.rdf.subject_objects(prop_uri):
                s_name = self._local(s)
                o_name = self._local(o)
                if s_name in self.nodes and o_name in self.nodes:
                    self.nx.add_edge(s_name, o_name, relation=prop_name)

    # ── Query helpers ─────────────────────────────────────────────────────────

    def get_node(self, name: str) -> "GitaNode | None":
        return self.nodes.get(name)

    def concept_neighbours(self, node_name: str,
                            edge_types: list[str] = None) -> list[str]:
        """Return neighbour node names via specified edge types."""
        if edge_types is None:
            edge_types = ["leadsTo", "subConceptOf", "contrastsWith"]
        result = []
        for _, nbr, data in self.nx.out_edges(node_name, data=True):
            if data.get("relation") in edge_types:
                result.append(nbr)
        return result

    def verses_teaching(self, concept_name: str) -> list[str]:
        """Return verse node names that teach the given concept (reverse teaches edge)."""
        result = []
        for verse_name, _, data in self.nx.in_edges(concept_name, data=True):
            if data.get("relation") == "teaches":
                node = self.nodes.get(verse_name)
                if node and node.node_type == "Verse":
                    result.append(verse_name)
        return result

    def neighbours_by_edge(self, node_name: str, edge_type: str) -> list[str]:
        """Return outgoing neighbours along a specific edge type."""
        result = []
        for _, nbr, data in self.nx.out_edges(node_name, data=True):
            if data.get("relation") == edge_type:
                result.append(nbr)
        return result

    def shared_concepts(self, verse_a: str, verse_b: str) -> list[str]:
        """Return concepts taught by both verse_a and verse_b."""
        a_concepts = {nbr for _, nbr, d in self.nx.out_edges(verse_a, data=True)
                      if d.get("relation") == "teaches"}
        b_concepts = {nbr for _, nbr, d in self.nx.out_edges(verse_b, data=True)
                      if d.get("relation") == "teaches"}
        return list(a_concepts & b_concepts)

    def all_verses(self) -> list["GitaNode"]:
        return sorted(
            [n for n in self.nodes.values() if n.node_type == "Verse"],
            key=lambda v: (v.chapter_number, v.verse_number)
        )

    def all_concepts(self) -> list["GitaNode"]:
        return [n for n in self.nodes.values() if n.node_type == "Concept"]

    def verses_by_chapter(self, ch: int) -> list["GitaNode"]:
        return sorted(
            [n for n in self.nodes.values()
             if n.node_type == "Verse" and n.chapter_number == ch],
            key=lambda v: v.verse_number
        )

    # ── SPARQL ────────────────────────────────────────────────────────────────

    def sparql(self, query: str) -> list[dict]:
        """Execute a SPARQL SELECT query and return rows as list of dicts."""
        results = []
        for row in self.rdf.query(query):
            results.append({str(var): str(val) for var, val in zip(row.labels, row)})
        return results

    def stats(self) -> dict:
        verses = [n for n in self.nodes.values() if n.node_type == "Verse"]
        concepts = [n for n in self.nodes.values() if n.node_type == "Concept"]
        return {
            "total_nodes": len(self.nodes),
            "verses": len(verses),
            "concepts": len(concepts),
            "edges": self.nx.number_of_edges(),
            "rdf_triples": len(self.rdf),
        }
