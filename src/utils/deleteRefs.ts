import { Location } from '../types/location';
import LocationModel from '../models/Location';

export async function deleteRefs({ id, parent }: { id: string, parent: Location }) {
  if (parent) {
    // remove location from parent
    await LocationModel.updateMany(
      { _id: parent._id },
      { $pull: { children: id } }
    ).exec();
  }

  // remove location from children
  await LocationModel.updateMany(
    { parent: id },
    { parent: null }
  ).exec();
}

export default deleteRefs
