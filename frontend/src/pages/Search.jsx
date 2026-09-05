import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Loading, ErrorState, EmptyState } from '../components/States'
import Stamp from '../components/Stamp'
import AuthorityLadder from '../components/AuthorityLadder'

const METHODS = [
  { value: 'bm25', label: 'BM25', hint: 'Lexical (System A)' },
  { value: 'dense', label: 'Dense', hint: 'Semantic — LSA (System B)' },
  { value: 'hybrid', label: 'Hybrid', hint: 'RRF fusion (System C)' },
  { value: 'hybrid_rerank', label: 'Hybrid + Rerank', hint: 'Reranked (System D)' },
]

const RELATION_LABEL = {
  conflicts_with: 'conflicts with',
  supersedes: 'supersedes',
  duplicate_of: 'duplicate of',
  owned_by: 'owned by',
  applies_to: 'applies to',
  references: 'references',
}

function ConfidenceMeter({ percent }) {
  return (
    <div className="flex items-center gap-2" title={`${percent}% of the top result's score for this query`}>
      <div className="w-14 h-1.5 rounded-full bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-full bg-verified"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-muted">{percent}%</span>
    </div>
  )
}

function RelatedEntities({ entities }) {
  if (!entities || entities.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {entities.map((e, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border"
          style={{
            borderColor: e.relation_type === 'conflicts_with' ? 'var(--color-conflict)' : 'var(--color-border-soft)',
            color: e.relation_type === 'conflicts_with' ? 'var(--color-conflict-paper)' : 'var(--color-muted)',
          }}
        >
          {RELATION_LABEL[e.relation_type] || e.relation_type} <span className="text-paper-dim">{e.name}</span>
        </span>
      ))}
    </div>
  )
}

function ResultCard({ result }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-border-soft rounded-md p-4 hover:border-verified/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <Link to={`/documents/${result.document_id}`} className="min-w-0 group">
          <p className="font-display text-base text-paper truncate group-hover:text-verified transition-colors">
            {result.title}
          </p>
          <p className="font-mono text-[11px] text-muted mt-0.5">
            {result.doc_key} · v{result.version} · {result.department}
          </p>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          {result.has_known_conflict && (
            <Stamp variant="high" title="This document has a detected integrity conflict">
              Conflict
            </Stamp>
          )}
          <Stamp variant={result.status}>{result.status}</Stamp>
        </div>
      </div>

      <p className="text-[13px] text-paper-dim leading-snug line-clamp-2 mb-3">{result.chunk_text}</p>

      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <AuthorityLadder level={result.authority_level} label={result.authority_label} compact />
        <ConfidenceMeter percent={result.confidence_percent} />
      </div>

      <RelatedEntities entities={result.related_entities} />

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-3 text-[11px] font-mono text-muted hover:text-paper flex items-center gap-1"
      >
        <span className={`transition-transform inline-block ${expanded ? 'rotate-90' : ''}`}>›</span>
        Why this ranked here
      </button>
      {expanded && (
        <p className="mt-2 text-[12px] text-paper-dim bg-surface-raised rounded p-2.5 leading-relaxed">
          {result.ranking_explanation}
        </p>
      )}
    </div>
  )
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState('hybrid_rerank')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function runSearch(e) {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.search(query, { method, topK: 10 })
      setResults(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-3xl">
      <header className="mb-6">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">
          Enterprise search
        </p>
        <h1 className="font-display text-3xl text-paper">Search</h1>
      </header>

      <form onSubmit={runSearch} className="mb-4">
        <label htmlFor="search-input" className="sr-only">Search the knowledge base</label>
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What is the current remote work policy?"
          autoComplete="off"
          className="w-full bg-surface border border-border rounded-md px-4 py-3 text-paper placeholder:text-muted-soft font-sans focus:border-verified outline-none"
        />
      </form>

      <div className="flex gap-1 mb-6 border border-border-soft rounded-md p-1 w-fit flex-wrap" role="radiogroup" aria-label="Retrieval method">
        {METHODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMethod(m.value)}
            title={m.hint}
            role="radio"
            aria-checked={method === m.value}
            className={`px-3 py-1.5 rounded text-[13px] font-mono transition-colors ${
              method === m.value
                ? 'bg-verified-soft text-verified-paper'
                : 'text-muted hover:text-paper'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && <Loading label="Searching" />}
      {error && <ErrorState message="Search failed" hint={error} />}

      {results && !loading && (
        <>
          <p className="text-[13px] text-muted mb-4 font-mono">
            {results.results.length} result{results.results.length === 1 ? '' : 's'} · method: {results.method}
          </p>
          {results.results.length === 0 ? (
            <EmptyState title="No matches" body="Try a different query or retrieval method." />
          ) : (
            <div className="space-y-3">
              {results.results.map((r) => (
                <ResultCard key={r.chunk_id} result={r} />
              ))}
            </div>
          )}
        </>
      )}

      {!results && !loading && !error && (
        <EmptyState
          title="Search the knowledge base"
          body='Try "How often must employees change their passwords?" to see how EKOS surfaces conflicting sources rather than picking one silently.'
        />
      )}
    </div>
  )
}
