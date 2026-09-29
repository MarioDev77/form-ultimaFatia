import pg from 'pg'
import { config } from './config.js'

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id              SERIAL PRIMARY KEY,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      produto         TEXT NOT NULL,
      sabor           TEXT NOT NULL,
      qualidade       TEXT NOT NULL,
      apresentacao    TEXT NOT NULL,
      precos          TEXT NOT NULL,
      custo_beneficio TEXT NOT NULL,
      compraria       TEXT NOT NULL,
      recomendaria    TEXT NOT NULL,
      preferido       TEXT NOT NULL,
      gostou          TEXT NOT NULL,
      melhorar        TEXT NOT NULL,
      sugestoes       TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS feedbacks_created_at_idx ON feedbacks (created_at DESC);
    CREATE INDEX IF NOT EXISTS feedbacks_produto_idx ON feedbacks (produto);

    CREATE TABLE IF NOT EXISTS suggestions (
      id         SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      produto    TEXT,
      texto      TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS suggestions_created_at_idx ON suggestions (created_at DESC);
  `)
}
