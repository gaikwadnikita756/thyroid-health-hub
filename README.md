# Thyroid Health Hub

A web application to help patients and clinicians manage thyroid-related health information, appointments, screenings, and reports.

## Features

- Patient and doctor dashboards
- Appointment booking and management
- AI-assisted screening endpoints
- Report uploads and viewing
- Auth with role-based access

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- Backend: Node.js, Express (server folder), Prisma (Postgres)

## Getting started

Prerequisites:

- Node.js 18+ and npm or yarn
- PostgreSQL (or use the provided connection in `server/prisma.ts`)

Quick start:

```bash
# from repo root
cd thyroid-health-hub
npm install
# start frontend dev server
npm run dev
# in another terminal: start backend
cd server
npm install
npm run dev
```

Database (Prisma):

```bash
# run migrations and seed (from repo root)
npx prisma migrate deploy
node prisma/seed.ts
```

## Run tests

```bash
npm test
```

## Contributing

Contributions are welcome. Please open issues or pull requests on the repository.

## License

This project is provided as-is. Add a license file if you want to clarify terms.

## Repository

Remote: https://github.com/gaikwadnikita756/thyroid-health-hub
