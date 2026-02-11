import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getBalanceSummary, getChartData, getStatistics } from '../controllers/dashboard';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/balance', getBalanceSummary);
router.get('/charts', getChartData);
router.get('/statistics', getStatistics);

export default router;
