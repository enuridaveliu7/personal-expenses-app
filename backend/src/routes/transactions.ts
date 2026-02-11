import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStatistics,
} from '../controllers/transactions';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/statistics', getStatistics);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
