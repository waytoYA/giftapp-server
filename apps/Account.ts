import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import Purchases from '../models/Purchases';
import Delivery from '../models/Delivery';
import axios from 'axios';
import { bot } from '../bot';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface IUser {
    tgId: string;
    userName: string;
}

class Account {

    async createUser ({
        tgId,
        userName,
    }: IUser) {
        try {
            if (!tgId) return null

            const userAvatar = await this.getImageUserUrl(tgId)
            const user = await User.create({
                tgId: tgId,
                name: userName,
                image: userAvatar
            })
            return user
        } catch (e) { 
            return
         }
    }

    private async getImageUserUrl (tgId: string) {
        try {
            const profilePhotos = await bot.api.getUserProfilePhotos(Number(tgId))

            let photoUrl;
            if (profilePhotos.total_count > 0) {
                const fileId = profilePhotos.photos[0][0].file_id
    
                const filePath = await bot.api.getFile(fileId)
                photoUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath.file_path}`
            } else {
                photoUrl = ''
            }
    
            const stockImage = 'https://i.pinimg.com/736x/43/3d/02/433d02205c7be7654c98f5d7cef8b04f.jpg'
            if (!photoUrl) return stockImage
    
            const response = await axios({
                url: photoUrl,
                method: "GET",
                responseType: "stream",
            });
            if (response.status != 200) return stockImage
    
            const fileName = uuidv4() + ".jpg"
            const filePath = path.resolve(__dirname, '..', 'static', fileName)
    
            const fileStream = fs.createWriteStream(
                filePath
            );
            response.data.pipe(fileStream);
    
            let url = stockImage
            await new Promise((res, rej) => {
                fileStream.on("finish", () => {
                    res(filePath);
                });
                fileStream.on("error", rej);
            })
            .then(() => {
                url = process.env.SERVER_URL + '/' + fileName
            })
            return url
        } catch (e) { 
            return {}
        }
    }

    async leaderboardPlace (userId: string) {
        try {

            const user = await User.findOne({ id: userId })
            
            if (!user) return {}

            const users = await User.find({}).lean()

            const gifts = await Delivery
                .find({})
                // .populate('to')
                .lean()

            let result = []
            for (let user of users) {
                const amount = gifts.reduce((acc: number, gift: any) => {
                    return gift.to._id.toString() == user._id.toString() ? acc + 1 : acc
                }, 0)
                result.push({
                    ...user,
                    amount: amount
                })
            }

            result = result
                .sort((a, b) => b.amount - a.amount)
                .map((i, index) => { return {...i, place: index}})

            return {
                users: result,
                place: result.find(i => i._id.toString() == user._id.toString())?.place
            }
        } catch (e) { 
                return {}
            }
        }

    async getGifts (tgId: number, giftId: string) {
        try {
            const user = await User.findOne({ tgId: String(tgId) }).lean()

            if (!user) return {}

            const purchase = await Purchases
                .findOne({ user: user._id, _id: giftId })
                .populate('gift', {name: 1})
                .lean()

            const allPurchases = await Purchases
                .findOne({ user: user._id })
                .populate('gift', {name: 1})
                .lean()

            if (!purchase) return { allPurchases }
            else return {
                giftName: (purchase.gift as any).name,
                link: `https://t.me/qqdoctorbot/app?startapp=receive-${purchase._id}_${user._id}&`
            }
        } catch (e) { 
            return {}
         }
    }

    async getHistory(userId: string) {
        try {
            const user = await User
                .findOne({ _id: userId })
                .lean()

            if (!user) return []

            const buyActions = await Purchases
                .find(
                    { user: user._id },
                )
                .populate('gift')
                .lean()

            const sentActions = await Delivery
                .find({
                    from: user._id
                })
                .populate('gift to')
                .lean()

            const receiveActions = await Delivery
                .find({
                    to: user._id
                })
                .populate('gift from')
                .lean()

            const items = [
                ...buyActions.map(i => { return {...i, action: 'Buy'}}),
                ...sentActions.map(i => { return {...i, action: 'Sent'}}),
                ...receiveActions.map(i => { return {...i, action: 'Receive'}})
            ]

            items.sort(
                (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            const objectResult = {} as any
            for (let item of items) {
                const day = new Date(item.createdAt).toDateString()
                if (objectResult[day]) {
                    objectResult[day] = [
                        ...objectResult[day],
                        item
                    ]
                } else {
                    objectResult[day] = [ item ]
                }
            }
            const result = []
            for (let [key, values] of Object.entries(objectResult)) {
                result.push({
                    date: key,
                    data: values
                })
            }

            return result
       } catch (e) { 
            return {}
         }
    }
}

export default new Account();