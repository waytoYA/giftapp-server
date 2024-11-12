import express from 'express'
import leaderboardController from '../controllers/leaderboardController';

const leaderboardRouter = express.Router();

leaderboardRouter.get('/', leaderboardController.get)
leaderboardRouter.get('/profile/:id', leaderboardController.getProfile)

export default leaderboardRouter