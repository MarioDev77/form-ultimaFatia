import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { pool } from '../db.js'
import { suggestionSchema } from '../validation.js'

export const suggestionsRouter = Router()

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitos envios em pouco tempo. Tente novamente mais tarde.' },
})

// Recebe uma sugestão avulsa (aba "Sugerir" do site).
suggestionsRouter.post('/', submitLimiter, async (req, res) => {
  const parsed = suggestionSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      campos: [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))],
    })
  }

  const { produto, texto } = parsed.data
  const { rows } = await pool.query(
    'INSERT INTO suggestions (produto, texto) VALUES ($1, $2) RETURNING id',
    [produto ?? null, texto],
  )
  res.status(201).json({ id: rows[0].id })
})
