import { model, Schema } from 'mongoose';

const customerSchema = new Schema({
    password: String,
    email: String,
    count: { type: Number, default: 0 },
    createdAt: String,
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
});

export default model('Customer', customerSchema);
