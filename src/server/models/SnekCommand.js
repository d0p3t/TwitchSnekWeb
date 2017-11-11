import mongoose from 'mongoose';

const SnekCommandSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    subscriber: {
        type: Boolean,
        default: false
    },
    direction: {
        type: String,
        default: 'invalid'
    },
    performed_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('SnekCommand', SnekCommandSchema);