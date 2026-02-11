import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
