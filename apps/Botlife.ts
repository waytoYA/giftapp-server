import axios from 'axios'
import User from '../models/User'
import Transaction from '../models/Transaction'
import Purchases from '../models/Purchases'
import Gift from '../models/Gift'
import Payment from './Payment'
import cron from 'node-cron'
import { bot } from '../bot';

class Botlife {

    async sendMessage (
        tgId: string,
        text: string,
        textButton: string,
        urlButton: string
    ) {
        try {
            return await bot.api.sendMessage(
                tgId, text,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: textButton, web_app: {url: urlButton}}]
                        ]
                    },
                    parse_mode: 'HTML'
                }
            )
        } catch (error) {
            return null
        }
    }


}

export default new Botlife();