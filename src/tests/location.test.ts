import startServer from '../server';
import request from './helpers/setup';
import * as mongoose from 'mongoose';
import Location from '../models/Location';
import { userToken, adminToken, newLocation, newLocationWithParent, badLocation, fakeToken, newLocation2 } from './helpers/fixtures';
jest.setTimeout(500000)

describe('Location', () => {
  let server;
  let parentId;
  let locationId;
  let locationId2;

  beforeAll( async() => {
    server = await startServer();
  });

  beforeEach(() => jest.setTimeout(10000));

  afterAll(() => {
    mongoose.disconnect();
    server.close();
  });

  describe('Create Location', () => {
    it('creates a new location', async() => {
      const mutation = `
        mutation($input: CreateLocationInput!) {
          createLocation(input: $input) {
            id
            name
            population {
              male
              female
              total
            }
          }
        }
      `;

      const data = await request(mutation, userToken, { input: newLocation });
      const response = data['createLocation'];
      parentId = response.id;

      expect(response).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
      }));
      expect(response.population).toEqual(expect.objectContaining({
        male: expect.any(Number),
        female: expect.any(Number),
        total: expect.any(Number),
      }));
      expect(response.name).toEqual(newLocation.name);
      expect(response.population.female).toEqual(newLocation.female);
      expect(response.population.male).toEqual(newLocation.male);
      expect(response.population.total).toEqual(newLocation.female + newLocation.male);
    });

    it('creates new locations with parent', async() => {
      const mutation = `
        mutation($input: CreateLocationInput!) {
          createLocation(input: $input) {
            id
            name
            population {
              male
              female
              total
            }
            parent {
              id
              name
              population {
                male
                female
                total
              }
              children {
                name
                population {
                  male
                  female
                  total
                }
              }
            }
          }
        }
      `;

      const data = await request(mutation, userToken, { input: { ...newLocationWithParent, parent: parentId } });
      const response = data['createLocation'];
      locationId = response.id;
      const data2 = await request(mutation, adminToken, { input: {...newLocation2, parent: parentId } });
      const response2 = data2['createLocation'];
      locationId2 = response2.id;

      expect(response).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
        parent: expect.any(Object),
      }));
      expect(response.parent).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
        children: expect.any(Array),
      }));
      expect(response.population).toEqual(expect.objectContaining({
        male: expect.any(Number),
        female: expect.any(Number),
        total: expect.any(Number),
      }));
      expect(response.name).toEqual(newLocationWithParent.name);
      expect(response.population.female).toEqual(newLocationWithParent.female);
      expect(response.population.male).toEqual(newLocationWithParent.male);
      expect(response.population.total).toEqual(newLocationWithParent.female + newLocationWithParent.male);
      // check parent data
      expect(response.parent.name).toEqual(newLocation.name);
      expect(response.parent.population.female).toEqual(newLocation.female);
      expect(response.parent.population.male).toEqual(newLocation.male);
      expect(response.parent.population.total).toEqual(newLocation.female + newLocation.male);
      // check parent child data
      expect(response.parent.children[0].name).toEqual(newLocationWithParent.name);
      expect(response.parent.children[0].population.female).toEqual(newLocationWithParent.female);
      expect(response.parent.children[0].population.male).toEqual(newLocationWithParent.male);
      expect(response.parent.children[0].population.total).toEqual(newLocationWithParent.female + newLocationWithParent.male);
    });

    it('does not create an existing location', async() => {
      const mutation = `
        mutation($input: CreateLocationInput!) {
          createLocation(input: $input) {
            id
            name
            population {
              male
              female
              total
            }
          }
        }
      `;

      try {
        await request(mutation, userToken, { input: newLocation });
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Location already exists');
        expect(error.name).toEqual('Error');
      }
    });

    it('does not create a location for invalid data', async() => {
      const mutation = `
        mutation($input: CreateLocationInput!) {
          createLocation(input: $input) {
            id
            name
            population {
              male
              female
              total
            }
          }
        }
      `;

      try {
        await request(mutation, userToken, { input: badLocation });
      } catch(err) {
        const nameError = err.response.errors[0];
        const graphqlError = err.response.errors[1];

        expect(nameError).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(nameError.message).toEqual('Must be at least 3 characters in length');
        expect(nameError.name).toEqual('ValidationError');
        expect(graphqlError.message).toEqual('Variable \"$input\" got invalid value { name: \"m\", female: -12 }; Field value.male of required type ConstraintNumber! was not provided.');
        expect(graphqlError.name).toEqual('ValidationError');
      }
    });

    it('does not create a location for a user with bad token', async() => {
      const mutation = `
        mutation($input: CreateLocationInput!) {
          createLocation(input: $input) {
            id
            name
            population {
              male
              female
              total
            }
          }
        }
      `;

      try {
        await request(mutation, fakeToken, { input: newLocation });
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Failed to authenticate token');
        expect(error.name).toEqual('AuthenticationError');
      }
    });
  });

  describe('Get Location', () => {
    it('gets all locations in the app', async() => {
      const query = `
        query {
          locations {
            id
            name
            author {
              id
              name
            }
            population {
              male
              female
              total
            }
            parent {
              id
              name
              population {
                female
                male
                total
              }
              parent {
                id
                name
                population {
                  female
                  male
                  total
                }
              }
              children {
                id
                name
                population {
                  female
                  male
                  total
                }
              }
            }
            children {
              id
              name
              population {
                male
                female
                total
              }
            }
          }
        }
      `;

      const locationSchema = expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        author: expect.any(Object),
        population: expect.any(Object),
        parent: expect.any(Object),
        children: expect.any(Array)
      })

      const data = await request(query);
      const response = data['locations'];

      expect(response.length).toEqual(3);
      expect(response[0]).toEqual(locationSchema);
      expect(response[1]).toEqual(locationSchema);
      expect(response[2]).toEqual(locationSchema);
      expect(response[0].children.length).toEqual(2);
      expect(response[0].children[0]).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
      }));
      expect(response[1].parent).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
        children: expect.any(Array),
      }));
      expect(response[2].parent).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
        children: expect.any(Array),
      }));
      expect(response[0].population).toEqual(expect.objectContaining({
        male: expect.any(Number),
        female: expect.any(Number),
        total: expect.any(Number),
      }));
    });

    it('gets a location for a user', async() => {
      const query = `
        query {
          location(id: "${locationId}") {
            id
            name
            author {
              id
              name
              email
            }
            population {
              male
              female
              total
            }
            parent {
              id
              name
              population {
                female
                male
                total
              }
              parent {
                id
                name
                population {
                  female
                  male
                  total
                }
              }
              children {
                id
                name
                population {
                  female
                  male
                  total
                }
              }
            }
            children {
              id
              name
              population {
                male
                female
                total
              }
            }
          }
        }
      `;

      const data = await request(query);
      const response = data['location'];

      expect(response).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        author: expect.any(Object),
        population: expect.any(Object),
        parent: expect.any(Object),
        children: expect.any(Array)
      }));
      // author must not contain email for a normal user
      expect(response.author).not.toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      }));
      expect(response.author).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
      }));
      expect(response.parent).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
        children: expect.any(Array),
      }));
      expect(response.parent.children[0]).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
      }));
      expect(response.population).toEqual(expect.objectContaining({
        male: expect.any(Number),
        female: expect.any(Number),
        total: expect.any(Number),
      }));
    });

    it('gets a location for an admin', async() => {
      const query = `
        query {
          location(id: "${locationId}") {
            id
            name
            author {
              id
              name
              email
            }
            population {
              male
              female
              total
            }
          }
        }
      `;

      const data = await request(query, adminToken);
      const response = data['location'];

      expect(response).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        author: expect.any(Object),
        population: expect.any(Object),
      }));
      // author cna contain email for an admin
      expect(response.author).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      }));
      expect(response.population).toEqual(expect.objectContaining({
        male: expect.any(Number),
        female: expect.any(Number),
        total: expect.any(Number),
      }));
    });
  });

  describe('Update Location', () => {
    it('updates an existing location', async() => {
      const mutation = `
        mutation($id: ID!, $input: UpdateLocationInput!) {
          updateLocation(id: $id, input: $input) {
            id
            name
            population {
              male
              female
              total
            }
            children {
              id
              name
              population {
                male
                female
                total
              }
            }
          }
        }
      `;

      const data = await request(mutation, userToken, { id: locationId, input: { name: 'new mojave' } });
      const response = data['updateLocation'];

      expect(response).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
      }));
      expect(response.population).toEqual(expect.objectContaining({
        male: expect.any(Number),
        female: expect.any(Number),
        total: expect.any(Number),
      }));
      expect(response.name).toEqual('new mojave');
      expect(response.population.female).toEqual(newLocationWithParent.female);
      expect(response.population.male).toEqual(newLocationWithParent.male);
      expect(response.population.total).toEqual(newLocationWithParent.female + newLocationWithParent.male);
    });

    it('updates the parent of an existing location and updates the old and new parents to reflect the change', async() => {
      let formerParent;
      const mutation = `
        mutation($id: ID!, $input: UpdateLocationInput!) {
          updateLocation(id: $id, input: $input) {
            id
            name
            population {
              male
              female
              total
            }
            parent {
              id
              name
              population {
                male
                female
                total
              }
              children {
                id
                name
                population {
                  male
                  female
                  total
                }
              }
            }
          }
        }
      `;

      formerParent = await Location.findById(parentId).exec();

      expect(formerParent.children.length).toEqual(2);
      expect(formerParent.children.map(child => child._id).includes(locationId2)).toBeTruthy();

      const data = await request(mutation, adminToken, { id: locationId2, input: { parent: locationId } });
      const response = data['updateLocation'];

      expect(response).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
      }));
      expect(response.population).toEqual(expect.objectContaining({
        male: expect.any(Number),
        female: expect.any(Number),
        total: expect.any(Number),
      }));
      expect(response.name).toEqual(newLocation2.name);
      expect(response.population.female).toEqual(newLocation2.female);
      expect(response.population.male).toEqual(newLocation2.male);
      expect(response.population.total).toEqual(newLocation2.female + newLocation2.male);
      // check former parent data
      formerParent = await Location.findById(parentId).exec();
      expect(formerParent.name).toEqual(newLocation.name);
      expect(formerParent.children.length).toEqual(1);
      expect(formerParent.children.map(child => child._id).includes(locationId2)).toBeFalsy();
      // check new parent data
      expect(response.parent.name).toEqual('new mojave');
      expect(response.parent.population.female).toEqual(newLocationWithParent.female);
      expect(response.parent.population.male).toEqual(newLocationWithParent.male);
      expect(response.parent.population.total).toEqual(newLocationWithParent.female + newLocationWithParent.male);
      // check parent child data
      const newParent = await Location.findById(locationId).exec();
      expect(newParent.children[0].name).toEqual(response.name);
      expect(newParent.children[0].population.female).toEqual(response.population.female);
      expect(newParent.children[0].population.male).toEqual(response.population.male);
    });

    it('does not update a location that does not belong to user', async() => {
      const mutation = `
        mutation($id: ID!, $input: UpdateLocationInput!) {
          updateLocation(id: $id, input: $input) {
            id
            name
            population {
              male
              female
              total
            }
            parent {
              id
              name
              population {
                male
                female
                total
              }
              children {
                name
                population {
                  male
                  female
                  total
                }
              }
            }
          }
        }
      `;

      try {
        await request(mutation, userToken, { id: locationId2, input: { name: "the place" } });
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Location not found');
        expect(error.name).toEqual('Error');
      }
    });

    it('does not update a location that does not exist', async() => {
      const mutation = `
        mutation($id: ID!, $input: UpdateLocationInput!) {
          updateLocation(id: $id, input: $input) {
            id
            name
            population {
              male
              female
              total
            }
            parent {
              id
              name
              population {
                male
                female
                total
              }
              children {
                name
                population {
                  male
                  female
                  total
                }
              }
            }
          }
        }
      `;

      try {
        await request(mutation, adminToken, { id: '5d0e6d373c25c0ccc89ef831', input: { name: "the place" } });
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Location not found');
        expect(error.name).toEqual('Error');
      }
    });

    it('does not update a location for a user with bad token', async() => {
      const mutation = `
        mutation($id: ID!, $input: UpdateLocationInput!) {
          updateLocation(id: $id, input: $input) {
            id
            name
            population {
              male
              female
              total
            }
          }
        }
      `;

      try {
        await request(mutation, fakeToken, { id:parentId, input: newLocation });
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Failed to authenticate token');
        expect(error.name).toEqual('AuthenticationError');
      }
    });
  });

  describe('Delete Location', () => {
    it('deletes an existing location and updates it\'s children and parent', async() => {
      const mutation = `
        mutation($id: ID!) {
          deleteLocation(id: $id) {
            id
            name
            population {
              male
              female
              total
            }
            children {
              id
              name
              population {
                male
                female
                total
              }
            }
          }
        }
      `;

      const parentBeforeDelete = await Location.findById(parentId).exec();
      expect(parentBeforeDelete.name).toEqual(newLocation.name);
      expect(parentBeforeDelete.children.length).toEqual(1);
      expect(parentBeforeDelete.children.map(child => child._id).includes(locationId)).toBeTruthy();

      const childBeforeDelete = await Location.findById(locationId2).exec();
      expect(childBeforeDelete.name).toEqual(newLocation2.name);
      expect(childBeforeDelete.parent.id).toEqual(locationId);

      const data = await request(mutation, userToken, { id: locationId });
      const response = data['deleteLocation'];

      const parentAfterDelete = await Location.findById(parentId).exec();
      expect(parentAfterDelete.children.length).toEqual(0);

      const childAfterDelete = await Location.findById(locationId2).exec();
      expect(childAfterDelete.parent).toEqual(null);

      expect(response).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        population: expect.any(Object),
      }));
      expect(response.population).toEqual(expect.objectContaining({
        male: expect.any(Number),
        female: expect.any(Number),
        total: expect.any(Number),
      }));
      expect(response.name).toEqual('new mojave');
      expect(response.population.female).toEqual(newLocationWithParent.female);
      expect(response.population.male).toEqual(newLocationWithParent.male);
      expect(response.population.total).toEqual(newLocationWithParent.female + newLocationWithParent.male);

      const deletedLocation = await Location.findById(locationId).exec();
      expect(deletedLocation).toEqual(null);
    });

    it('does not delete a location that does not exist', async() => {
      const mutation = `
        mutation($id: ID!) {
          deleteLocation(id: $id) {
            id
            name
            population {
              male
              female
              total
            }
            children {
              id
              name
              population {
                male
                female
                total
              }
            }
          }
        }
      `;

      try {
        await request(mutation, adminToken, { id: locationId });
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Location not found');
        expect(error.name).toEqual('Error');
      }
    });

    it('does not delete a location for a user with bad token', async() => {
      const mutation = `
        mutation($id: ID!) {
          deleteLocation(id: $id) {
            id
            name
            population {
              male
              female
              total
            }
          }
        }
      `;

      try {
        await request(mutation, fakeToken, { id: locationId });
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Failed to authenticate token');
        expect(error.name).toEqual('AuthenticationError');
      }
    });
  });
});
