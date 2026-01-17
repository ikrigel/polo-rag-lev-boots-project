import { Router } from 'express';
import {
  receiveFrontendLog,
  getFrontendLogs,
  clearFrontendLogs,
} from '../controllers/logsController.ts';

const router = Router();

// POST - Receive frontend logs
router.post('/logs', receiveFrontendLog);

// GET - Retrieve frontend logs
router.get('/logs', getFrontendLogs);

// DELETE - Clear frontend logs
router.delete('/logs', clearFrontendLogs);

export default router;
