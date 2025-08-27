import { PrismaClient } from '@prisma/client';
import type { Server as SocketIOServer } from 'socket.io';

const prisma = new PrismaClient();

interface DebtData {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  originalBalance?: number;
}

interface ProjectionResult {
  paymentSchedule: any[];
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalPaid: number;
  strategy: 'avalanche' | 'snowball';
  lastUpdated: Date;
}

export class ProjectionService {
  /**
   * Recalculate 6-month payment breakdown based on current debt balances
   */
  static async recalculateProjections(userId: string): Promise<ProjectionResult> {
    console.log(`🧮 Recalculating projections for user: ${userId}`);

    try {
      // Get current user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          debts: {
            select: {
              id: true,
              name: true,
              balance: true,
              originalBalance: true,
              interestRate: true,
              minimumPayment: true
            }
          }
        }
      });

      if (!user || user.debts.length === 0) {
        throw new Error('User or debts not found');
      }

      // Get user's available monthly amount for debt payments
      const availableAmount = user.monthlyIncome - user.monthlyExpenses;
      const strategy = user.selectedStrategy as 'avalanche' | 'snowball' || 'avalanche';

      console.log(`💰 Available monthly amount: $${availableAmount}, Strategy: ${strategy}`);
      console.log(`📊 Current debts:`, user.debts.map(d => ({ name: d.name, balance: d.balance })));

      // Calculate new payment schedule based on current strategy
      const mappedDebts = user.debts.map(debt => ({
        id: debt.id,
        name: debt.name,
        originalBalance: debt.originalBalance || debt.balance,
        balance: debt.balance,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment
      }));
      
      const paymentSchedule = this.calculatePaymentSchedule(
        mappedDebts,
        availableAmount,
        strategy
      );

      // Calculate totals
      let totalInterestPaid = 0;
      let totalPaid = 0;
      let monthsToPayoff = 0;

      paymentSchedule.forEach(month => {
        monthsToPayoff = Math.max(monthsToPayoff, month.month);
        month.debts.forEach((debt: any) => {
          totalInterestPaid += debt.interestPayment || 0;
          totalPaid += debt.payment || 0;
        });
      });

      const result: ProjectionResult = {
        paymentSchedule: paymentSchedule.slice(0, 6), // First 6 months
        monthsToPayoff,
        totalInterestPaid,
        totalPaid,
        strategy,
        lastUpdated: new Date()
      };

      console.log(`✅ Projections calculated - ${monthsToPayoff} months to payoff, $${totalInterestPaid.toFixed(2)} total interest`);

      return result;

    } catch (error) {
      console.error('Error recalculating projections:', error);
      throw error;
    }
  }

  /**
   * Trigger real-time projection update after payment events
   */
  static async triggerProjectionUpdate(userId: string, eventType: 'payment' | 'skip', eventData: any, io?: SocketIOServer): Promise<ProjectionResult> {
    console.log(`🔄 Triggering projection update for user ${userId} after ${eventType} event`);

    try {
      // Recalculate projections
      const newProjections = await this.recalculateProjections(userId);

      // Emit real-time update to user's room if io is provided
      if (io) {
        io.to(userId).emit('projection_update', {
          type: 'projection_recalculated',
          eventType,
          eventData,
          projections: newProjections,
          timestamp: new Date()
        });

        console.log(`📡 Real-time projection update sent to user ${userId}`);
      }

      return newProjections;

    } catch (error) {
      console.error('Error triggering projection update:', error);
      
      // Send error event to user if io is provided
      if (io) {
        io.to(userId).emit('projection_error', {
          type: 'projection_calculation_error',
          error: 'Failed to update payment projections',
          timestamp: new Date()
        });
      }
      
      throw error;
    }
  }

  /**
   * Calculate payment schedule based on current debt balances and strategy
   */
  private static calculatePaymentSchedule(debts: DebtData[], totalPayment: number, strategy: 'avalanche' | 'snowball') {
    // Create working copies of debts
    let workingDebts = debts.map(debt => ({
      ...debt,
      remainingBalance: debt.balance
    }));
    
    const schedule = [];
    const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraPayment = Math.max(0, totalPayment - totalMinPayments);
    
    for (let month = 1; month <= 6; month++) {
      const monthData = {
        month,
        debts: [] as any[],
        totalPayment: 0,
        date: new Date(Date.now() + (month - 1) * 30 * 24 * 60 * 60 * 1000) // Approximate monthly dates
      };
      
      // Sort debts according to strategy
      if (strategy === 'avalanche') {
        workingDebts.sort((a, b) => b.interestRate - a.interestRate);
      } else if (strategy === 'snowball') {
        workingDebts.sort((a, b) => a.remainingBalance - b.remainingBalance);
      }
      
      let remainingExtra = extraPayment;
      
      workingDebts.forEach(debt => {
        if (debt.remainingBalance > 0) {
          // Calculate interest for this month
          const monthlyInterest = (debt.remainingBalance * debt.interestRate) / 12;
          
          // Start with minimum payment
          let payment = Math.min(debt.minimumPayment, debt.remainingBalance + monthlyInterest);
          
          // Add extra payment to priority debt (first in sorted list)
          if (remainingExtra > 0 && workingDebts[0].id === debt.id) {
            const extraForThisDebt = Math.min(remainingExtra, debt.remainingBalance + monthlyInterest - payment);
            payment += extraForThisDebt;
            remainingExtra -= extraForThisDebt;
          }
          
          // Calculate principal payment (payment minus interest)
          const principalPayment = Math.max(0, payment - monthlyInterest);
          const newBalance = Math.max(0, debt.remainingBalance - principalPayment);
          
          monthData.debts.push({
            id: debt.id,
            name: debt.name,
            currentBalance: debt.remainingBalance,
            payment: payment,
            principalPayment: principalPayment,
            interestPayment: monthlyInterest,
            newBalance: newBalance,
            isPriority: workingDebts[0].id === debt.id,
            interestRate: debt.interestRate
          });
          
          monthData.totalPayment += payment;
          debt.remainingBalance = newBalance;
        }
      });
      
      // Only add month if there are active debts
      if (monthData.debts.length > 0) {
        schedule.push(monthData);
      }
      
      // Break if all debts are paid off
      const hasRemainingDebt = workingDebts.some(debt => debt.remainingBalance > 0);
      if (!hasRemainingDebt) {
        break;
      }
    }
    
    return schedule;
  }

  /**
   * Get latest projections for user (cached or calculated)
   */
  static async getProjections(userId: string): Promise<ProjectionResult> {
    console.log(`📖 Getting projections for user: ${userId}`);
    
    // For now, always recalculate to ensure accuracy
    // In future, we could implement caching with TTL
    return await this.recalculateProjections(userId);
  }

  /**
   * Trigger projection recalculation without updating debt balances
   * (Keeping debt balances as originally entered by user)
   */
  static async updateDebtBalanceAndRecalculate(
    userId: string, 
    debtId: string, 
    paymentAmount: number, 
    paymentType: 'payment' | 'skip',
    io?: SocketIOServer
  ): Promise<void> {
    console.log(`📊 Triggering projection recalculation for user ${userId} (keeping original debt balances)`);

    try {
      // Note: We no longer update debt balances in database
      // AI will use original user-entered data only
      
      // Trigger projection recalculation with original data
      await this.triggerProjectionUpdate(userId, paymentType, {
        debtId,
        amount: paymentAmount,
        type: paymentType
      }, io);

    } catch (error) {
      console.error('Error triggering projection recalculation:', error);
      throw error;
    }
  }
}

export default ProjectionService;