import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

import { Brand } from '../../api/v1/brands/entities/brand.entity';
export const BrandFactory = setSeederFactory(Brand, (faker: Faker) => {
  return {
    brand_id: faker.number.int({ min: 1, max: 10 }),
    brand_name: faker.commerce.productName(),
    brand_logo: faker.image.url(),
  };
});
