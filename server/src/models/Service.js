import { model, Schema } from 'mongoose';

const serviceSchema = new Schema({
    subservices: [
        {
            title: { type: String, required: true },
            cost: { type: String, required: true },
        },
    ],
    title: { type: String, required: true },
    category: { type: String, required: true },
});

export default model('Service', serviceSchema);
