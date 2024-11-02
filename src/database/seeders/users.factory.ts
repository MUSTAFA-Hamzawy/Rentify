import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

import { User } from '../../api/v1/users/entities/user.entity';
export const UserFactory = setSeederFactory(User, (faker: Faker) => {
  return {
    full_name: faker.internet.displayName(),
    image: faker.image.avatar(),
    email: faker.internet.email(),
    preferred_currency: 'USD',
    password: faker.internet.password(),
    is_admin: false,
    is_blocked: false,
    verification_status: true,
    created_at: new Date(),
  };
});
