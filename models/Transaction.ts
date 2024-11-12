import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
    invoice_id: { type: Number },
    status: {type: String, default: 'create'},
    gift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true, versionKey: false })

export default mongoose.model('Transaction', TransactionSchema)