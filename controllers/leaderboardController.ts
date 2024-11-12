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

class LeaderboardContoller {

    async get (req: any, res: any, next: any) {
        try {

            const user = req.user
            const { name } = req.query

            const users = await User.find(name ? { name: new RegExp(`^${name}`) } : {}).lean()
            const gifts = await Delivery
                .find({})
                .populate('to')
                .lean()

            const result = []
            for (let user of users) {
                const amount = gifts.reduce((acc: number, gift: any) => {
                    return gift.to._id.toString() == user._id.toString() ? acc + 1 : acc
                }, 0)
                result.push({
                    ...user,
                    amount: amount
                })
            }

            result.sort((a, b) => b.amount - a.amount)

            return res.json({
                data: result,
                me: user._id
            })
        } catch (error) {
            return next(apiError(500, 'error'))
        }
    }

    async getProfile (req: any, res: any, next: any) {
        try {

            const { id } = req.params

            const user = await User.findOne({_id: id}).lean()

            if (!user) return next(apiError(404, 'user_not_found'))

            const deliveries = await Delivery
                .find({to: user._id})
                .populate('gift from')
                .lean()

            if (!deliveries) return res.json([])

            const gifts = deliveries.map(i => { return {...i.gift, from: i.from}})
            
            const { place } = await Account.leaderboardPlace(user._id.toString())

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
    
}

export default new LeaderboardContoller();