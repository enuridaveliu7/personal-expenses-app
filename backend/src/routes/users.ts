import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getCurrentUser, updateUser, getAllUsers } from '../controllers/users';
import { Role } from '../types';

const router = Router();

// Get current user profile
router.get('/me', authenticate, getCurrentUser);

// Update current user profile
router.put('/me', authenticate, updateUser);

// Admin only: Get all users
router.get('/', authenticate, authorize(Role.ADMIN), getAllUsers);

export default router;
