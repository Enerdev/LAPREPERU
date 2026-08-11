# LAPRE-PERU · Backend

API REST con Node.js + Express + TypeScript + Prisma + PostgreSQL.

## 1. Instalar PostgreSQL

Si no lo tienes instalado (Linux/Ubuntu, como tu compañero):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql
```

Dentro de `psql`, crea la base de datos y un usuario:

```sql
CREATE DATABASE lapre_db;
CREATE USER lapre_user WITH ENCRYPTED PASSWORD 'lapre_pass';
GRANT ALL PRIVILEGES ON DATABASE lapre_db TO lapre_user;
\q
```

> Alternativa sin instalar nada localmente: crear una base de datos gratuita en
> [Neon](https://neon.tech) o [Supabase](https://supabase.com) y usar la URL de
> conexión que te dan.

## 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y coloca tu cadena de conexión real, por ejemplo:

```
DATABASE_URL="postgresql://lapre_user:lapre_pass@localhost:5432/lapre_db?schema=public"
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Crear las tablas (migración)

```bash
npm run prisma:migrate
```

Te va a pedir un nombre para la migración, por ejemplo `init`.

## 5. (Opcional) Poblar con datos de ejemplo

Carga los mismos alumnos y pagos que hoy están hardcodeados en el frontend:

```bash
npm run seed
```

## 6. Correr el servidor

```bash
npm run dev
```

Debería mostrar: `🚀 Backend corriendo en http://localhost:4000`

## Endpoints disponibles

| Método | Ruta                  | Descripción              |
|--------|-----------------------|---------------------------|
| GET    | /api/health           | Verifica que el server viva |
| GET    | /api/students         | Lista todos los alumnos   |
| GET    | /api/students/:id     | Detalle de un alumno      |
| POST   | /api/students         | Crea un alumno            |
| PUT    | /api/students/:id     | Actualiza un alumno       |
| DELETE | /api/students/:id     | Elimina un alumno         |
| GET    | /api/payments         | Lista todos los pagos     |
| POST   | /api/payments          | Crea un pago              |
| PUT    | /api/payments/:id      | Actualiza un pago         |
| DELETE | /api/payments/:id      | Elimina un pago           |

## Ver la base de datos visualmente

```bash
npm run prisma:studio
```

Abre una interfaz web en `http://localhost:5555` para ver y editar los datos.

## Siguiente paso: conectar el frontend

En `frontend/`, reemplazar `INITIAL_STUDENTS` e `INITIAL_PAYMENTS` por llamadas
`fetch("http://localhost:4000/api/students")` y `fetch("http://localhost:4000/api/payments")`
dentro de un `useEffect`. Cuando quieras, seguimos con eso.
