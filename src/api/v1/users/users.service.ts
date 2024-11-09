import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import {
  LoginDto,
  PasswordChangeDto,
  VerifyOTPDto,
} from './dto/custome-validation.dto';
import { MailerService } from '../../../common/modules/mailer/mailer.service';
import { TokenBlackList } from './entities/token-blacklist.entity';
import { User } from './entities/user.entity';
import { Helpers } from '../../../common/helpers/helpers.class';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersService is a service class that handles user-related operations.
 * It provides methods for creating, logging in, verifying OTP, updating profiles, and more.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(TokenBlackList)
    private readonly tokenBlackListRepository: Repository<TokenBlackList>,
    private readonly emailService: MailerService,
  ) {}

  /**
   * Creates a new user in the database.
   *
   * @param data CreateUserDto object containing user data.
   * @returns Promise that resolves to void.
   */
  async createUser(data: CreateUserDto): Promise<void> {
    try {
      const hashedPassword = await this.hashPassword(data.password);
      const user = {
        ...data,
        otp_secret_key: speakeasy.generateSecret({ length: 20 }).base32,
        password: hashedPassword,
      };

      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('User with this email already exists');
      throw new Error(error);
    }
  }

  /**
   * Logs in a user and returns an access token and a refresh token.
   *
   * @param loginData LoginDto object containing email and password.
   * @returns Promise that resolves to an object containing access token, refresh token, and account status.
   */
  async loginUser(loginData: LoginDto) {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email: loginData.email },
        select: [
          'user_id',
          'email',
          'password',
          'verification_status',
          'account_disabled',
          'is_admin'
        ],
      });

      const correctPassword = user
        ? await bcrypt.compare(loginData.password, user.password)
        : false;

      if (!user || !correctPassword)
        throw new ConflictException('Invalid email or password.');
      if (!user.verification_status)
        throw new ConflictException('Account is not verified');

      return {
        accessToken: this.generateToken(
          { email: user.email, user_id: user.user_id, role: user.is_admin ? 'admin' : 'user' },
          1,
        ),
        accountStatus: user.account_disabled
          ? 'Your account is deactivated'
          : 'account is active',
        refreshToken: this.generateToken(
          { email: user.email, user_id: user.user_id, role: user.is_admin ? 'admin' : 'user' },
          2,
        ),
      };
    } catch (error) {
      if (
        error instanceof EntityNotFoundError ||
        error instanceof ConflictException
      )
        throw new NotFoundException('Invalid email or password.');

      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Hashes a given password using bcrypt.
   *
   * @param password The password to be hashed.
   * @returns Promise that resolves to the hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(
        password,
        parseInt(process.env.PASSWORD_HASH_SALT_ROUND),
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /**
   * Generates a JWT token for a user.
   *
   * @param userData Object containing user email and ID.
   * @param tokenType Type of token to generate (1 for access token, 2 for refresh token).
   * @returns The generated JWT token.
   */
  generateToken(
    userData: { email: string, user_id: number, role: string },
    tokenType: number = 1,
  ): string {
    const SECRET_KEY =
      tokenType == 1
        ? process.env.JWT_ACCESS_TOKEN_KEY
        : process.env.JWT_REFRESH_TOKEN_KEY;
    const EXPIRED_TIME =
      tokenType == 1
        ? process.env.ACCESS_TOKEN_EXPIRED_TIME
        : process.env.REFRESH_TOKEN_EXPIRED_TIME;
    return jwt.sign(
      { email: userData.email, user_id: userData.user_id, role: userData.role },
      SECRET_KEY,
      { expiresIn: EXPIRED_TIME },
    );
  }

  /**
   * Requests an OTP for a user.
   *
   * @param secretKey The secret key of the user.
   * @returns Promise that resolves to the OTP code.
   */
  async requestOTP(secretKey: string): Promise<string> {
    try {
      return speakeasy.totp({
        secret: secretKey,
        encoding: 'base32',
      });
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  /**
   * Requests account activation for a user.
   *
   * @param email The email of the user.
   * @returns Promise that resolves to void.
   */
  async requestAccountActivation(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email },
        select: ['verification_status', 'otp_secret_key'],
      });

      if (user.verification_status && process.env.NODE_ENV !== 'test')
        throw new ConflictException('Account already verified');

      const otpCode = await this.requestOTP(user.otp_secret_key);
      await this.emailService.sendActivationMail(email, otpCode);
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('User is not registered');

      throw new Error(error);
    }
  }

  /**
   * Verifies an OTP for a user.
   *
   * @param params VerifyOTPDto object containing email and OTP.
   * @returns Promise that resolves to void.
   */
  async verifyOTP(params: VerifyOTPDto): Promise<void> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email: params.email },
        select: ['user_id', 'otp_secret_key', 'verification_status'],
      });

      const validOTP = speakeasy.totp.verify({
        secret: user.otp_secret_key,
        encoding: 'base32',
        token: params.otp,
        window: 1, // Allows for some leeway (1 window = 30 seconds)
      });

      if (validOTP && !user.verification_status) {
        user.verification_status = true;
        await this.userRepository.save(user);
      } else throw new UnauthorizedException('Invalid OTP code');
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('User not found.');

      if (error instanceof UnauthorizedException)
        throw new UnauthorizedException('Invalid OTP code');

      throw new Error(error);
    }
  }

  /**
   * Retrieves a user's profile.
   *
   * @param userID The ID of the user.
   * @returns Promise that resolves to the user's profile.
   */
  async getUserProfile(userID: number): Promise<User> {
    try {
      const profile = await this.userRepository.findOneOrFail({
        where: { user_id: +userID },
        select: [
          'full_name',
          'phone_number',
          'user_id',
          'email',
          'verification_status',
          'account_disabled',
          'image',
          'created_at',
          'updated_at',
        ],
      });
      profile.image = profile.image
        ? `${process.env.HOST}:${process.env.PORT}/uploads/${profile.image}`
        : null;
      return profile;
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('User not found.');

      throw new Error(error);
    }
  }

  /**
   * Validates a refresh token.
   *
   * @param refreshToken The refresh token to validate.
   * @returns The decoded user data.
   */
  validateRefreshToken(refreshToken: string) {
    if (!refreshToken)
      throw new BadRequestException('Refresh token is missing.');

    try {
      // Extract the token
      refreshToken = refreshToken.split('=')[1];
      const userDecodedData: { user_id: number; email: string, role: string } = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_KEY,
      );
      return userDecodedData;
    } catch (error) {
      throw new UnauthorizedException('This token is invalid.');
    }
  }

  /**
   * Changes the account status of a user.
   *
   * @param status The new status of the account.
   * @param userID The ID of the user.
   * @returns Promise that resolves to void.
   */
  async changeAccountStatus(status: boolean, userID: number): Promise<void> {
    try {
      await this.userRepository.update(userID, {
        account_disabled: status,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Changes the password of a user.
   *
   * @param data PasswordChangeDto object containing old and new passwords.
   * @param userID The ID of the user.
   * @returns Promise that resolves to void.
   */
  async changeUserPassword(
    data: PasswordChangeDto,
    userID: number,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { user_id: userID },
        select: ['password'],
      });
      const correctPassword = await bcrypt.compare(
        data.old_password,
        user.password,
      );
      if (!correctPassword) throw new ConflictException('Invalid old password');
      await this.userRepository.update(userID, {
        password: await this.hashPassword(data.new_password),
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Invalid credentials.');
      if (error instanceof ConflictException)
        throw new ConflictException(error.message);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Updates a user's profile.
   *
   * @param data UpdateUserDto object containing updated user data.
   * @param userID The ID of the user.
   * @returns Promise that resolves to void.
   */
  async updateUserProfile(data: UpdateUserDto, userID: number): Promise<void> {
    try {
      const user = await this.userRepository.findOneByOrFail({
        user_id: userID,
      });
      Object.assign(user, data);
      await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('User not found');
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Logs out a user by blacklisting their token.
   *
   * @param token The token to blacklist.
   * @returns Promise that resolves to void.
   */
  async logout(token: string): Promise<void> {
    try {
      await this.tokenBlackListRepository.save({ token });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Updates a user's profile image.
   *
   * @param filename The name of the new image file.
   * @param userID The ID of the user.
   * @returns Promise that resolves to the URL of the new image.
   */
  async updateProfileImage(filename: string, userID: number): Promise<string> {
    try {
      const user = await this.userRepository.findOneByOrFail({
        user_id: userID,
      });
      await Helpers.removeFile(user.image);
      user.image = filename;
      await this.userRepository.save(user);
      return `${process.env.HOST}:${process.env.PORT}/uploads/${filename}`;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
