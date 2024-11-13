import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../src/database/data-source';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { User } from '../src/api/v1/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ROOT_PATH } from '../src/config/app.config';
import { faker } from '@faker-js/faker';

const testingEmail: string = faker.internet.email();
const adminTestingEmail: string = faker.internet.email();
const testingPassword: string = 'Open@1234';
const testingBrandName: string = faker.string.alpha(10).toString();
let token = '';
let testingLocationID: number = 0;
let testingBrandID: number = 0;
let testingCarID: number = 0;

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    dotenv.config();

    await AppDataSource.initialize();
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalInterceptors(app.get(ResponseInterceptor));
    await app.init();

    // creating admin email
    await AppDataSource.getRepository(User).save({
      full_name: 'eTe account',
      email: adminTestingEmail,
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
    await app.close();
  });

  describe('Users Module (e2e)', () => {
    it('should register a user successfully with valid data', async () => {
      const response: any = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          full_name: 'eTe account',
          email: testingEmail,
          preferred_currency: 'USD',
          password: testingPassword,
          confirm_password: testingPassword,
          phone_number: '201121366555',
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should login successfully', async () => {
      const response: any = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: adminTestingEmail,
          password: testingPassword,
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.OK);
      token = response.body.data.accessToken;
    });

    it('should create a brand successfully', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/brands`)
        .set('Authorization', `Bearer ${token}`)
        .attach('brand_logo', `${ROOT_PATH}/test/test-files/image-test.png`)
        .field('brand_name', testingBrandName);

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
      testingBrandID = response.body.data.data.brand_id;
    });

    it('should create a new location', async () => {
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
      testingLocationID = response.body.data.data.location_id;
    });

    it('should create a new car', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/cars`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand_id: testingBrandID,
          car_name: 'A4',
          rental_price: 45,
          minimum_rental_period: 2,
          pickup_location_id: testingLocationID,
          dropoff_location_id: testingLocationID,
          transmission: 'automatic',
          number_of_seats: 4,
          is_available: true,
          engine_size: 50,
          max_speed: 120,
          diesel_capacity: 2,
          body_type: 'Wagon',
          year: 2011,
          fuel_type: 'diesel',
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
      testingCarID = response.body.data.data.car_id;
    });

    it('should add a new car-review', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/car-reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: testingCarID,
          review_rate: 4,
          review_text: 'testing review comment',
        });
      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should add a new discount', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/discounts`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: testingCarID,
          discount_percentage: 15,
          start_date: new Date(),
          end_date: new Date(new Date().setDate(new Date().getDate() + 4)), // dropoff date is 4 days from today
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should create a new order', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: testingCarID,
          pickup_date: new Date(),
          dropoff_date: new Date(new Date().setDate(new Date().getDate() + 10)), // dropoff date is 10 days from today
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });
});
