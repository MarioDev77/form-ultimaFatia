import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import helmet from 'helmet'
import { config } from './config.js'
import { initDb, pool } from './db.js'
import { adminRouter } from './routes/admin.js'
import { feedbackRouter } from './routes/feedback.js'
import { suggestionsRouter } from './routes/suggestions.js'

const app = express()

if (config.trustProxy) app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({ origin: config.frontendOrigins }))
app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/feedback', feedbackRouter)
app.use('/api/suggestions', suggestionsRouter)
app.use('/api/admin', adminRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// JSON malformado vira 400; qualquer outro erro vira 500 sem vazar detalhes.
app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed' || err.status === 400) {
    return res.status(400).json({ error: 'Requisição inválida' })
  }
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

async function main() {
  await initDb()
  const server = app.listen(config.port, () => {
    console.log(`API rodando em http://localhost:${config.port}`)
  })

  const shutdown = () => {
    server.close(() => pool.end().then(() => process.exit(0)))
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error('Falha ao iniciar a API:', error)
  process.exit(1)
})
