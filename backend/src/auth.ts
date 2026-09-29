import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from './config.js'

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest()
}

export function passwordMatches(candidate: string) {
  // Compara os hashes (tamanho fixo) em tempo constante.
  return crypto.timingSafeEqual(sha256(candidate), sha256(config.adminPassword))
}

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '8h' })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (typeof payload === 'object' && payload.role === 'admin') {
      return next()
    }
  } catch {
    // cai no 401 abaixo
  }
  res.status(401).json({ error: 'Não autorizado' })
}
