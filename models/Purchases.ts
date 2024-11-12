import mongoose from 'mongoose'

const PurchasesSchema = new mongoose.Schema({
    gift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift',
        required: true
    },
    amount: { type: Number },
    currency: { type: String },
    owner: { type: Boolean, default: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true, versionKey: false })

export default mongoose.model('Purchases', PurchasesSchema)