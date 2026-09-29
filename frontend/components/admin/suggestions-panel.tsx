'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { ApiError, fetchSuggestions, type SuggestionItem } from '@/lib/api'

const PAGE_SIZE = 20
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function SuggestionsPanel({
  refreshKey,
  onUnauthorized,
}: {
  refreshKey: number
  onUnauthorized: () => void
}) {
  const [items, setItems] = useState<SuggestionItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) return onUnauthorized()
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as sugestões.')
    },
    [onUnauthorized],
  )

  useEffect(() => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    fetchSuggestions(0, PAGE_SIZE)
      .then((list) => {
        if (id !== requestId.current) return
        setItems(list.items)
        setTotal(list.total)
      })
      .catch((err) => id === requestId.current && handleError(err))
      .finally(() => id === requestId.current && setLoading(false))
  }, [refreshKey, handleError])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const list = await fetchSuggestions(items.length, PAGE_SIZE)
      setItems((current) => [...current, ...list.items])
      setTotal(list.total)
    } catch (err) {
      handleError(err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <section aria-labelledby="sugestoes-titulo" className="mt-8 rounded-[1.25rem] border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="sugestoes-titulo" className="font-serif text-2xl font-bold text-ink">
          Caixa de sugestões
        </h2>
        <p className="text-sm tabular-nums text-ink-muted">
          {total} {total === 1 ? 'sugestão' : 'sugestões'}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-12 text-brand" role="status" aria-label="Carregando">
          <LoaderCircle className="size-7 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Nenhuma sugestão ainda.</p>
      ) : (
        <ul className={`mt-3 divide-y divide-line transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <p className="whitespace-pre-wrap break-words leading-7 text-ink">{item.texto}</p>
              <p className="mt-1.5 text-xs text-ink-muted">
                {item.produto ?? 'Sugestão geral'} · {dateFormat.format(new Date(item.created_at))}
              </p>
            </li>
          ))}
        </ul>
      )}

      {items.length < total && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand-soft disabled:opacity-60"
        >
          {loadingMore && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          Carregar mais ({total - items.length} restantes)
        </button>
      )}
    </section>
  )
}
