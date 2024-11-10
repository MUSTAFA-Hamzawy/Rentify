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

const resource: string = 'brands';
const testingEmail: string = 'test@gmail.com';
const testingPassword: string = 'Open@1234';
const testingBrandName = 'Kiaa';
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
  });

  afterAll(async () => {
    await AppDataSource.getRepository(User).delete({ email: testingEmail });
    await AppDataSource.getRepository(Brand).delete({
      brand_name: testingBrandName,
    });
    await app.close();
  });

  describe('creating new admin user for testing purposes', () => {
    it('registering', async () => {
      const response: any = await request(app.getHttpServer())
        .post(register)
        .send({
          full_name: 'Mustafa Mahmoud',
          email: testingEmail,
          preferred_currency: 'USD',
          password: testingPassword,
          confirm_password: testingPassword,
          phone_number: '201121366555',
          verification_status: true,
          is_admin: true,
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
    });

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
