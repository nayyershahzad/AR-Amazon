import { Router } from 'express';
import { RewardHandler } from '../handlers/rewardHandler';

const router = Router();
const rewardHandler = new RewardHandler();

// Reward system routes
router.post('/award', (req, res) => rewardHandler.awardPoints(req, res));
router.get('/summary/:userId', (req, res) => rewardHandler.getRewardSummary(req, res));
router.get('/leaderboard', (req, res) => rewardHandler.getLeaderboard(req, res));
router.get('/challenges/:userId', (req, res) => rewardHandler.getChallenges(req, res));

// Testing/simulation routes
router.post('/simulate', (req, res) => rewardHandler.simulateRewardAction(req, res));

export default router;