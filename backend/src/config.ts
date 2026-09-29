import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`)
  }
  return value
}

const jwtSecret = required('JWT_SECRET')
if (jwtSecret.length < 16) {
  throw new Error('JWT_SECRET precisa ter pelo menos 16 caracteres')
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL'),
  databaseSsl: process.env.DATABASE_SSL === '1',
  adminPassword: required('ADMIN_PASSWORD'),
  jwtSecret,
  trustProxy: process.env.TRUST_PROXY === '1',
  frontendOrigins: (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}
