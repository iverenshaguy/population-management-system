import Location from '../models/Location';

export async function updateParent(id: string, oldParent: string, newParent: string) {
  // remove location from old parent
  await Location.findByIdAndUpdate(
    oldParent,
    { $pull: { children: id } },
    { new: true, useFindAndModify: false }
  ).exec();

  // add location to new parent
  await Location.findByIdAndUpdate(
    newParent,
    { $push: { children: id } },
    { new: true, useFindAndModify: false }
  ).exec();
}

export default updateParent;
