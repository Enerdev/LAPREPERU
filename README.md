# LAPRE-PERU

Proyecto separado en dos partes:

```
LAPRE-PERU/
├── frontend/   → Aplicación React + Vite (todo el código que ya tenías)
└── backend/    → Reservado para la API (aún vacío, pendiente de definir stack)
```

## frontend/

Es tu proyecto original, sin cambios en el código. Para correrlo:

```bash
cd frontend
npm install   # o pnpm install
npm run dev
```

Actualmente el frontend usa **datos simulados en memoria** (mock data) dentro de `App.tsx`
(por ejemplo `INITIAL_STUDENTS`, `INITIAL_PAYMENTS`). No hay llamadas a ninguna API todavía.
Cuando el backend esté listo, esos datos se reemplazarán por `fetch`/`axios` hacia los
endpoints correspondientes.

## backend/

Carpeta vacía por ahora, lista para cuando definas el stack (Express, NestJS, etc.).
Sugerencia de estructura cuando empieces:

```
backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── index.js (o main.ts)
├── package.json
└── .env
```

## Notas

- Cada carpeta (`frontend/` y `backend/`) tendrá su propio `package.json` y sus propias
  dependencias — son proyectos independientes que luego se comunican por HTTP (API REST).
- Si en el futuro quieres manejar ambos con un solo comando (`npm install` en la raíz que
  instale todo), se puede configurar un monorepo con `pnpm workspaces` o `npm workspaces`.
