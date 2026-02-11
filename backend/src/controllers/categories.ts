import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';
import { TransactionType } from '../types';
import { AppError } from '../middleware/errorHandler';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(TransactionType),
  color: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.nativeEnum(TransactionType).optional(),
  color: z.string().optional(),
});

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (type && (type === TransactionType.INCOME || type === TransactionType.EXPENSE)) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!category) {
      const error: AppError = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    // Check if category with same name and type already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: req.user!.id,
        name: validatedData.name,
        type: validatedData.type,
      },
    });

    if (existingCategory) {
      const error: AppError = new Error('Category with this name and type already exists');
      error.statusCode = 400;
      throw error;
    }

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: category,
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

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingCategory) {
      const error: AppError = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if updated name and type combination already exists
    if (validatedData.name || validatedData.type) {
      const name = validatedData.name || existingCategory.name;
      const type = validatedData.type || existingCategory.type;

      const duplicateCategory = await prisma.category.findFirst({
        where: {
          userId: req.user!.id,
          name,
          type,
          NOT: { id },
        },
      });

      if (duplicateCategory) {
        const error: AppError = new Error('Category with this name and type already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: updatedCategory,
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

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        transactions: true,
      },
    });

    if (!category) {
      const error: AppError = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if category has transactions
    if (category.transactions.length > 0) {
      const error: AppError = new Error('Cannot delete category with existing transactions');
      error.statusCode = 400;
      throw error;
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
