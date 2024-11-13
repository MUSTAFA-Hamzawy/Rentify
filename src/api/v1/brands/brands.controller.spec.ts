import { Test, TestingModule } from '@nestjs/testing';
import { Brand } from './entities/brand.entity';
import * as dotenv from 'dotenv';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { AppDataSource } from '../../../database/data-source';
import { User } from '../users/entities/user.entity';

import { ROOT_PATH } from '../../../config/app.config';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const resource: string = 'brands';
const testingEmail: string = faker.internet.email();
const testingPassword: string = 'Open@1234';
const testingBrandName = faker.string.alpha(10);
const register: string = `/users/register`;
const login: string = `/users/login`;

let token: string = '';
describe('BrandsController Testing', () => {
  let app: INestApplication;

  beforeAll(async () => {
    dotenv.config();

    await AppDataSource.initialize();
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // creating admin email for testing purposes
    await AppDataSource.getRepository(User).save({
      full_name: 'eTe account',
      email: testingEmail,
      preferred_currency: 'USD',
      password: await bcrypt.hash(
        testingPassword,
        parseInt(process.env.PASSWORD_HASH_SALT_ROUND),
      ),
      confirm_password: testingPassword,
      phone_number: '201121366555',
      is_admin: true,
      verification_status: true,
    });
  });

  afterAll(async () => {
    await AppDataSource.getRepository(User).delete({ email: testingEmail });
    await AppDataSource.getRepository(Brand).delete({
      brand_name: testingBrandName,
    });
    await app.close();
  });

  describe('login admin user', () => {
    it('login', async () => {
      const res: any = await request(app.getHttpServer()).post(login).send({
        email: testingEmail,
        password: testingPassword,
      });
      expect(res.status).toBe(HttpStatus.OK);
      token = res.body.data.accessToken;
    });
  });

  describe('BrandsController: create', () => {
    it('should create a new brand', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('brand_logo', `${ROOT_PATH}/test/test-files/image-test.png`)
        .field('brand_name', testingBrandName);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return 400 for missing brand logo', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .field('brand_name', 'toyota');

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for invalid brand name', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('brand_logo', `${ROOT_PATH}/test/test-files/image-test.png`)
        .field('brand_name', 'invalid1224'); // Invalid brand name

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 409 for duplicate brand', async () => {
      // try to create the same brand again
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('brand_logo', `${ROOT_PATH}/test/test-files/image-test.png`)
        .field('brand_name', testingBrandName);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CONFLICT);
    });
  });
});
