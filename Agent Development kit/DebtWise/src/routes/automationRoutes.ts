import { Router } from 'express';
import { AutomationHandler } from '../handlers/automationHandler';

const router = Router();
const automationHandler = new AutomationHandler();

// Automation setup and management
router.post('/setup', (req, res) => automationHandler.setupAutomation(req, res));
router.post('/plan', (req, res) => automationHandler.generatePaymentPlan(req, res));
router.post('/schedule', (req, res) => automationHandler.schedulePayments(req, res));

// Payment execution
router.post('/execute/:paymentId', (req, res) => automationHandler.executePayment(req, res));

// Status and analysis
router.get('/status/:userId', (req, res) => automationHandler.getAutomationStatus(req, res));
router.get('/cashflow/:userId', (req, res) => automationHandler.analyzeCashFlow(req, res));

// Demo and testing endpoints
router.post('/demo/create', (req, res) => automationHandler.createDemoAutomation(req, res));
router.post('/demo/execute', (req, res) => automationHandler.simulateExecution(req, res));

export default router;