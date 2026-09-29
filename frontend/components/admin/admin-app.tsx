'use client'

import { useEffect, useState } from 'react'
import { clearToken, getToken } from '@/lib/api'
import { Dashboard } from './dashboard'
import { LoginForm } from './login-form'

export function AdminApp() {
  // null = ainda verificando se já existe sessão nesta aba
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    setAuthed(Boolean(getToken()))
  }, [])

  function logout() {
    clearToken()
    setAuthed(false)
  }

  if (authed === null) return null
  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />
  return <Dashboard onLogout={logout} />
}
