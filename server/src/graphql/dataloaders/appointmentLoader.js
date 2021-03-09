import Dataloader from 'dataloader';
import { Appointment } from '../../models/Appointment';

const batchAppointments = async (ids) => {
    const appointments = await Appointment.find({ _id: { $in: ids } });
    const appointmentMap = {};
    appointments.forEach((a) => (appointmentMap[a.id] = a));
    return ids.map((id) => appointmentMap[id]);
};

export const appointmentLoader = () => new Dataloader(batchAppointments);
