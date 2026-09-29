const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')
const TOKEN_KEY = 'ultima-fatia-admin-token'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// ---- token (guardado só na aba do navegador) ----

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // sem storage disponível: o login vale só até recarregar a página
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignora
  }
}

// ---- requisições ----

async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  if (auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Tente novamente.', 0)
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(data?.error ?? 'Algo deu errado. Tente novamente.', response.status)
  }
  return data as T
}

// ---- tipos ----

export type FeedbackPayload = Record<string, string>

export type Bucket = { label: string; count: number }

export type Question = {
  campo: string
  label: string
  media: number | null
  distribuicao: Bucket[]
}

export type Stats = {
  total: number
  produtos: Bucket[]
  perguntas: Question[]
}

export type FeedbackItem = {
  id: number
  created_at: string
  produto: string
  preferido: string
  gostou: string
  melhorar: string
  sugestoes: string
}

export type FeedbackList = { total: number; items: FeedbackItem[] }

export type SuggestionItem = {
  id: number
  created_at: string
  produto: string | null
  texto: string
}

export type SuggestionList = { total: number; items: SuggestionItem[] }

// ---- chamadas ----

export function submitFeedback(payload: FeedbackPayload) {
  return request<{ id: number }>('/api/feedback', { method: 'POST', body: JSON.stringify(payload) })
}

export async function adminLogin(password: string) {
  const { token } = await request<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  setToken(token)
}

function withProduct(path: string, produto: string, extra: Record<string, string | number> = {}) {
  const params = new URLSearchParams()
  if (produto) params.set('produto', produto)
  for (const [key, value] of Object.entries(extra)) params.set(key, String(value))
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function fetchStats(produto: string) {
  return request<Stats>(withProduct('/api/admin/stats', produto), {}, true)
}

export function fetchFeedbacks(produto: string, offset: number, limit = 20) {
  return request<FeedbackList>(withProduct('/api/admin/feedbacks', produto, { offset, limit }), {}, true)
}

export function submitSuggestion(payload: { produto: string; texto: string }) {
  return request<{ id: number }>('/api/suggestions', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchSuggestions(offset: number, limit = 20) {
  return request<SuggestionList>(`/api/admin/suggestions?offset=${offset}&limit=${limit}`, {}, true)
}
