import Dataloader from 'dataloader';
import { User } from '../../models/User';

const batchUsers = async (ids) => {
    const users = await User.find({ _id: { $in: ids } });
    const userMap = {};
    users.forEach((u) => (userMap[u.id] = u));
    return ids.map((id) => userMap[id]);
};

export const userLoader = () => new Dataloader(batchUsers);
