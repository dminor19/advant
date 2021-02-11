import { model, Schema } from 'mongoose';

const appointmentSchema = new Schema({
    start_time: String,
    end_time: String,
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    servicer: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: String,
    customer_notes: String,
    servicer_notes: String,
});

export default model('Appointment', appointmentSchema);
