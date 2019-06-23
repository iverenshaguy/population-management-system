import Location from '../../models/Location';
import getCredentials from '../../utils/getCredentials';
import getParentData from '../../utils/getParentData';
import updateParent from '../../utils/updateParent';
import getUpdateValue from '../../utils/getUpdateValue';
import deleteRefs from '../../utils/deleteRefs';
import { Context } from '../../types/type';
import { CreateLocationInput, UpdateLocationInput } from '../../types/location';
import { AuthenticationError } from './../../utils/formatError';

export const location = {
  async createLocation(_, { input }: { input: CreateLocationInput }, ctx: Context) {
    const { name, female, male, parent: parentId } = input;
    const { user: { userId }, error } = await getCredentials(ctx);

    if (error) {
      throw new AuthenticationError(error);
    }

    const exists = await Location.exists({ name });

    if(exists) {
      throw new Error('Location already exists')
    }

    const newLocation = await Location.create({
      name,
      population: {
        male,
        female
      },
      author: userId,
      parent: parentId,
      children: []
    });

    // update parent location
    if (parentId) {
      await Location.findByIdAndUpdate(
        parentId,
        { $push: { children: newLocation.id } },
        { new: true, useFindAndModify: false }
      ).exec();
    }

    return newLocation.populate([
      { path: 'author' },
      {
        path: 'parent',
        populate: ['children', 'parent']
      }
    ]).execPopulate();
  },

  async updateLocation(_, { id, input }: { id: string, input: UpdateLocationInput }, ctx: Context) {
    const { user: { userId, role }, error } = await getCredentials(ctx);

    if (error) {
      throw new AuthenticationError(error);
    }

    let exists;
    const { parent: newParentId }: UpdateLocationInput = input;
    const { oldParent, newParent } = await getParentData(id, newParentId);
    const updateValue = await getUpdateValue(id, input);

    if (role !== 'admin') {
      exists = await Location.exists({ _id: id, author: userId });
    } else {
      exists = await Location.exists({ _id: id });
    }

    if (!exists) {
      throw new Error(`Location not found`)
    }

    const location = await Location.findByIdAndUpdate(
      id,
      updateValue,
      { new: true, useFindAndModify: false }
    );

    if (newParent && (oldParent !== newParent)) {
      // also update parent if parent changed
      await updateParent(id, oldParent, newParent);
    }

    return location.save();
  },

  async deleteLocation(_, { id }: { id: String }, ctx: Context) {
    let location;
    const { user: { userId, role }, error } = await getCredentials(ctx);

    if (error) {
      throw new AuthenticationError(error);
    }

    if (role !== 'admin') {
      location = await Location.findOneAndRemove(
        { _id: id, author: userId },
        { useFindAndModify: false }
      );
    } else {
      location = await Location.findByIdAndRemove(
        id,
        { useFindAndModify: false }
      );
    }

    if (!location) {
      throw new Error(`Location not found`)
    }

    const deletedLocation = await location.populate([
      { path: 'author' },
      {
        path: 'parent',
        populate: ['children', 'parent']
      },
      {
        path: 'children',
        populate: ['children', 'parent']
      }
    ]).execPopulate();

    await deleteRefs(location);

    return deletedLocation;
  },
}
