import { Request, Response } from 'express';
import { AutomationService } from '../services/automationService';

export class AutomationHandler {

  /**
   * Set up automation for a user
   */
  async setupAutomation(req: Request, res: Response): Promise<Response | void> {
    try {
      const { userId, settings } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: userId'
        });
      }

      const automationConfig = await AutomationService.setupAutomation(userId, settings || {});

      res.json({
        success: true,
        data: automationConfig,
        message: 'Automation setup completed successfully'
      });

    } catch (error: any) {
      console.error('Error setting up automation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to setup automation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Generate payment plan for user
   */
  async generatePaymentPlan(req: Request, res: Response): Promise<Response | void> {
    try {
      const { userId, debts, availableAmount, strategy = 'avalanche' } = req.body;

      if (!userId || !debts || !availableAmount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, debts, availableAmount'
        });
      }

      const plan = await AutomationService.generatePaymentPlan(userId, debts, availableAmount, strategy);

      res.json({
        success: true,
        data: plan
      });

    } catch (error: any) {
      console.error('Error generating payment plan:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate payment plan',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Schedule payments based on plan
   */
  async schedulePayments(req: Request, res: Response): Promise<Response | void> {
    try {
      const { userId, plan } = req.body;

      if (!userId || !plan) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, plan'
        });
      }

      const scheduledPayments = await AutomationService.schedulePayments(userId, plan);

      res.json({
        success: true,
        data: {
          payments: scheduledPayments,
          message: `Successfully scheduled ${scheduledPayments.length} payments`
        }
      });

    } catch (error: any) {
      console.error('Error scheduling payments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to schedule payments',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Execute a specific payment
   */
  async executePayment(req: Request, res: Response): Promise<Response | void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          error: 'Missing payment ID'
        });
      }

      const result = await AutomationService.executePayment(paymentId);

      if (result.success) {
        res.json({
          success: true,
          data: {
            payment: result.payment,
            rewardResult: result.rewardResult,
            message: 'Payment executed successfully'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          data: result.payment
        });
      }

    } catch (error: any) {
      console.error('Error executing payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute payment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get automation status for user
   */
  async getAutomationStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing user ID'
        });
      }

      const status = await AutomationService.getAutomationStatus(userId);

      res.json({
        success: true,
        data: status
      });

    } catch (error: any) {
      console.error('Error getting automation status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get automation status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Analyze cash flow for user
   */
  async analyzeCashFlow(req: Request, res: Response): Promise<Response | void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing user ID'
        });
      }

      const analysis = await AutomationService.analyzeCashFlow(userId);

      res.json({
        success: true,
        data: analysis
      });

    } catch (error: any) {
      console.error('Error analyzing cash flow:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze cash flow',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Demo: Create complete automation setup with sample data
   */
  async createDemoAutomation(req: Request, res: Response) {
    try {
      const userId = 'demo_user_123';
      
      // Sample debts for demo
      const sampleDebts = [
        {
          id: 'debt_1',
          userId: userId,
          name: 'Credit Card 1',
          balance: 5000,
          interestRate: 0.18,
          minimumPayment: 150,
          automationEnabled: true,
          paymentHistory: [],
          psychologyProfile: {
            spendingTriggers: ['stress'],
            motivationType: 'milestone' as const,
            riskTolerance: 'moderate' as const,
            preferredRewardType: 'cash' as const
          },
          rewardPoints: 0,
          milestones: [],
          socialSharing: {
            enabled: false,
            shareProgress: false,
            shareMilestones: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'debt_2',
          userId: userId,
          name: 'Credit Card 2',
          balance: 3200,
          interestRate: 0.22,
          minimumPayment: 96,
          automationEnabled: true,
          paymentHistory: [],
          psychologyProfile: {
            spendingTriggers: ['stress'],
            motivationType: 'milestone' as const,
            riskTolerance: 'moderate' as const,
            preferredRewardType: 'cash' as const
          },
          rewardPoints: 0,
          milestones: [],
          socialSharing: {
            enabled: false,
            shareProgress: false,
            shareMilestones: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Setup automation
      const automationConfig = await AutomationService.setupAutomation(userId, {
        automationLevel: 'semi-auto',
        maxMonthlyPayment: 1500,
        paymentStrategy: 'avalanche'
      });

      // Generate payment plan
      const paymentPlan = await AutomationService.generatePaymentPlan(
        userId,
        sampleDebts,
        1500,
        'avalanche'
      );

      // Schedule payments
      const scheduledPayments = await AutomationService.schedulePayments(userId, paymentPlan);

      // Get status
      const status = await AutomationService.getAutomationStatus(userId);

      res.json({
        success: true,
        data: {
          automationConfig,
          paymentPlan,
          scheduledPayments,
          status
        },
        message: 'Demo automation created successfully'
      });

    } catch (error: any) {
      console.error('Error creating demo automation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create demo automation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Simulate payment execution for testing
   */
  async simulateExecution(req: Request, res: Response): Promise<Response | void> {
    try {
      const { userId = 'demo_user_123' } = req.body;

      // Get current automation status
      const status = await AutomationService.getAutomationStatus(userId);
      
      if (status.upcomingPayments.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No upcoming payments to execute. Create demo automation first.'
        });
      }

      // Execute the first upcoming payment
      const paymentToExecute = status.upcomingPayments[0];
      const result = await AutomationService.executePayment(paymentToExecute.id);

      // Get updated status
      const updatedStatus = await AutomationService.getAutomationStatus(userId);

      res.json({
        success: true,
        data: {
          executionResult: result,
          updatedStatus
        },
        message: result.success ? 'Payment executed successfully' : 'Payment execution failed'
      });

    } catch (error: any) {
      console.error('Error simulating payment execution:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to simulate payment execution',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}