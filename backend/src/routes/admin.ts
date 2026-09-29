import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { passwordMatches, requireAdmin, signAdminToken } from '../auth.js'
import { PRODUCTS, RATING_FIELDS, RATING_FIELD_KEYS } from '../constants.js'
import { pool } from '../db.js'

export const adminRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
})

adminRouter.post('/login', loginLimiter, (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!password || !passwordMatches(password)) {
    return res.status(401).json({ error: 'Senha incorreta' })
  }
  res.json({ token: signAdminToken() })
})

const filterSchema = z.object({
  produto: z.enum(PRODUCTS).optional(),
})

// Gráficos: contagem de votos por pergunta, média e total por produto.
adminRouter.get('/stats', requireAdmin, async (req, res) => {
  const filter = filterSchema.safeParse(req.query)
  if (!filter.success) return res.status(400).json({ error: 'Produto inválido' })

  const { produto } = filter.data
  const where = produto ? 'WHERE produto = $1' : ''
  const params = produto ? [produto] : []

  const [totalResult, produtosResult, ...ratingResults] = await Promise.all([
    pool.query(`SELECT count(*)::int AS total FROM feedbacks ${where}`, params),
    pool.query(`SELECT produto AS label, count(*)::int AS count FROM feedbacks ${where} GROUP BY produto`, params),
    // Os nomes das colunas vêm de uma lista fixa (RATING_FIELD_KEYS), nunca do usuário.
    ...RATING_FIELD_KEYS.map((field) =>
      pool.query(`SELECT ${field} AS label, count(*)::int AS count FROM feedbacks ${where} GROUP BY ${field}`, params),
    ),
  ])

  const total: number = totalResult.rows[0].total

  const countByProduct = new Map<string, number>(produtosResult.rows.map((r) => [r.label, r.count]))
  const produtos = PRODUCTS.map((label) => ({ label, count: countByProduct.get(label) ?? 0 }))

  const perguntas = RATING_FIELD_KEYS.map((campo, index) => {
    const { label, scale } = RATING_FIELDS[campo]
    const counts = new Map<string, number>(ratingResults[index].rows.map((r) => [r.label, r.count]))
    const distribuicao = scale.map((option) => ({ label: option, count: counts.get(option) ?? 0 }))

    // Primeira opção da escala vale 5 pontos, a última vale 1.
    const points = distribuicao.reduce((sum, item, i) => sum + item.count * (scale.length - i), 0)
    const media = total > 0 ? Math.round((points / total) * 100) / 100 : null

    return { campo, label, media, distribuicao }
  })

  res.json({ total, produtos, perguntas })
})

const listSchema = z.object({
  produto: z.enum(PRODUCTS).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

// Respostas escritas (e demais campos) de cada envio, da mais recente para a mais antiga.
adminRouter.get('/feedbacks', requireAdmin, async (req, res) => {
  const query = listSchema.safeParse(req.query)
  if (!query.success) return res.status(400).json({ error: 'Parâmetros inválidos' })

  const { produto, limit, offset } = query.data
  const where = produto ? 'WHERE produto = $1' : ''
  const params: unknown[] = produto ? [produto] : []

  const [totalResult, itemsResult] = await Promise.all([
    pool.query(`SELECT count(*)::int AS total FROM feedbacks ${where}`, params),
    pool.query(
      `SELECT * FROM feedbacks ${where} ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    ),
  ])

  res.json({ total: totalResult.rows[0].total, items: itemsResult.rows })
})

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

// Caixa de sugestões (aba "Sugerir" do site), da mais recente para a mais antiga.
adminRouter.get('/suggestions', requireAdmin, async (req, res) => {
  const query = paginationSchema.safeParse(req.query)
  if (!query.success) return res.status(400).json({ error: 'Parâmetros inválidos' })

  const { limit, offset } = query.data
  const [totalResult, itemsResult] = await Promise.all([
    pool.query('SELECT count(*)::int AS total FROM suggestions'),
    pool.query('SELECT * FROM suggestions ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2', [limit, offset]),
  ])

  res.json({ total: totalResult.rows[0].total, items: itemsResult.rows })
})
