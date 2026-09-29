import type { Bucket } from '@/lib/api'

// Cores da melhor (verde) para a pior opção da escala.
export const SCALE_COLORS = ['#3f8a4f', '#8aa832', '#d9a521', '#d9782b', '#c2452f']

// Barras horizontais: o número de votos e a porcentagem ficam sempre escritos,
// então o gráfico não depende só da cor.
export function BarList({ items, colors }: { items: Bucket[]; colors?: string[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const percent = total > 0 ? (item.count / total) * 100 : 0
        return (
          <li key={item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink">{item.label}</span>
              <span className="shrink-0 tabular-nums text-ink-muted">
                <strong className="font-semibold text-ink">{item.count}</strong>{' '}
                {item.count === 1 ? 'voto' : 'votos'} · {Math.round(percent)}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-brand-soft" aria-hidden="true">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${percent}%`,
                  backgroundColor: colors?.[index] ?? 'var(--brand)',
                }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
