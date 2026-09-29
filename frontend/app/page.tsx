import { PublicTabs } from '@/components/public-tabs'
import { SiteLogo } from '@/components/site-logo'

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <header className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
        <SiteLogo size={132} className="shadow-[0_18px_50px_-20px_rgba(61,35,20,0.45)]" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-brand">
          Formulário de feedback
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">
          Como foi a sua fatia?
        </h1>
        <p className="mt-3 max-w-md leading-7 text-ink-muted">
          Leva menos de dois minutos. Cada resposta ajuda a Última Fatia a melhorar.
        </p>
      </header>

      <PublicTabs />
    </main>
  )
}
