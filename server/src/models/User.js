import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    password: String,
    email: String,
    count: { type: Number, default: 0 },
    createdAt: String,
});

export default model('User', userSchema);
