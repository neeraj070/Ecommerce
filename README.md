# MERN Ecommerce Backend + Frontend

A structured MERN ecommerce starter with:

- Express + MongoDB backend
- React + Vite frontend
- Users, products, and orders
- JWT login/register flow
- Admin-friendly dashboard views
- Seed data for quick testing

## Project Structure

```txt
client/   React frontend
server/   Express, MongoDB, API routes
```

## Setup

1. Install dependencies:

```bash
npm.cmd run install:all
```

2. Create `server/.env` from the example:

```bash
copy server\.env.example server\.env
```

3. Make sure MongoDB is running locally, or set `MONGO_URI` in `server/.env`.

4. Seed demo data:

```bash
npm.cmd run seed
```

5. Start backend and frontend:

```bash
npm.cmd run dev
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:5000/api`

## Demo Login

```txt
Email: admin@example.com
Password: admin123
```
