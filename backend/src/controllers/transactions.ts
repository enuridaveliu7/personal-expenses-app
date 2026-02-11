import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';
import { TransactionType } from '../types';
import { AppError } from '../middleware/errorHandler';

const createTransactionSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Amount must be positive'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().or(z.date()),
});

const updateTransactionSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  type: z.nativeEnum(TransactionType).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  date: z.string().or(z.date()).optional(),
});

const parseDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;
  return new Date(date);
};

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      type,
      categoryId,
      title,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      userId: req.user!.id,
    };

    if (type && (type === TransactionType.INCOME || type === TransactionType.EXPENSE)) {
      where.type = type;
    }

    if (categoryId) {
      // Verify category belongs to user
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId as string,
          userId: req.user!.id,
        },
      });
      if (category) {
        where.categoryId = categoryId;
      }
    }

    if (title) {
      where.title = {
        contains: title as string,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = parseDate(startDate as string);
      }
      if (endDate) {
        where.date.lte = parseDate(endDate as string);
      }
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount.gte = parseFloat(minAmount as string);
      }
      if (maxAmount) {
        where.amount.lte = parseFloat(maxAmount as string);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true,
              color: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    });

    if (!transaction) {
      const error: AppError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createTransactionSchema.parse(req.body);

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: req.user!.id,
      },
    });

    if (!category) {
      const error: AppError = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify category type matches transaction type
    if (category.type !== validatedData.type) {
      const error: AppError = new Error('Category type does not match transaction type');
      error.statusCode = 400;
      throw error;
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: parseDate(validatedData.date),
        userId: req.user!.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg: AppError = new Error(error.errors[0].message);
      errorMsg.statusCode = 400;
      return next(errorMsg);
    }
    next(error);
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateTransactionSchema.parse(req.body);

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTransaction) {
      const error: AppError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    // If category is being updated, verify it belongs to user
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: req.user!.id,
        },
      });

      if (!category) {
        const error: AppError = new Error('Category not found');
        error.statusCode = 404;
        throw error;
      }

      // Verify category type matches transaction type
      const transactionType = validatedData.type || existingTransaction.type;
      if (category.type !== transactionType) {
        const error: AppError = new Error('Category type does not match transaction type');
        error.statusCode = 400;
        throw error;
      }
    }

    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = parseDate(validatedData.date);
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg: AppError = new Error(error.errors[0].message);
      errorMsg.statusCode = 400;
      return next(errorMsg);
    }
    next(error);
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!transaction) {
      const error: AppError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
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

    const [incomeTransactions, expenseTransactions, totalTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: TransactionType.INCOME,
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: TransactionType.EXPENSE,
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalIncome = incomeTransactions._sum.amount || 0;
    const totalExpenses = expenseTransactions._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
        incomeCount: incomeTransactions._count,
        expenseCount: expenseTransactions._count,
        totalCount: totalTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};
