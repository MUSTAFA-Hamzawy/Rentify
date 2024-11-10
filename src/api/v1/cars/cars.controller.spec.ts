import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../../../database/data-source';
import { AppModule } from '../../../app.module';
import { User } from '../users/entities/user.entity';
import * as request from 'supertest';
import { ROOT_PATH } from '../../../config/app.config';
import { Brand } from '../brands/entities/brand.entity';
import { Location } from '../locations/entities/location.entity';

const resource: string = 'cars';
const testingEmail: string = 'test@gmail.com';
const testingPassword: string = 'Open@1234';
const register: string = `/users/register`;
const login: string = `/users/login`;
let token: string = '';

let testingBrandID = null;
let testingBrandName = 'testing brand name';
let testingLocationID = null;
let testingCarID = null;
describe('CarsController Testing', () => {
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
    await AppDataSource.getRepository(Location).delete({
      location_id: testingLocationID,
    });
    await app.close();
  });

  describe('creating some resources for testing purposes', () => {
    it('registering admin email', async () => {
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

    it('create a new brand', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/brands`)
        .set('Authorization', `Bearer ${token}`)
        .attach('brand_logo', `${ROOT_PATH}/test/test-files/image-test.png`)
        .field('brand_name', testingBrandName);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
      testingBrandID = response.body.data.brand_id;
    });

    it('create a new location', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/locations`)
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
  });

  describe('CarsController: create', () => {
    it('should create a new car', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand_id: testingBrandID,
          car_name: 'test_car_name',
          rental_price: 10.89,
          minimum_rental_period: 2,
          pickup_location_id: testingLocationID,
          dropoff_location_id: testingLocationID,
          transmission: 'automatic',
          number_of_seats: 4,
          is_available: true,
          engine_size: 50,
          max_speed: 120,
          diesel_capacity: 100,
          body_type: 'SUV',
          year: 2010,
          fuel_type: 'petrol',
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
      testingCarID = response.body.data.car_id;
    });

    it('should return 400 for invalid data', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${resource}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Trying to create a car with missing data
          brand_id: testingBrandID,
          rental_price: 10.89,
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('CarsController: get', () => {
    it('should fetch a car with id', async () => {
      const response: any = await request(app.getHttpServer())
        .get(`/${resource}/${testingCarID}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.car_id).toBe(testingCarID);
    });

    it('should return 404 if car not found', async () => {
      const response: any = await request(app.getHttpServer())
        .get(`/${resource}/132456`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should fetch all cars', async () => {
      const response: any = await request(app.getHttpServer())
        .get(`/${resource}?page=1&limit=5`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(5);
    });
  });

  describe('CarsController: udpate', () => {
    it('should update a car', async () => {
      const response: any = await request(app.getHttpServer())
        .patch(`/${resource}/${testingCarID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          rental_price: 20,
          minimum_rental_period: 5,
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.rental_price).toBe(20);
      expect(response.body.data.minimum_rental_period).toBe(5);
    });
  });

  describe('CarsController: delete', () => {
    it('should remove a car with id', async () => {
      const response: any = await request(app.getHttpServer())
        .delete(`/${resource}/${testingCarID}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return 404 if car not found', async () => {
      const response: any = await request(app.getHttpServer())
        .delete(`/${resource}/10123549`)
        .set('Authorization', `Bearer ${token}`);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
