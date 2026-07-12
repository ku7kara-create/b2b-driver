# B2B Driver

On-demand transportation and logistics platform connecting customers with private drivers, cargo transport (Porters), and tow trucks (Flatbeds) through a real-time bidding/matching system.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + shadcn/ui
- **API Layer:** tRPC 11 (type-safe)
- **Database:** SQLite (dev) / PostgreSQL (prod) via Prisma 7
- **Auth:** NextAuth.js 4
- **Real-time:** Socket.io 4
- **Maps:** Mapbox GL JS 3

## Getting Started

```bash
npm install
cp .env.example .env.local
npx prisma db push
npm run dev
```

## Project Structure

```
src/
  app/              # Next.js App Router pages
    (customer)/     # Customer-facing app
    (driver)/       # Driver-facing app
    (admin)/        # Admin dashboard
    api/            # API routes
  server/           # Backend logic (tRPC, Socket.io)
  lib/              # Shared utilities
  components/       # React components
  hooks/            # Custom React hooks
prisma/
  schema.prisma     # Database schema
public/
  uploads/          # File uploads (cargo photos)
```
