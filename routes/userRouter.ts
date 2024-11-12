import express from 'express'
import userContoller from '../controllers/userContoller';

const userRouter = express.Router();

userRouter.get('/me', userContoller.me)
userRouter.get('/gifts', userContoller.gifts)
// userRouter.get('/history', userContoller.history)
userRouter.post('/receiveGift', userContoller.receiveGift)

export default userRouter