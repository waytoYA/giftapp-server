import axios from 'axios'
import User from '../models/User'
import Transaction from '../models/Transaction'
import Purchases from '../models/Purchases'
import Gift from '../models/Gift'
import Botlife from './Botlife'

class Payment {

    private async deleteInvoice (invoiceId: number) {
        const apiUrl = 'https://testnet-pay.crypt.bot/api/deleteInvoice'
        const token = process.env.CRYPTOBOT_API_TOKEN_TESTNET
        
        await axios.get(
            apiUrl,
            {
                headers: {
                    'Crypto-Pay-API-Token': token
                },
                params: {
                    invoice_id: invoiceId
                }
            }
        ) 
        .then(async () => {
            await Transaction
                .updateOne(
                    {invoice_id: invoiceId, status: 'create'},
                    {status: 'expired'}
                )
        })
    }

    private async getInvoices () {
        const apiUrl = 'https://testnet-pay.crypt.bot/api/getInvoices'
        const token = process.env.CRYPTOBOT_API_TOKEN_TESTNET
        
        const response = await axios.get(
            apiUrl,
            {
                headers: {
                    'Crypto-Pay-API-Token': token
                },
            }
        )
        const invoices = response.data.result.items
        return invoices
    }
    
    private async paidTransaction (
        transaction: any,
        invoice: any
    ) {
        let returnGift = null;
        await Transaction.updateOne({_id: transaction.id, status: 'create'}, {status: 'paid'})
        .then(async () => {
            const gift = await Gift.findOne({ _id: transaction.gift })

            if (!gift) return await Transaction.updateOne({_id: transaction.id}, {status: 'cancelled'})

            await Purchases.create({
                gift: transaction.gift,
                amount: invoice.paid_amount,
                currency: invoice.asset,
                user: transaction.user
            })
            await Gift.updateOne({_id: gift?.id}, {
                $inc: { purchased: 1 }
            })

            Botlife.sendMessage(
                String(transaction.user.tgId),
                `👌 You gave purchased the gift of <b>${gift.name}</b>.`,
                'Open Gifts',
                process.env.CLIENT_URL + '/gifts'
            )

            returnGift = gift
        })
        return returnGift
    }

    async createInvoice (item: any, user: any) {
        try {
            const apiUrl = 'https://testnet-pay.crypt.bot/api/createInvoice';
            const token = process.env.CRYPTOBOT_API_TOKEN_TESTNET;

            let invoiceUrl = '';
            await axios.get(
                apiUrl,
                {
                    headers: {
                        'Crypto-Pay-API-Token': token
                    },
                    params: {
                        asset: 'USDT', // item.currency,
                        description: `Purchasing a ${item.name} gift`,
                        amount: '0.05', // item.amount
                        expires_in: 3600,
                        paid_btn_url: 'https://t.me/qqdoctorbot/app?startapp=statusPurchased'
                    }
                }
            )
            .then(async (response) => {
                const data = response.data.result

                await Transaction.create({
                    invoice_id: data.invoice_id,
                    gift: item.id,
                    user: user._id
                })

                invoiceUrl = data.mini_app_invoice_url
            })

            return invoiceUrl
        } catch (error) {
            return ''
        }
    }

    async check (userId: string | null = null) {
        try {

            const invoices = await this.getInvoices()

            const transactions = await Transaction
                .find(
                    Boolean(userId)
                    ? {user: userId, status: 'create'}
                    : {status: 'create'}
                )
                .populate('user')
                .sort({createdAt: -1})
            const transactionsId = transactions.map(i => i.invoice_id)

            let completePayment = null;
            for (let invoice of invoices) {
                if (invoice.status == 'expired'){
                    await this.deleteInvoice(invoice.invoice_id)
                    continue
                }
                if (
                    invoice.status == 'paid' &&
                    transactionsId.indexOf(invoice.invoice_id) != -1
                ) {
                    const transaction = transactions.find(i => i.invoice_id == invoice.invoice_id) as any

                    completePayment = await this.paidTransaction(
                        transaction,
                        invoice
                    )
                }
            }

            return userId ? completePayment : true
        } catch (error) {
            return null
        }
    }

}

export default new Payment();