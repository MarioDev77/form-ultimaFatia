import { z } from 'zod'
import { PRODUCTS, RATING_FIELDS, RATING_FIELD_KEYS, TEXT_FIELDS } from './constants.js'

const text = z.string().trim().min(1).max(1000)

const ratingShape = Object.fromEntries(
  RATING_FIELD_KEYS.map((key) => [
    key,
    z.enum(RATING_FIELDS[key].scale as unknown as [string, ...string[]]),
  ]),
)

const textShape = Object.fromEntries(TEXT_FIELDS.map((key) => [key, text]))

export const feedbackSchema = z.object({
  produto: z.enum(PRODUCTS),
  ...ratingShape,
  ...textShape,
})

export type FeedbackInput = z.infer<typeof feedbackSchema>

// Aba de sugestões: o produto é opcional (vazio = sugestão geral).
export const suggestionSchema = z.object({
  produto: z.preprocess((value) => (value === '' ? undefined : value), z.enum(PRODUCTS).optional()),
  texto: z.string().trim().min(1).max(1000),
})
