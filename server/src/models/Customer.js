import { model, Schema } from 'mongoose';

const customerSchema = new Schema({
    password: String,
    email: String,
    count: { type: Number, default: 0 },
    createdAt: String,
});

export default model('Customer', customerSchema);
