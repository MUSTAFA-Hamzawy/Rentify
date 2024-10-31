import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  Patch,
  UploadedFile,
  ValidationPipe,
  UseInterceptors,
  UnauthorizedException,
  HttpStatus
} from '@nestjs/common';
import { Multer } from 'multer';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'common/decorators/public.decorator';
import { LoggerService } from 'common/modules/logger/logger.service';
import {
  EmailDto,
  LoginDto,
  PasswordChangeDto,
  VerifyOTPDto,
} from './dto/custome-validation.dto';
import { UploadService } from 'common/modules/upload/upload.service';
import { multerConfig } from 'config/multer.config';
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { User } from './entities/user.entity';
import { ResponseStatus } from 'common/decorators/response-status.decorator';

@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UsersController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(
    private readonly userService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Registers a new user and sends an activation email.
   * 
   * @param createBody The user creation data.
   * @returns A response indicating the user registration status.
   */
  @Post('register')
  @Public()
  @ResponseMessage('User registered successfully. Please check your email to activate your account.')
  async register(@Body(ValidationPipe) createBody: CreateUserDto): Promise<{verification_path: string}> {
    try {
      await this.userService.createUser(createBody);
      await this.userService.requestAccountActivation(createBody.email);
      return {"verification_path":"/v1/users/verifyOTP"};
    } catch (error) {
      this.logger.error(error.message, `User Registeration, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Requests an OTP for account activation.
   * 
   * @param body The email to send the OTP to.
   * @returns A response indicating the OTP request status.
   */
  @Public()
  @Post('requestOTP')
  @ResponseMessage('Please check your email to activate your account.')
  async requestOTP(@Body(ValidationPipe) body: EmailDto): Promise<{path: string}> {
    try {
      await this.userService.requestAccountActivation(body.email);
      return {"path":"/v1/users/verifyOTP"};
    } catch (error) {
      this.logger.error(error.message, `requestOTP, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Verifies the OTP for account activation.
   * 
   * @param params The OTP verification data.
   * @returns A response indicating the OTP verification status.
   */
  @Public()
  @Post('verifyOTP')
  @ResponseMessage('User Activated successfully.')
  async verifyOTP(@Body(ValidationPipe) params: VerifyOTPDto): Promise<void> {
    try {
      await this.userService.verifyOTP(params);
    } catch (error) {
      this.logger.error(error.message, `verifyOTP, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Logs in a user and sets a refresh token cookie.
   * 
   * @param loginData The user login data.
   * @param res The response object.
   * @returns A response indicating the login status.
   */
  @Public()
  @Post('login')
  @ResponseMessage('User logged in successfully.')
  async login(@Body(ValidationPipe) loginData: LoginDto, @Res() res: Response){
    try {
      const result = await this.userService.loginUser(loginData);

      // Assigning refresh token in http-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge:
          (parseInt(process.env.REFRESH_TOKEN_EXPIRED_TIME) || 7) *
          24 *
          60 *
          60 *
          1000,
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'User logged in successfully.',
        data: result
      });
    } catch (error) {
      this.logger.error(error.message, `login, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves the user profile.
   * 
   * @param req The request object.
   * @returns A response containing the user profile.
   */
  @Get('profile')
  @ResponseMessage('User profile retrieved successfully.')
  async getProfile(@Req() req): Promise<User> {
    try {
      return await this.userService.getUserProfile(req.user.user_id);
    } catch (error) {
      this.logger.error(error.message, `getProfile, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Refreshes the user token.
   * 
   * @param req The request object.
   * @returns A response containing the new access token.
   */
  @Post('refreshToken')
  @ResponseMessage('Token refreshed successfully.')
  async refreshToken(@Req() req: Request): Promise<{newToken: string}> {
    try {
      const refreshToken: string =
        req.cookies?.refreshToken || req.headers.cookie;

      const userData = this.userService.validateRefreshToken(refreshToken);
      const accessToken = this.userService.generateToken(userData, 1);
      return {newToken: accessToken};

    } catch (error) {
      this.logger.error(error.message, `refreshToken, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Updates the user profile.
   * 
   * @param updateBody The user profile update data.
   * @param req The request object.
   * @returns A response indicating the update status.
   */
  @Patch('profile')
  @ResponseMessage('User profile updated successfully.')
  async updateProfile(
    @Body(ValidationPipe)
    updateBody: UpdateUserDto,
    @Req() req,
  ): Promise<User> {
    try {
      await this.userService.updateUserProfile(
        updateBody,
        req.user.user_id,
      );
      return this.getProfile(req);
    } catch (error) {
      this.logger.error(error.message, `updateProfile, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Logs out the user.
   * 
   * @param req The request object.
   * @returns A response indicating the logout status.
   */
  @Post('logout')
  @ResponseMessage('User logged out successfully.')
  @ResponseStatus(HttpStatus.OK)
  async logout(@Req() req: Request): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1];
      await this.userService.logout(token);
    } catch (error) {
      this.logger.error(error.message, `logout, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Disables the user account.
   * 
   * @param req The request object.
   * @returns A response indicating the account disable status.
   */
  @Patch('account_disable')
  @ResponseMessage('Account disabled successfully.')
  async disableAccount(@Req() req): Promise<void> {
    try {
      await this.userService.changeAccountStatus(true, req.user.user_id);
    } catch (error) {
      this.logger.error(error.message, `disableAccount, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Enables the user account.
   * 
   * @param req The request object.
   * @returns A response indicating the account enable status.
   */
  @Patch('account_enable')
  @ResponseMessage('Account enabled successfully.')
  async enableAccount(@Req() req): Promise<void>  {
    try {
      await this.userService.changeAccountStatus(false, req.user.user_id);
    } catch (error) {
      this.logger.error(error.message, `enableAccount, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Changes the user password.
   * 
   * @param body The password change data.
   * @param req The request object.
   * @returns A response indicating the password change status.
   */
  @Patch('password')
  @ResponseMessage('Password changed successfully.')
  async changePassword(
    @Body(ValidationPipe) body: PasswordChangeDto,
    @Req() req: any,
  ): Promise<void> {
    try {
      await this.userService.changeUserPassword(body, req.user.user_id);
    } catch (error) {
      this.logger.error(error.message, `changePassword, ${UsersController.name}`);
      throw error;
    }
  }

  /**
   * Updates the user profile image.
   * 
   * @param file The uploaded file.
   * @param req The request object.
   * @returns A response indicating the profile image update status.
   */
  @Patch('profileImage')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ResponseMessage('Profile image updated successfully.')
  async updateProfileImage(@UploadedFile() file: Multer.File, @Req() req): Promise<{newImage: string}> {
    try {
      await this.uploadService.validateImage(file);
      const newImage: string = await this.userService.updateProfileImage(
        file.filename,
        req.user.user_id,
      );

      return {newImage};
    } catch (error) {
      this.logger.error(error.message, `updateProfileImage, ${UsersController.name}`);
      throw error;
    }
  }
}
