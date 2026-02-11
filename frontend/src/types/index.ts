export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  userId: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  title: string;
  description?: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface ChartData {
  monthlyTrends: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    amount: number;
    color: string | null;
  }>;
  incomeExpenseComparison: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}
