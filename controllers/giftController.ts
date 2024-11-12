import axios from 'axios'
import { Request, Response, NextFunction } from 'express';
import Account from '../apps/Account';
import apiError from 'http-errors'
import User from '../models/User';
import { validate, parse } from '@telegram-apps/init-data-node';
import { InitData } from '@telegram-apps/types';
import Gift from '../models/Gift';
import Purchases from '../models/Purchases';
import Transaction from '../models/Transaction';
import Payment from '../apps/Payment';
import Delivery from '../models/Delivery';

class GiftContoller {
  
    async getAll (req: any, res: any, next: any) {
        try {

            const items = await Gift.find({}, {'__v': 0})

            return res.json(items)
        } catch (error) {
            return next(apiError(500, 'error'))
        }
    }

    async getOne (req: any, res: any, next: any) {
        try {

            const { name } = req.params

            const item = await Gift.findOne({ name })

            if (!item) return next(apiError(404, 'not_found'))

                const purchases = await Purchases
                .find({gift: item.id})
                .sort({createdAt: -1})
                .populate('user')
                .lean()
            
            const deliveries = await Delivery
                .find({gift: item.id})
                .sort({createdAt: -1})
                .populate('from to')
                .lean()

            return res.json({
                item: item,
                actions: [
                    ...purchases.map(i => { return {...i, action: 'Buy'}}),
                    ...deliveries.map(i => { return {...i, action: 'Send'}})
                ]
            })
        } catch (error) {
            return next(apiError(500, 'error'))
        }
    }

    async invoiceCreate (req: any, res: any, next: any) {
        try {
            const user = req.user
            const { name } = req.params

            const item = await Gift.findOne({ name })

            if (!item) return next(apiError(404, 'not_found'))
            if (item.purchased == item.quantity) return next(apiError(404, 'limit'))
            
           const invoiceUrl = await Payment.createInvoice(item, user)

            if (!invoiceUrl) return next(apiError(500, 'invoice_not_create'))

            return res.json({url: invoiceUrl})
        } catch (error) {
            return next(apiError(500, 'error'))
        }
    }
    
    async check (req: any, res: any, next: any) {
        try {
            const user = req.user

            const completePayment = await Payment.check(user._id)

            return res.json({ok: Boolean(completePayment), item: completePayment})
        } catch (error) {
            return next(apiError(500, 'error'))
        }
    }

}

export default new GiftContoller();