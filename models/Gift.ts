import mongoose from 'mongoose'

const GiftSchema = new mongoose.Schema({
    name: { type: String },
    amount: { type: Number },
    currency: { type: String },
    purchased: { type: Number },
    quantity: { type: Number },
}, { timestamps: true, versionKey: false })

export default mongoose.model('Gift', GiftSchema)