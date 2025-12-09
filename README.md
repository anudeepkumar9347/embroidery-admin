# Admin Panel

React-based admin dashboard for managing embroidery designs, orders, categories, and collections.

## Features

- **Dashboard**: Overview of sales, orders, and key metrics
- **Design Management**: Create, edit, and manage embroidery designs
- **Order Management**: View and process customer orders
- **Categories & Collections**: Organize designs into categories and collections
- **Authentication**: Secure JWT-based auth with role-based access control

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (data fetching)
- React Router (routing)
- Axios (API client)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── lib/           # Utilities and API client
├── pages/         # Page components
└── main.tsx       # Entry point
```
