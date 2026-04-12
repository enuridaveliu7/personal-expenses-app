import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createUser, findUserByEmail, comparePassword, generateToken } from '../services/auth';
import { Role } from '../types';
import { AppError } from '../middleware/errorHandler';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await findUserByEmail(validatedData.email);
    if (existingUser) {
      const error: AppError = new Error('User already exists');
      error.statusCode = 400;
      throw error;
    }

    const user = await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      Role.USER
    );

    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
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

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      const error: AppError = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      const error: AppError = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
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
