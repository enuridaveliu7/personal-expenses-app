import { Response, NextFunction } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';
import { TransactionType } from '../types';

const parseDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;
  return new Date(date);
};

const buildWhereClause = (req: AuthRequest) => {
  const {
    type,
    categoryId,
    title,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  } = req.query;

  const where: any = {
    userId: req.user!.id,
  };

  if (type && (type === TransactionType.INCOME || type === TransactionType.EXPENSE)) {
    where.type = type;
  }

  if (categoryId) {
    where.categoryId = categoryId;
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

  return where;
};

export const exportCSV = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where = buildWhereClause(req);

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // CSV header
    const headers = ['Date', 'Type', 'Category', 'Title', 'Amount', 'Description'];
    const csvRows = [headers.join(',')];

    // CSV rows
    transactions.forEach((transaction) => {
      const row = [
        transaction.date.toISOString().split('T')[0],
        transaction.type,
        transaction.category.name,
        `"${transaction.title.replace(/"/g, '""')}"`,
        transaction.amount.toString(),
        transaction.description ? `"${transaction.description.replace(/"/g, '""')}"` : '',
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const exportTXT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where = buildWhereClause(req);

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const lines: string[] = [];
    lines.push('TRANSACTIONS EXPORT');
    lines.push('='.repeat(50));
    lines.push('');

    transactions.forEach((transaction, index) => {
      lines.push(`Transaction ${index + 1}:`);
      lines.push(`  Date: ${transaction.date.toISOString().split('T')[0]}`);
      lines.push(`  Type: ${transaction.type}`);
      lines.push(`  Category: ${transaction.category.name}`);
      lines.push(`  Title: ${transaction.title}`);
      lines.push(`  Amount: ${transaction.amount}`);
      if (transaction.description) {
        lines.push(`  Description: ${transaction.description}`);
      }
      lines.push('');
    });

    lines.push(`Total Transactions: ${transactions.length}`);
    const txtContent = lines.join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.txt');
    res.send(txtContent);
  } catch (error) {
    next(error);
  }
};
