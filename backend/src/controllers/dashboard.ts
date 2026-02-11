import { Response, NextFunction } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';
import { TransactionType } from '../types';

const parseDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;
  return new Date(date);
};

export const getBalanceSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = parseDate(startDate as string);
      }
      if (endDate) {
        where.date.lte = parseDate(endDate as string);
      }
    }

    const [incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: TransactionType.INCOME,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: TransactionType.EXPENSE,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChartData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = parseDate(startDate as string);
      }
      if (endDate) {
        where.date.lte = parseDate(endDate as string);
      }
    }

    // Get all transactions for chart data
    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        type: true,
        amount: true,
        date: true,
        categoryId: true,
        category: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Monthly trends data
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === TransactionType.INCOME) {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    });

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
    }));

    // Category breakdown
    const categoryData: Record<string, { name: string; amount: number; color: string | null }> = {};
    transactions.forEach((transaction) => {
      const key = transaction.categoryId;
      if (!categoryData[key]) {
        categoryData[key] = {
          name: transaction.category.name,
          amount: 0,
          color: transaction.category.color,
        };
      }
      categoryData[key].amount += transaction.amount;
    });

    const categoryBreakdown = Object.values(categoryData).sort((a, b) => b.amount - a.amount);

    // Income vs Expense comparison (by month)
    const incomeExpenseComparison = monthlyTrends.map((item) => ({
      month: item.month,
      income: item.income,
      expense: item.expense,
    }));

    res.json({
      success: true,
      data: {
        monthlyTrends,
        categoryBreakdown,
        incomeExpenseComparison,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = parseDate(startDate as string);
      }
      if (endDate) {
        where.date.lte = parseDate(endDate as string);
      }
    }

    const [
      totalTransactions,
      incomeCount,
      expenseCount,
      categoryStats,
      recentTransactions,
    ] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({
        where: { ...where, type: TransactionType.INCOME },
      }),
      prisma.transaction.count({
        where: { ...where, type: TransactionType.EXPENSE },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where,
        _sum: {
          amount: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 5,
      }),
      prisma.transaction.findMany({
        where,
        take: 5,
        orderBy: {
          date: 'desc',
        },
        include: {
          category: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      }),
    ]);

    // Get category names for stats
    const categoryIds = categoryStats.map((stat) => stat.categoryId);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
    const topCategories = categoryStats.map((stat) => ({
      categoryId: stat.categoryId,
      categoryName: categoryMap.get(stat.categoryId)?.name || 'Unknown',
      categoryColor: categoryMap.get(stat.categoryId)?.color || null,
      totalAmount: stat._sum.amount || 0,
      count: stat._count,
    }));

    res.json({
      success: true,
      data: {
        totalTransactions,
        incomeCount,
        expenseCount,
        topCategories,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};
