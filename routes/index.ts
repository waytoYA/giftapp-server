import express from 'express'
import authMiddleWare from '../middlewares/authMiddleware';
import userRouter from './userRouter';
import giftRouter from './giftRouter';
import leaderboardRouter from './leaderboardRouter';

const router = express.Router();

router.use('/user', authMiddleWare, userRouter)
router.use('/gift', authMiddleWare, giftRouter)
router.use('/leaderboard', authMiddleWare, leaderboardRouter)

export default router