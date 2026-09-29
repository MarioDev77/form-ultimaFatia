'use client'

import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { FeedbackItem } from '@/lib/api'
import { TEXT_TABS, type TextKey } from '@/lib/feedback-options'

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function ResponsesList({
  items,
  total,
  loadingMore,
  onLoadMore,
}: {
  items: FeedbackItem[]
  total: number
  loadingMore: boolean
  onLoadMore: () => void
}) {
  const [tab, setTab] = useState<TextKey>('melhorar')
  const active = TEXT_TABS.find((t) => t.key === tab)!

  return (
    <section aria-labelledby="respostas-titulo" className="rounded-[1.25rem] border border-line bg-white p-6 shadow-sm">
      <h2 id="respostas-titulo" className="font-serif text-2xl font-bold text-ink">
        Respostas escritas
      </h2>

      <div role="tablist" aria-label="Tipo de resposta" className="mt-4 flex flex-wrap gap-2">
        {TEXT_TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 ${
              tab === t.key
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-white text-ink-muted hover:border-brand hover:bg-brand-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm font-semibold text-ink">{active.question}</p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Nenhuma resposta ainda.</p>
      ) : (
        <ul role="tabpanel" className="mt-3 divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <p className="whitespace-pre-wrap break-words leading-7 text-ink">{item[tab]}</p>
              <p className="mt-1.5 text-xs text-ink-muted">
                {item.produto} · {dateFormat.format(new Date(item.created_at))}
              </p>
            </li>
          ))}
        </ul>
      )}

      {items.length < total && (
        <button
          type="button"
          onClick={onLoadMore}
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
