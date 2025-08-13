import express from 'express';
import { SocialService } from '../services/socialService';

const router = express.Router();

// Get user's social profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await SocialService.getUserSocialProfile(userId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Failed to get social profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available groups
router.get('/groups/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category } = req.query;
    const groups = await SocialService.getAvailableGroups(userId, category as string);
    
    res.json({
      success: true,
      data: groups
    });
  } catch (error: any) {
    console.error('Failed to get groups:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Join a group
router.post('/groups/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const result = await SocialService.joinGroup(userId, groupId);
    
    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error: any) {
    console.error('Failed to join group:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get group details
router.get('/groups/details/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await SocialService.getGroupDetails(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }
    
    res.json({
      success: true,
      data: group
    });
  } catch (error: any) {
    console.error('Failed to get group details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get leaderboards
router.get('/leaderboards', async (req, res) => {
  try {
    const { type } = req.query;
    const leaderboards = await SocialService.getLeaderboards(type as string);
    
    res.json({
      success: true,
      data: leaderboards
    });
  } catch (error: any) {
    console.error('Failed to get leaderboards:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get community posts
router.get('/posts', async (req, res) => {
  try {
    const { type, groupId, authorId, tags, limit } = req.query;
    const filters = {
      type: type as string,
      groupId: groupId as string,
      authorId: authorId as string,
      tags: tags ? (tags as string).split(',') : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };
    
    const posts = await SocialService.getCommunityPosts(filters);
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error: any) {
    console.error('Failed to get community posts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new post
router.post('/posts', async (req, res) => {
  try {
    const { userId, content, type, tags, groupId, attachments } = req.body;
    
    if (!userId || !content || !type) {
      return res.status(400).json({
        success: false,
        error: 'User ID, content, and type are required'
      });
    }
    
    const post = await SocialService.createPost(userId, {
      content,
      type,
      tags: tags || [],
      groupId,
      attachments
    });
    
    res.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    console.error('Failed to create post:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Like a post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, reactionType = 'like' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const success = await SocialService.likePost(userId, postId, reactionType);
    
    res.json({
      success,
      message: success ? 'Post liked successfully' : 'Failed to like post'
    });
  } catch (error: any) {
    console.error('Failed to like post:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add comment to post
router.post('/posts/:postId/comment', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        error: 'User ID and content are required'
      });
    }
    
    const success = await SocialService.addComment(userId, postId, content);
    
    res.json({
      success,
      message: success ? 'Comment added successfully' : 'Failed to add comment'
    });
  } catch (error: any) {
    console.error('Failed to add comment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get social analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await SocialService.getSocialAnalytics(userId);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Failed to get social analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create demo social profile and data
router.post('/demo/create', async (req, res) => {
  try {
    const userId = 'demo_user_123';
    const demoData = await SocialService.createDemoSocialProfile(userId);
    
    res.json({
      success: true,
      data: demoData,
      message: 'Demo social profile created successfully'
    });
  } catch (error: any) {
    console.error('Failed to create demo social profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simulate social activities
router.post('/demo/activity', async (req, res) => {
  try {
    const { activityType = 'create_milestone_post', userId = 'demo_user_123' } = req.body;
    
    const result = await SocialService.simulateSocialActivity(userId, activityType);
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error: any) {
    console.error('Failed to simulate social activity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;