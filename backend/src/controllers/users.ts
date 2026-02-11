import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);

    // Check if email is being updated and if it's already taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingUser && existingUser.id !== req.user!.id) {
        const error: AppError = new Error('Email already in use');
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
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

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
