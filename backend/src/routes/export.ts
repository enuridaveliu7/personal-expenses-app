import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { exportCSV, exportTXT } from '../controllers/export';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/csv', exportCSV);
router.get('/txt', exportTXT);

export default router;
