import { model, Schema } from 'mongoose';

const roles = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    SERVICER: 'servicer',
};

const userSchema = new Schema({
    password: String,
    email: String,
    count: { type: Number, default: 0 },
    createdAt: String,
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
    roles: { type: [{ type: String }], default: [roles.CUSTOMER] },
});

const User = model('User', userSchema);
export { User, roles };
