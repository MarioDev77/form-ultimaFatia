'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LoaderCircle, LogOut, RefreshCw } from 'lucide-react'
import { SiteLogo } from '@/components/site-logo'
import { Button } from '@/components/ui/button'
import {
  ApiError,
  fetchFeedbacks,
  fetchStats,
  type FeedbackItem,
  type Stats,
} from '@/lib/api'
import { PRODUCTS } from '@/lib/feedback-options'
import { BarList } from './bar-list'
import { QuestionCard } from './question-card'
import { ResponsesList } from './responses-list'
import { SuggestionsPanel } from './suggestions-panel'

const PAGE_SIZE = 20

const VIEWS = [
  { key: 'avaliacoes', label: 'Avaliações' },
  { key: 'sugestoes', label: 'Caixa de sugestões' },
] as const

type ViewKey = (typeof VIEWS)[number]['key']

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-line bg-white p-5 shadow-sm">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  )
}

// % dos votos nas duas primeiras opções da escala ("Com certeza" + "Provavelmente").
function positiveShare(stats: Stats, campo: string) {
  const question = stats.perguntas.find((q) => q.campo === campo)
  if (!question || stats.total === 0) return '—'
  const positive = question.distribuicao[0].count + question.distribuicao[1].count
  return `${Math.round((positive / stats.total) * 100)}%`
}

// Média geral = média das 5 perguntas de nota (sabor, qualidade, apresentação, preços, custo-benefício).
function overallAverage(stats: Stats) {
  const medias = stats.perguntas
    .filter((q) => !['compraria', 'recomendaria'].includes(q.campo))
    .map((q) => q.media)
    .filter((m): m is number => m !== null)
  if (medias.length === 0) return '—'
  const avg = medias.reduce((a, b) => a + b, 0) / medias.length
  return `${avg.toFixed(1).replace('.', ',')}/5`
}

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<ViewKey>('avaliacoes')
  const [refreshKey, setRefreshKey] = useState(0)
  const [produto, setProduto] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) return onLogout() // sessão expirada
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os dados.')
    },
    [onLogout],
  )

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const [nextStats, list] = await Promise.all([
        fetchStats(produto),
        fetchFeedbacks(produto, 0, PAGE_SIZE),
      ])
      if (id !== requestId.current) return // chegou uma resposta mais nova, descarta esta
      setStats(nextStats)
      setItems(list.items)
      setTotal(list.total)
    } catch (err) {
      if (id === requestId.current) handleError(err)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [produto, handleError])

  useEffect(() => {
    load()
  }, [load])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const list = await fetchFeedbacks(produto, items.length, PAGE_SIZE)
      setItems((current) => [...current, ...list.items])
      setTotal(list.total)
    } catch (err) {
      handleError(err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SiteLogo size={56} />
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">Painel administrativo</h1>
            <p className="text-sm text-ink-muted">Resultados do formulário de feedback</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              load()
              setRefreshKey((key) => key + 1)
            }}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} aria-hidden="true" /> Atualizar
          </Button>
          <Button variant="outline" size="lg" onClick={onLogout}>
            <LogOut aria-hidden="true" /> Sair
          </Button>
        </div>
      </header>

      <div role="tablist" aria-label="Seção do painel" className="mt-8 flex gap-1 rounded-full border border-line bg-white p-1 shadow-sm sm:inline-flex">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            role="tab"
            type="button"
            aria-selected={view === v.key}
            onClick={() => setView(v.key)}
            className={`h-10 flex-1 rounded-full px-5 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 ${
              view === v.key ? 'bg-brand text-white shadow' : 'text-ink-muted hover:bg-brand-soft'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'sugestoes' && <SuggestionsPanel refreshKey={refreshKey} onUnauthorized={onLogout} />}

      <div className={view === 'avaliacoes' ? 'mt-8' : 'hidden'}>
        <label className="inline-flex flex-col gap-1.5 text-sm font-semibold text-ink">
          Filtrar por produto
          <select
            value={produto}
            onChange={(event) => setProduto(event.target.value)}
            className="h-11 min-w-56 rounded-xl border border-line bg-white px-4 font-normal text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
          >
            <option value="">Todos os produtos</option>
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      {view === 'avaliacoes' && error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {view === 'avaliacoes' && !stats && loading && (
        <div className="flex justify-center py-24 text-brand" role="status" aria-label="Carregando">
          <LoaderCircle className="size-8 animate-spin" />
        </div>
      )}

      {view === 'avaliacoes' && stats && (
        <div className={`mt-8 space-y-8 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {stats.total === 0 ? (
            <p className="rounded-[1.25rem] border border-dashed border-line bg-white p-10 text-center text-ink-muted">
              Ainda não há respostas{produto ? ' para este produto' : ''}.
            </p>
          ) : (
            <>
              <section aria-label="Resumo" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile label="Respostas" value={String(stats.total)} />
                <StatTile label="Média geral" value={overallAverage(stats)} />
                <StatTile label="Comprariam de novo" value={positiveShare(stats, 'compraria')} />
                <StatTile label="Recomendariam" value={positiveShare(stats, 'recomendaria')} />
              </section>

              {!produto && (
                <section className="rounded-[1.25rem] border border-line bg-white p-6 shadow-sm">
                  <h2 className="mb-5 font-serif text-xl font-bold text-ink">Respostas por produto</h2>
                  <BarList items={stats.produtos} />
                </section>
              )}

              <section aria-label="Votos por pergunta" className="grid gap-5 md:grid-cols-2">
                {stats.perguntas.map((question) => (
                  <QuestionCard key={question.campo} question={question} />
                ))}
              </section>

              <ResponsesList items={items} total={total} loadingMore={loadingMore} onLoadMore={loadMore} />
            </>
          )}
        </div>
      )}
    </main>
  )
}
