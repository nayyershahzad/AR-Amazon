import express from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is authenticated
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/login?error=oauth_failed',
    session: false 
  }),
  async (req, res) => {
    try {
      const user = req.user as any;
      console.log('OAuth callback - User:', user);
      
      if (!user) {
        console.error('No user found in OAuth callback');
        return res.redirect('http://localhost:3000/login?error=no_user');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      console.log('Generated token for user:', user.email);

      // Redirect to frontend with token
      const frontendURL = process.env.CORS_ORIGIN || 'http://localhost:3000';
      const redirectURL = `${frontendURL}/auth/callback?token=${token}`;
      console.log('Redirecting to:', redirectURL);
      
      res.redirect(redirectURL);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

// Get current user profile
router.get('/me', authenticateToken, (req: any, res) => {
  const { id, email, name, picture, verified, monthlyIncome, monthlyExpenses } = req.user;
  res.json({
    id,
    email,
    name,
    picture,
    verified,
    monthlyIncome,
    monthlyExpenses
  });
});

// Update user profile
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const { monthlyIncome, monthlyExpenses } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        monthlyIncome: monthlyIncome || req.user.monthlyIncome,
        monthlyExpenses: monthlyExpenses || req.user.monthlyExpenses
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        picture: updatedUser.picture,
        monthlyIncome: updatedUser.monthlyIncome,
        monthlyExpenses: updatedUser.monthlyExpenses
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // For JWT, logout is handled on frontend by removing token
  res.json({ message: 'Logged out successfully' });
});

export default router;