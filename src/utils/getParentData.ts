import Location from '../models/Location';
import { ParentData } from '../types/location';

export async function getParentData(id: string, newParent: string): Promise<ParentData> {
  if (!newParent) return { oldParent: undefined, newParent: undefined };

  const location = await Location.findById(id, {}, { autopopulate: false }).exec();

  if (location) {
    const parent = location.parent && location.parent.toString();
    if (id === newParent || location.children.includes(newParent)) {
      return { oldParent: parent, newParent: parent};
    }

    return { oldParent: parent, newParent};
  }

  return { oldParent: undefined, newParent: undefined };
}

export default getParentData;
