import axios from 'axios'
import { Request, Response, NextFunction } from 'express';
import Account from '../apps/Account';
import apiError from 'http-errors'
import User from '../models/User';
import { validate, parse } from '@telegram-apps/init-data-node';
import { InitData } from '@telegram-apps/types';
import Purchases from '../models/Purchases';
import Gift from '../models/Gift';
import Delivery from '../models/Delivery';
import Botlife from '../apps/Botlife';

class UserContoller {

    async me (req: any, res: any, next: any) {
        try {

            const user = req.user

            const deliveries = await Delivery
                .find({to: user._id})
                .populate('gift from')
                .lean()

            if (!deliveries) return res.json([])

            const gifts = deliveries.map(i => { return {...i.gift, from: i.from}})
            
            const { place } = await Account.leaderboardPlace(user._id)

            return res.json({
                user: {
                    ...user,
                    leaderboardPlace: place || 0 + 1,
                    giftsReceived: gifts.length
                },
                gifts: gifts
            })
        } catch (error) {
            return next(apiError(500, 'error'))
        }
    }

    async gifts (req: any, res: any, next: any) {
        try {

            const user = req.user

            const purchases = await Purchases
                .find(
                    {user: user._id, owner: true},
                    {'createdAt': 1},
                )
                .populate(
                    'gift',
                    {'createdAt': 0, 'updatedAt': 0, '__v': 0, '_id': 0}
                )
                .lean()

            const items = purchases.map(i => { return {...i.gift, id: i._id, date: i.createdAt} })

            if (!items) return res.json([])

            return res.json(items)
        } catch (error) {
            return next(apiError(500, 'error'))
        }
    }

    async receiveGift (req: any, res: any, next: any) {
        try {

            const user = req.user
            const { receiveData } = req.body

            const [giftId, userId] = receiveData.split('_')

            const sender = await User.findOne({_id: userId}).lean()

            if (!sender) return next(apiError(404, 'user_not_found'))
            if (user._id == sender._id) return next(apiError(404, 'it_is_you'))

            const gift = await Purchases
                .findOne({_id: giftId, user: userId, owner: true})
                .populate('gift', {id: 1, name: 1})
                .lean() as any

            if (!gift) return next(apiError(404, 'gift_not_found'))
            
            const alreadyDelivery = await Delivery.findOne({gift: gift.gift._id})

            if (alreadyDelivery) return next(apiError(404, 'already_delivery'))

            await Delivery.create({
                gift: gift.gift._id,
                from: sender._id,
                to: user._id
            })
            .then(async () => {

                await Purchases.updateOne({_id: gift._id}, {owner: false})
                .then(() => {

                    Botlife.sendMessage(
                        String(sender.tgId),
                        `👌 <b>${user.name}</b> received your gift of <b>${gift.gift.name}</b>.`,
                        'Open App',
                        process.env.CLIENT_URL + '/'
                    )

                    Botlife.sendMessage(
                        String(user.tgId),
                        `⚡ <b>${sender.name}</b> has given you the gift of <b>${gift.gift.name}</b>.`,
                        'View Gift',
                        process.env.CLIENT_URL + '/profile'
                    )
                    
                })

                return res.json({ok: true, item: {
                    name: gift.gift.name,
                    from: sender.name,
                }})
            })
            .catch(() => {
                return next(apiError(500, 'received_not_complete'))
            })

        } catch (error) {
            return next(apiError(500, 'error'))
        }
    }

}

export default new UserContoller();