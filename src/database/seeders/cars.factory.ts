import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { Car } from '../../api/v1/cars/entities/car.entity';

export const CarFactory = setSeederFactory(Car, (faker: Faker) => {
  return {
    brand_id: faker.helpers.arrayElement([1, 2, 3, 4]),
    car_name: faker.string.alpha(),
    rental_price: faker.number.int({ min: 20, max: 500 }),
    minimum_rental_period: faker.number.int({ min: 1, max: 10 }),
    pickup_location_id: faker.helpers.arrayElement([1, 2, 3, 4]),
    dropoff_location_id: faker.helpers.arrayElement([1, 2, 3, 4]),
    transmission: faker.helpers.arrayElement(['automatic', 'manual']),
    number_of_seats: faker.number.int({ min: 1, max: 10 }),
    is_available: true,
    engine_size: faker.number.int({ min: 10, max: 90 }),
    max_speed: faker.number.int({ min: 20, max: 200 }),
    diesel_capacity: faker.number.int({ min: 10, max: 90 }),
    body_type: faker.string.alpha(),
    year: faker.helpers.arrayElement([2010, 2011, 2019, 2020, 2021, 2022]),
    fuel_type: faker.helpers.arrayElement(['petrol', 'diesel']),
  };
});
