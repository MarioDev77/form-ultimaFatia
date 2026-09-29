'use client'

import { useState, type FormEvent } from 'react'
import { LoaderCircle, Lock } from 'lucide-react'
import { SiteLogo } from '@/components/site-logo'
import { adminLogin, ApiError } from '@/lib/api'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await adminLogin(password)
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[1.5rem] border border-line bg-white p-8 text-center shadow-[0_24px_80px_-35px_rgba(87,42,24,0.35)]"
      >
        <SiteLogo size={96} className="mx-auto" />
        <h1 className="mt-5 font-serif text-2xl font-bold text-ink">Painel administrativo</h1>
        <p className="mt-1 text-sm text-ink-muted">Entre para ver as respostas do formulário.</p>

        <label className="mt-6 block text-left text-sm font-semibold text-ink">
          Senha
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-line bg-white pl-10 pr-4 font-normal text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
          </div>
        </label>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand font-bold text-white transition hover:bg-brand-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
