import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { TokenBlackList } from './entities/token-blacklist.entity';
import * as dotenv from 'dotenv';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { AppDataSource } from '../../../database/data-source';

const resource: string = 'users';
const register: string = `/${resource}/register`;
const login: string = `/${resource}/login`;
const profile: string = `/${resource}/profile`;
const logout: string = `/${resource}/logout`;
const password: string = `/${resource}/password`;

const testingEmail: string = 'admin.test@gmail.com';
const testingPassword: string = 'Open@1234';

let token: string = '';
describe('UsersController Testing', () => {
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
  });

  afterAll(async () => {
    await AppDataSource.getRepository(User).delete({ email: testingEmail });
    await app.close();
  });

  describe('UsersController: Register', () => {
    it('should register a user successfully with valid data', async () => {
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
        });

      expect(response).toBeDefined();
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return error if email is already registered', async () => {
      // First register the user
      await request(app.getHttpServer()).post(register).send({
        full_name: 'Mustafa Mahmoud',
        email: testingEmail,
        preferred_currency: 'USD',
        password: testingPassword,
        confirm_password: testingPassword,
        phone_number: '201121366555',
      });

      // Try to register the same user again
      const res = await request(app.getHttpServer()).post(register).send({
        full_name: 'Mustafa Mahmoud',
        email: testingEmail,
        preferred_currency: 'USD',
        password: testingPassword,
        confirm_password: testingPassword,
        phone_number: '201121366555',
      });

      expect(res.status).toBe(HttpStatus.CONFLICT);
    });

    it('should return error if email is missing', async () => {
      const res = await request(app.getHttpServer()).post(register).send({
        full_name: 'Mustafa Mahmoud',
        preferred_currency: 'USD',
        password: testingPassword,
        confirm_password: testingPassword,
        phone_number: '201121366555',
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error for invalid email format', async () => {
      const res = await request(app.getHttpServer()).post(register).send({
        full_name: 'Mustafa Mahmoud',
        email: 'invalid-email',
        preferred_currency: 'USD',
        password: testingPassword,
        confirm_password: testingPassword,
        phone_number: '201121366555',
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error if password does not meet complexity requirements', async () => {
      const res = await request(app.getHttpServer()).post(register).send({
        full_name: 'Mustafa Mahmoud',
        email: testingEmail,
        preferred_currency: 'USD',
        password: 'simplepass',
        confirm_password: 'simplepass',
        phone_number: '201121366555',
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error if passwords do not match', async () => {
      const res = await request(app.getHttpServer()).post(register).send({
        full_name: 'Mustafa Mahmoud',
        email: testingEmail,
        preferred_currency: 'USD',
        password: testingPassword,
        confirm_password: 'Mismatch@1234',
        phone_number: '201121366555',
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error for invalid phone number', async () => {
      const res = await request(app.getHttpServer()).post(register).send({
        full_name: 'Mustafa Mahmoud',
        email: testingEmail,
        preferred_currency: 'USD',
        password: testingPassword,
        confirm_password: testingPassword,
        phone_number: 'invalid-phone',
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error if full name contains invalid characters', async () => {
      const res = await request(app.getHttpServer()).post(register).send({
        full_name: 'Mustafa123',
        email: testingEmail,
        preferred_currency: 'USD',
        password: testingPassword,
        confirm_password: testingPassword,
        phone_number: '201121366555',
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('UsersController: Login', () => {
    it('should log in successfully with valid credentials', async () => {
      const res: any = await request(app.getHttpServer()).post(login).send({
        email: testingEmail,
        password: testingPassword,
      });

      expect(res.status).toBe(HttpStatus.OK);

      token = res.body.data.accessToken;
    });

    it('should return error for incorrect password', async () => {
      const res = await request(app.getHttpServer()).post(login).send({
        email: testingEmail,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return error for unregistered email', async () => {
      const res = await request(app.getHttpServer()).post(login).send({
        email: 'unregistered@test.com',
        password: testingPassword,
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return error if email is missing', async () => {
      const res = await request(app.getHttpServer()).post(login).send({
        password: testingPassword,
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error if password is missing', async () => {
      const res = await request(app.getHttpServer()).post(login).send({
        email: testingEmail,
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error for invalid email format', async () => {
      const res = await request(app.getHttpServer()).post(login).send({
        email: 'invalid-email',
        password: testingPassword,
      });
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('UsersController: Profile', () => {
    it('should return user profile successfully with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get(profile)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(HttpStatus.OK);

      expect(res.body.data.data).toHaveProperty('email', testingEmail);
      expect(res.body.data.data).toHaveProperty('full_name');
      expect(res.body.data.data).toHaveProperty('user_id');
    });

    it('should return 401 Unauthorized for missing token', async () => {
      const res = await request(app.getHttpServer()).get(profile);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should fail for invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get(profile)
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('UsersController: Profile Update', () => {
    it('should update the user profile successfully with valid data', async () => {
      const res = await request(app.getHttpServer())
        .patch(profile)
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Hamzawy',
          preferred_currency: 'EGP',
          phone_number: '201121366578',
        });

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return error for invalid phone number', async () => {
      const res = await request(app.getHttpServer())
        .patch(profile)
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Hamzawy',
          preferred_currency: 'EGP',
          phone_number: 'invalid-phone',
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error for unauthorized request', async () => {
      const res = await request(app.getHttpServer()).patch(profile).send({
        full_name: 'Hamzawy',
        preferred_currency: 'EGP',
        phone_number: '201121366578',
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('UsersController: Change Password', () => {
    it('should change password successfully', async () => {
      const res = await request(app.getHttpServer())
        .patch(password)
        .set('Authorization', `Bearer ${token}`)
        .send({
          old_password: testingPassword,
          new_password: 'Open@12345',
        });

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return error for incorrect old password', async () => {
      const res = await request(app.getHttpServer())
        .patch(password)
        .set('Authorization', `Bearer ${token}`)
        .send({
          old_password: 'wrongpassword',
          new_password: testingPassword,
        });

      expect(res.status).toBe(HttpStatus.CONFLICT);
    });

    it('should return error for weak new password', async () => {
      const res = await request(app.getHttpServer())
        .patch(password)
        .set('Authorization', `Bearer ${token}`)
        .send({
          old_password: testingPassword,
          new_password: '12345',
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return to the old password again', async () => {
      const res = await request(app.getHttpServer())
        .patch(password)
        .set('Authorization', `Bearer ${token}`)
        .send({
          old_password: 'Open@12345',
          new_password: testingPassword,
        });

      expect(res.status).toBe(HttpStatus.OK);
    });
  });

  describe('UsersController: Logout', () => {
    it('should logout the user successfully', async () => {
      const res = await request(app.getHttpServer())
        .post(logout)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return error for unauthorized request', async () => {
      const res = await request(app.getHttpServer()).post(logout); // No token

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    // Trying to get profile after logout
    it('should return error for unauthorized request', async () => {
      const res = await request(app.getHttpServer())
        .get(profile)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
