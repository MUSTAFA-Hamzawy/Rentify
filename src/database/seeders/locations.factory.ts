import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';



import { Location } from '../../api/v1/locations/entities/location.entity';
export const LocationFactory = setSeederFactory(Location, (faker: Faker) => {
  return {
    address:`${faker.location.city()}, ${faker.location.state()}`,
    coordinates:{
      lat: faker.location.latitude(),
      long: faker.location.longitude(),
    },
    location_type: faker.helpers.arrayElement(['pickup', 'drop_off']),
  };
});
