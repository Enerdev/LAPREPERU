# LAPRE-PERU

Proyecto fullstack dividido en frontend y backend.

## Estructura general

```
LAPRE-PERU/
├── backend/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   ├── migrations/
│   │   │   ├── migration_lock.toml
│   │   │   └── 20260811201017_init/
│   │   │       └── migration.sql
│   ├── README.md
│   └── src/
│       ├── index.ts
│       ├── lib/
│       │   └── prisma.ts
│       ├── routes/
│       │   ├── students.routes.ts
│       │   └── payments.routes.ts
│       └── controllers/
│           ├── students.controller.ts
│           └── payments.controller.ts
├── frontend/
│   ├── .env
│   ├── ATTRIBUTIONS.md
│   ├── default_shadcn_theme.css
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── pnpm-workspace.yaml
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── vite.config.ts
│   ├── guidelines/
│   │   └── Guidelines.md
│   └── src/
│       ├── main.tsx
│       ├── app/
│       │   ├── App.tsx
│       │   ├── components/
│       │   │   ├── Header.tsx
│       │   │   ├── ModuleCard.tsx
│       │   │   ├── ProgressCard.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── TasksCard.tsx
│       │   │   ├── WelcomeCard.tsx
│       │   │   └── figma/
│       │   │       └── ImageWithFallback.tsx
│       │   └── components/ui/
│       │       ├── accordion.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── alert.tsx
│       │       ├── aspect-ratio.tsx
│       │       ├── avatar.tsx
│       │       ├── badge.tsx
│       │       ├── breadcrumb.tsx
│       │       ├── button.tsx
│       │       ├── calendar.tsx
│       │       ├── card.tsx
│       │       ├── carousel.tsx
│       │       ├── chart.tsx
│       │       ├── checkbox.tsx
│       │       ├── collapsible.tsx
│       │       ├── command.tsx
│       │       ├── context-menu.tsx
│       │       ├── dialog.tsx
│       │       ├── drawer.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── form.tsx
│       │       ├── hover-card.tsx
│       │       ├── input-otp.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       ├── menubar.tsx
│       │       ├── navigation-menu.tsx
│       │       ├── pagination.tsx
│       │       ├── popover.tsx
│       │       ├── progress.tsx
│       │       ├── radio-group.tsx
│       │       ├── resizable.tsx
│       │       ├── scroll-area.tsx
│       │       ├── select.tsx
│       │       ├── separator.tsx
│       │       ├── sheet.tsx
│       │       ├── sidebar.tsx
│       │       ├── skeleton.tsx
│       │       ├── slider.tsx
│       │       ├── sonner.tsx
│       │       ├── switch.tsx
│       │       ├── table.tsx
│       │       ├── tabs.tsx
│       │       ├── textarea.tsx
│       │       ├── toggle-group.tsx
│       │       ├── toggle.tsx
│       │       ├── tooltip.tsx
│       │       ├── use-mobile.ts
│       │       └── utils.ts
│       ├── imports/
│       │   └── image.png
│       └── styles/
│           ├── fonts.css
│           ├── globals.css
│           ├── index.css
│           ├── tailwind.css
│           └── theme.css
└── .gitignore
```

## Qué contiene cada parte

### backend

- `backend/.env` con `DATABASE_URL` y `PORT`
- `backend/package.json` y `backend/package-lock.json`
- `backend/prisma/schema.prisma` para el modelo de datos
- `backend/prisma/seed.ts` para poblar la base de datos
- `backend/src/index.ts` arranca el servidor Express
- `backend/src/routes/` define rutas de estudiantes y pagos
- `backend/src/controllers/` contiene la lógica de API
- `backend/src/lib/prisma.ts` exporta la conexión de Prisma

### frontend

- `frontend/.env` con `VITE_API_URL` para apuntar al backend
- `frontend/src/app/App.tsx` es el archivo principal de la app
- `frontend/src/app/components/` contiene los componentes visuales
- `frontend/src/app/components/ui/` contiene componentes de UI reutilizables
- `frontend/src/styles/` contiene estilos globales y Tailwind
- `frontend/vite.config.ts` configura Vite y los alias de importación

## Ejecutar el proyecto

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Notas clave

- El backend y el frontend son proyectos separados que se comunican por HTTP.
- Para el frontend el valor importante es `frontend/.env` con `VITE_API_URL`.
- `backend/.env` controla la base de datos (`DATABASE_URL`) y el puerto del servidor.
- Si el backend ya no corre local, reemplaza `VITE_API_URL` por la URL del backend desplegado.
