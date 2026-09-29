'use client'

import { useState, type FormEvent } from 'react'
import { Check, LoaderCircle, Send } from 'lucide-react'
import { ApiError, submitSuggestion } from '@/lib/api'
import { PRODUCTS } from '@/lib/feedback-options'

const fieldBase =
  'w-full rounded-xl border border-line bg-white px-4 font-normal text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15'

export function SuggestionForm() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const data = new FormData(event.currentTarget)
    setSending(true)
    setError(null)
    try {
      await submitSuggestion({
        produto: String(data.get('produto') ?? ''),
        texto: String(data.get('texto') ?? ''),
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Algo deu errado. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <section className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_80px_-35px_rgba(87,42,24,0.35)] sm:p-14">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#e6f4e7] text-[#3e8b50]">
          <Check className="size-8" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-brand">Sugestão recebida</p>
        <h2 className="font-serif text-3xl font-bold text-ink">Obrigado pela ideia!</h2>
        <p className="mx-auto mt-4 max-w-md leading-7 text-ink-muted">
          Vamos ler com carinho. É assim que a Última Fatia fica cada dia melhor.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 font-semibold text-brand underline underline-offset-4 hover:text-brand-hover"
        >
          Enviar outra sugestão
        </button>
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
      <section className="rounded-[1.5rem] border border-line bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Caixa de sugestões</p>
          <h2 className="font-serif text-2xl font-bold text-ink">Qual é a sua ideia?</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Um sabor novo, um jeito de melhorar o atendimento, qualquer coisa. Não precisa ter avaliado nada antes.
          </p>
        </div>

        <div className="space-y-6">
          <label className="block space-y-2 text-sm font-semibold text-ink">
            É sobre algum produto? <span className="font-normal text-ink-muted">(opcional)</span>
            <select name="produto" defaultValue="" className={`${fieldBase} h-12 text-ink-muted`}>
              <option value="">Sugestão geral</option>
              {PRODUCTS.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-sm font-semibold text-ink">
            Sua sugestão
            <textarea
              name="texto"
              required
              maxLength={1000}
              rows={5}
              placeholder="Escreva aqui..."
              className={`${fieldBase} resize-none p-4`}
            />
          </label>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="group flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 font-bold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-70"
      >
        {sending ? (
          <>
            Enviando <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          </>
        ) : (
          <>
            Enviar sugestão{' '}
            <Send className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </>
        )}
      </button>
      <div className="pb-8" />
    </form>
  )
}
