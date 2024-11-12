import express from 'express'
import giftController from '../controllers/giftController';

const giftRouter = express.Router();

giftRouter.get('/getAll', giftController.getAll)
giftRouter.get('/getOne/:name', giftController.getOne)
giftRouter.get('/invoiceCreate/:name', giftController.invoiceCreate)
giftRouter.get('/check', giftController.check)

export default giftRouter