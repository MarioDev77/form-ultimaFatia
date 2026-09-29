'use client'

import { useState } from 'react'
import { FeedbackForm } from './feedback-form'
import { SuggestionForm } from './suggestion-form'

const TABS = [
  { key: 'avaliar', label: 'Avaliar' },
  { key: 'sugerir', label: 'Sugerir' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function PublicTabs() {
  const [tab, setTab] = useState<TabKey>('avaliar')

  return (
    <>
      <div
        role="tablist"
        aria-label="O que você quer fazer?"
        className="mx-auto mb-6 flex max-w-2xl gap-1 rounded-full border border-line bg-white p-1 shadow-sm"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            aria-controls={`painel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`h-11 flex-1 rounded-full text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 ${
              tab === t.key ? 'bg-brand text-white shadow' : 'text-ink-muted hover:bg-brand-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`painel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'avaliar' ? <FeedbackForm /> : <SuggestionForm />}
      </div>
    </>
  )
}
