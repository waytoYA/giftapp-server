import axios from 'axios'
import User from '../models/User'
import Transaction from '../models/Transaction'
import Purchases from '../models/Purchases'
import Gift from '../models/Gift'
import Payment from './Payment'
import cron from 'node-cron'

class Cron {

    async start () {
        try {

            cron.schedule('*/40 * * * * *', () => {

                // Commitment not to leave all transactions unverified
                Payment.check()

            }, { timezone: "Europe/Moscow" });

            return;
        } catch (error) {
            return null
        }
    }

}

export default new Cron();