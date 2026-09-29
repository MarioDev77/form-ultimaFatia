// Opções do formulário. O backend valida exatamente com os mesmos textos.

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

export const TEXT_TABS = [
  { key: 'melhorar', label: 'Melhorias', question: 'O que podemos melhorar?' },
  { key: 'sugestoes', label: 'Sugestões', question: 'Tem alguma sugestão?' },
  { key: 'gostou', label: 'O que gostaram', question: 'O que você mais gostou?' },
  { key: 'preferido', label: 'Preferidos', question: 'Qual foi seu produto preferido?' },
] as const

export type TextKey = (typeof TEXT_TABS)[number]['key']
