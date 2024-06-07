import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    avatar: String,
    global_name: String,
    id: {
        type: String,
        required: true,
        unique: true,
    },
    ip_address: {
        type: [String],
        default: [],
    },
    payment: {
        type: Object,
        default: null
    }
});

const User = mongoose.model('User', UserSchema);

export { User }
