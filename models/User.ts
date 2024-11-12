import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    tgId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
}, { timestamps: true, versionKey: false })

export default mongoose.model('User', UserSchema)