import { Test, TestingModule } from '@nestjs/testing';
import { Location } from './entities/location.entity';
import * as dotenv from 'dotenv';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { AppDataSource } from '../../../database/data-source';
import { User } from '../users/entities/user.entity';

import { ROOT_PATH } from '../../../config/app.config';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const resource: string = 'locations';
const testingEmail: string = faker.internet.email();
const testingPassword: string = 'Open@1234';
const register: string = `/users/register`;
const login: string = `/users/login`;

let token: string = '';
let testingLocationID = null;
describe('LocationsController Testing', () => {
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

  describe('LocationsController: create', () => {
    it('should create a new location', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: 'New Cairo, down town',
          coordinates: {
            lat: 85.6601,
            long: 20.9395,
          },
          location_type: 'pickup',
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
      testingLocationID = response.body.data.location_id;
    });

    it('should return 400 for missing location coordinates', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: 'New Cairo, down town',
          location_type: 'pickup',
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for invalid coordinates', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: 'New Cairo, down town',
          coordinates: {
            lat: 'invalid_85.6601',
            long: 20.9395,
          },
          location_type: 'pickup',
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('LocationsController: get', () => {
    it('should fetch a location with id', async () => {
      const response: any = await request(app.getHttpServer())
        .get(`/${resource}/${testingLocationID}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.location_id).toBe(testingLocationID);
    });

    it('should return 404 if location not found', async () => {
      const response: any = await request(app.getHttpServer())
        .get(`/${resource}/132456`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should fetch all locations', async () => {
      const response: any = await request(app.getHttpServer())
        .get(`/${resource}?page=1&limit=5`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(5);
    });
  });

  describe('LocationsController: udpate', () => {
    it('should update a location', async () => {
      const response: any = await request(app.getHttpServer())
        .patch(`/${resource}/${testingLocationID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: 'New address',
          location_type: 'drop_off',
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.address).toBe('New address');
      expect(response.body.data.location_type).toBe('drop_off');
    });
  });

  describe('LocationsController: delete', () => {
    it('should remove a location with id', async () => {
      const response: any = await request(app.getHttpServer())
        .delete(`/${resource}/${testingLocationID}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return 404 if location not found', async () => {
      const response: any = await request(app.getHttpServer())
        .delete(`/${resource}/10123549`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('Trying to fetch the removed location, should return not found', async () => {
      const response: any = await request(app.getHttpServer())
        .get(`/${resource}/${testingLocationID}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
