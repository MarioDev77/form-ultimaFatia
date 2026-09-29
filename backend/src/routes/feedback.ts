import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { RATING_FIELD_KEYS, TEXT_FIELDS } from '../constants.js'
import { pool } from '../db.js'
import { feedbackSchema } from '../validation.js'

export const feedbackRouter = Router()

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitos envios em pouco tempo. Tente novamente mais tarde.' },
})

const COLUMNS = ['produto', ...RATING_FIELD_KEYS, ...TEXT_FIELDS] as const

// Recebe uma resposta do formulário público.
feedbackRouter.post('/', submitLimiter, async (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      campos: [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))],
    })
  }

  const data = parsed.data as Record<string, string>
  const placeholders = COLUMNS.map((_, i) => `$${i + 1}`).join(', ')
  const { rows } = await pool.query(
    `INSERT INTO feedbacks (${COLUMNS.join(', ')}) VALUES (${placeholders}) RETURNING id`,
    COLUMNS.map((column) => data[column]),
  )

  res.status(201).json({ id: rows[0].id })
})
