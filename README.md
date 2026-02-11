# Personal Expenses App

A full-stack personal expenses tracking application built with React (TypeScript, TailwindCSS, Shadcn UI) for the frontend and Express.js (TypeScript) with PostgreSQL for the backend.

## Features

- **Authentication/Authorization**: JWT-based authentication with role-based access control (Admin, User)
- **Dashboard**: Balance overview (Income/Expenses), statistics, and Chart.js visualizations
- **Categories Management**: Create and manage income/expense categories with custom colors
- **Transactions**: Add, edit, delete income and expense transactions
- **Filtering & Search**: Filter transactions by title, date, category, type, and amount range
- **Pagination**: Paginated transaction list
- **Export**: Export transactions as CSV or TXT files
- **Theme**: Light/Dark mode toggle

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- TailwindCSS
- Shadcn UI
- Chart.js
- React Router
- Axios

### Backend
- Express.js with TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (local installation)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Install PostgreSQL locally if not already installed
2. Create a new database:
   ```sql
   CREATE DATABASE expenses_db;
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/expenses_db?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   ```

   Replace `user` and `password` with your PostgreSQL credentials.

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## Project Structure

```
expenses-app/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication routes & controllers
│   │   ├── users/         # User management
│   │   ├── categories/    # Categories CRUD
│   │   ├── transactions/  # Transactions CRUD
│   │   ├── dashboard/     # Dashboard statistics
│   │   ├── export/        # Export functionality
│   │   ├── middleware/    # Auth & error handling
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities & API client
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users` - Get all users (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Transactions
- `GET /api/transactions` - Get transactions (with filters & pagination)
- `GET /api/transactions/:id` - Get transaction by ID
- `GET /api/transactions/statistics` - Get transaction statistics
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Dashboard
- `GET /api/dashboard/balance` - Get balance summary
- `GET /api/dashboard/charts` - Get chart data
- `GET /api/dashboard/statistics` - Get dashboard statistics

### Export
- `GET /api/export/csv` - Export transactions as CSV
- `GET /api/export/txt` - Export transactions as TXT

## Usage

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Register a new account or login
4. Create categories for your income and expenses
5. Add transactions to track your finances
6. View your dashboard for insights and statistics
7. Export your data as needed

## Development

### Backend Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

ISC
# expenses-app-09-25
