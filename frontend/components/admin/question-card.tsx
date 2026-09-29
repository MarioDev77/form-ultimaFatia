import type { Question } from '@/lib/api'
import { BarList, SCALE_COLORS } from './bar-list'

export function QuestionCard({ question }: { question: Question }) {
  return (
    <article className="rounded-[1.25rem] border border-line bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl font-bold text-ink">{question.label}</h3>
        {question.media !== null && (
          <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold tabular-nums text-brand">
            Média {question.media.toFixed(1).replace('.', ',')}/5
          </span>
        )}
      </div>
      <BarList items={question.distribuicao} colors={SCALE_COLORS} />
    </article>
  )
}
