# Última Fatia — Formulário de feedback

Site público com duas abas (**Avaliar**: formulário de feedback, e **Sugerir**: caixa de sugestões) + painel administrativo com gráficos dos votos, respostas escritas e sugestões.

```
ultima-fatia-feedback/
├── frontend/   Next.js 16 + Tailwind v4 (formulário em "/" e painel em "/admin")
└── backend/    Express 5 + TypeScript + Postgres (API, login do admin e estatísticas)
```

## Como rodar

Precisa de Node 20+, pnpm e um Postgres.

### 1. Backend

```bash
cd backend
cp .env.example .env      # edite DATABASE_URL, ADMIN_PASSWORD e JWT_SECRET
pnpm install
pnpm dev                  # http://localhost:4000
```

As tabelas `feedbacks` e `suggestions` são criadas sozinhas na primeira execução (se você já rodou uma versão anterior, a `suggestions` aparece ao reiniciar o backend).

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL aponta para o backend
pnpm install
pnpm dev                     # http://localhost:3000
```

- Site público (abas Avaliar e Sugerir): `http://localhost:3000`
- Painel administrativo: `http://localhost:3000/admin` (senha = `ADMIN_PASSWORD` do backend)

## API

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| POST | `/api/feedback` | público (limite de 20 envios / 15 min por IP) | grava uma resposta |
| POST | `/api/suggestions` | público (limite de 20 envios / 15 min por IP) | grava uma sugestão avulsa (produto opcional) |
| POST | `/api/admin/login` | público (limite de 10 tentativas / 15 min) | devolve um token JWT de 8 h |
| GET | `/api/admin/stats?produto=` | admin | votos por pergunta, médias e total por produto |
| GET | `/api/admin/feedbacks?produto=&limit=&offset=` | admin | respostas escritas, da mais recente para a mais antiga |
| GET | `/api/admin/suggestions?limit=&offset=` | admin | caixa de sugestões, da mais recente para a mais antiga |
| GET | `/api/health` | público | verificação de saúde |

## Publicando

- **Backend**: defina as variáveis do `.env.example` no servidor. Em produção, coloque em `FRONTEND_URL` o endereço do site (CORS) e use `TRUST_PROXY=1` se estiver atrás de proxy. Se o Postgres exigir SSL, `DATABASE_SSL=1`.
- **Frontend**: defina `NEXT_PUBLIC_API_URL` com o endereço público do backend antes do build.
- Troque `ADMIN_PASSWORD` e `JWT_SECRET` por valores próprios e longos.

## Perguntas e escalas

As opções (produtos e escalas) ficam em `frontend/lib/feedback-options.ts` e em `backend/src/constants.ts`.
Se mudar uma, mude a outra — o backend só aceita os textos exatos.

## Deploy no Railway (monorepo)

- Crie **um serviço para cada pasta** e defina o *Root Directory* como `backend` num e `frontend` no outro.
- Backend: adicione o plugin Postgres e, nas variáveis do serviço, `DATABASE_URL` (referência ao Postgres), `ADMIN_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL` (endereço do frontend) e `TRUST_PROXY=1`. A porta vem do próprio Railway (`PORT`).
- Frontend: defina `NEXT_PUBLIC_API_URL` com o endereço público do backend **antes** do deploy (ela é embutida no build).
