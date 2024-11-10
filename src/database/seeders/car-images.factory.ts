import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { CarImage } from '../../api/v1/cars/entities/car-images.entity';
import { Column } from 'typeorm';

export const CarImageFactory = setSeederFactory(CarImage, (faker: Faker) => {
  return {
    image_path: faker.image.avatar(),
    car_id: faker.helpers.arrayElement([1, 2, 3, 4]),
  };
});
