import { Router } from 'express';
import { DebtHandler } from '../handlers/debtHandler';

const router = Router();
const debtHandler = new DebtHandler();

// Debt analysis routes
router.post('/analyze', (req, res) => debtHandler.analyzeDebts(req, res));
router.post('/projection', (req, res) => debtHandler.calculatePayoffProjection(req, res));

export default router;