// Opções do formulário. O frontend usa exatamente os mesmos textos.

export const PRODUCTS = [
  'Morango Cravejado',
  'Cone Trufado',
  'Picolé',
  'Sanduíche Natural',
] as const

export const QUALITY_SCALE = ['Excelente', 'Muito bom', 'Bom', 'Regular', 'Pode melhorar'] as const

export const INTENT_SCALE = [
  'Com certeza',
  'Provavelmente',
  'Talvez',
  'Provavelmente não',
  'Não',
] as const

// Perguntas de múltipla escolha, com a escala usada em cada uma.
// A ordem da escala define a nota: primeira opção = 5, última = 1.
export const RATING_FIELDS = {
  sabor: { label: 'Sabor', scale: QUALITY_SCALE },
  qualidade: { label: 'Qualidade', scale: QUALITY_SCALE },
  apresentacao: { label: 'Apresentação', scale: QUALITY_SCALE },
  precos: { label: 'Preços', scale: QUALITY_SCALE },
  custo_beneficio: { label: 'Custo-benefício', scale: QUALITY_SCALE },
  compraria: { label: 'Compraria novamente?', scale: INTENT_SCALE },
  recomendaria: { label: 'Recomendaria?', scale: INTENT_SCALE },
} as const

export type RatingField = keyof typeof RATING_FIELDS
export const RATING_FIELD_KEYS = Object.keys(RATING_FIELDS) as RatingField[]

export const TEXT_FIELDS = ['preferido', 'gostou', 'melhorar', 'sugestoes'] as const
export type TextField = (typeof TEXT_FIELDS)[number]
