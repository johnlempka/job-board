## Job Board – Getting Started

This repository contains a Next.js (App Router) job board backed by a PostgreSQL database accessed through Prisma. Follow the steps below to set up and run the project from scratch.

### Live demo

Visit the deployed build at <https://job-board-woad-five.vercel.app/>.

### Feature overview

- Job detail route that mirrors the interview requirements: rich posting data plus an AI chat box that remembers prior turns.
- A jobs list page at `/` so reviewers can browse every posting before drilling into an individual role; this keeps navigation simple while still satisfying the “view a specific job post” requirement by linking into the detailed view.

---

## 1. Prerequisites

- Node.js 20+
- npm (ships with Node)
- PostgreSQL 14+ (local instance or hosted database)

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

1. Copy `.env.example` → `.env` (or create `.env` manually if an example file is not present).
2. Provide values for:
   - `DATABASE_URL` – PostgreSQL connection string (`postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=disable`)
   - `GEMINI_API_KEY` – Google Generative AI key used by the job chat feature

Example:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/job_board
GEMINI_API_KEY=your-api-key
```

---

## 4. Apply database schema

Run migrations to create the schema in the database referenced by `DATABASE_URL`:

```bash
npx prisma generate
npx prisma migrate deploy
```

> This applies the committed migrations. No seed data runs automatically.

Optional: insert sample data by running the seed script.

```bash
npx prisma db seed
```

---

## 5. Start the development server

```bash
npm run dev
```

Visit <http://localhost:3000> and interact with the app.

---

## 6. Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Generate Prisma client & build the production bundle |
| `npm start` | Run the production build |
| `npm test` | Execute the lightweight service-layer test suite |
| `npx prisma generate` | Regenerate the Prisma client (after schema changes) |
| `npx prisma studio` | Inspect/edit DB records via Prisma Studio |
| `npx prisma migrate reset --skip-seed` | Drop & recreate the DB (schema only) |

---

## 7. Deployment notes

- Production (e.g., Vercel) must define the same `DATABASE_URL` & `GEMINI_API_KEY`.
- After resetting the remote DB, redeploy so the runtime picks up the new state.

---

## 8. Support

If you run into setup issues, open an issue or reach out with the steps you followed and the error output.

---

## 9. Design decisions

- Store full bidirectional chat history so the LLM always has the entire conversation context (user + assistant messages).
- Submit the complete chat transcript along with the related job/company metadata to the LLM so responses stay grounded in prior answers.
- Keep perks, benefits, responsibilities, and similar structured fields in JSON/string columns for flexible rendering and easier iteration without heavy schema migrations.

---

## 10. Potential improvements

- Add a search experience on the home page so candidates can filter by title, stack, or location.
- Introduce pagination for job results to keep responses fast and reduce payload size.
- Move filtering logic to server-side queries to support search + pagination efficiently.
- Expand the prompt instructions so the LLM attempts to enrich missing details via external sources when the submitted job/company data is incomplete.
- Add an integration-style test for the chat API route that mocks the Gemini client to cover the multi-turn flow without hitting the real model.
