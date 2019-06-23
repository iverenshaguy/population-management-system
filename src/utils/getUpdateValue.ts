import getParentData from './getParentData';
import { UpdateLocationInput, UpdateLocationValue } from '../types/location';

export async function getUpdateValue(id: string, input: UpdateLocationInput): Promise<UpdateLocationValue> {
  const { name, male, female, parent }: UpdateLocationInput = input;
  const { newParent } = await getParentData(id, parent);
  const hasPopulation = (male || male === 0) || (female || female === 0);

  const updateValue: UpdateLocationValue = {
    ...(name && { name }),
    ...(hasPopulation && {
      population: {
        ...((male || male === 0) && { male }),
        ...((female || female === 0) && { female })
      }
    }),
    ...((parent && newParent) && { parent: newParent }),
    ...((parent === null) && { parent: null })
  }

  return updateValue;
}

export default getUpdateValue;
