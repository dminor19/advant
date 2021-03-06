import { model, Schema } from 'mongoose';

const roles = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    SERVICER: 'servicer',
};

const userSchema = new Schema({
    password: String,
    email: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    isVerified: { type: Boolean, required: false, default: false },
    isAccountLocked: { type: Boolean, required: false, default: false },
    count: { type: Number, default: 0 },
    createdAt: { type: Date, required: true, default: Date.now() },
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
    roles: { type: [{ type: String }], default: [roles.CUSTOMER] },
});

const User = model('User', userSchema);
export { User, roles };
