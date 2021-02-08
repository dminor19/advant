import { model, Schema } from 'mongoose';

const appointmentSchema = new Schema({
    start_time: String,
    end_time: String,
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    createdAt: String,
});

export default model('Appointment', appointmentSchema);
