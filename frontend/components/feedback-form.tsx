'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { Check, Heart, LoaderCircle, Send, Star } from 'lucide-react'
import { ApiError, submitFeedback } from '@/lib/api'
import { INTENT_SCALE, PRODUCTS, QUALITY_SCALE } from '@/lib/feedback-options'

const fieldBase =
  'w-full rounded-xl border border-line bg-white px-4 font-normal text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15'

function RatingRow({
  label,
  name,
  options = QUALITY_SCALE,
  withStar = true,
}: {
  label: string
  name: string
  options?: readonly string[]
  withStar?: boolean
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input type="radio" name={name} value={option} required className="peer sr-only" />
            <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-4 text-sm text-ink-muted transition hover:border-brand hover:bg-brand-soft peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand/25">
              {withStar && <Star className="mr-1.5 size-3.5 fill-current" aria-hidden="true" />}
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Section({
  step,
  kicker,
  title,
  children,
}: {
  step: string
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[1.5rem] border border-line bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-bold text-brand">
          {step}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{kicker}</p>
          <h2 className="font-serif text-2xl font-bold text-ink">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  )
}

function TextArea({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-ink">
      {label}
      <textarea
        name={name}
        required
        maxLength={1000}
        rows={3}
        placeholder={placeholder}
        className={`${fieldBase} resize-none p-4`}
      />
    </label>
  )
}

export function FeedbackForm() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>
    setSending(true)
    setError(null)

    try {
      await submitFeedback(data)
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
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-brand">Feedback recebido</p>
        <h2 className="font-serif text-3xl font-bold text-ink">Obrigado por compartilhar!</h2>
        <p className="mx-auto mt-4 max-w-md leading-7 text-ink-muted">
          Sua opinião ajuda a Última Fatia a deixar cada pedaço ainda mais especial.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 font-semibold text-brand underline underline-offset-4 hover:text-brand-hover"
        >
          Enviar outra resposta
        </button>
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
      <Section step="01" kicker="Primeiro, conte" title="Sobre o produto">
        <div className="space-y-6">
          <label className="block space-y-2 text-sm font-semibold text-ink">
            Qual produto você experimentou?
            <select name="produto" required defaultValue="" className={`${fieldBase} h-12 text-ink-muted`}>
              <option value="" disabled>
                Selecione uma opção
              </option>
              {PRODUCTS.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </label>
          <RatingRow label="Sabor" name="sabor" />
          <RatingRow label="Qualidade" name="qualidade" />
          <RatingRow label="Apresentação" name="apresentacao" />
        </div>
      </Section>

      <Section step="02" kicker="Vamos falar de" title="Preço">
        <div className="space-y-6">
          <RatingRow label="Como você avalia nossos preços?" name="precos" />
          <RatingRow label="Custo-benefício" name="custo_beneficio" />
        </div>
      </Section>

      <Section step="03" kicker="Sua experiência" title="O que achou?">
        <div className="space-y-6">
          <label className="block space-y-2 text-sm font-semibold text-ink">
            Qual foi seu produto preferido?
            <input
              name="preferido"
              required
              maxLength={1000}
              placeholder="Conte pra gente..."
              className={`${fieldBase} h-12`}
            />
          </label>
          <RatingRow label="Compraria novamente?" name="compraria" options={INTENT_SCALE} withStar={false} />
          <RatingRow label="Recomendaria?" name="recomendaria" options={INTENT_SCALE} withStar={false} />
        </div>
      </Section>

      <Section step="04" kicker="Para finalizar" title="Sua opinião">
        <div className="space-y-5">
          <TextArea name="gostou" label="O que você mais gostou?" placeholder="Sua parte favorita..." />
          <TextArea name="melhorar" label="O que podemos melhorar?" placeholder="Toda sugestão é bem-vinda..." />
          <TextArea name="sugestoes" label="Tem alguma sugestão?" placeholder="Compartilhe uma ideia com a gente..." />
        </div>
      </Section>

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
            Enviar meu feedback{' '}
            <Send className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 pb-8 text-center text-xs text-ink-muted">
        <Heart className="size-3.5 fill-brand text-brand" aria-hidden="true" /> Obrigado por ajudar a gente a melhorar.
      </p>
    </form>
  )
}

export default FeedbackForm
