import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  Matches,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TrimString } from 'common/decorators/trim-string.decorator';

export class LoginDto {
  @TrimString()
  @IsNotEmpty({ message: 'Email is mandatory.' })
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Password is mandatory.' })
  @IsString()
  password: string;
}

export class EmailDto extends PickType(CreateUserDto, ['email'] as const) {
  @Transform(({ value }) => value.toString())
  email: string;
}

export class VerifyOTPDto extends PickType(CreateUserDto, ['email'] as const) {
  @Transform(({ value }) => value.toString())
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class PasswordChangeDto {
  @IsNotEmpty({ message: 'Old Password cannot be empty.' })
  @IsString()
  old_password: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/, {
    message:
      'New Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @IsNotEmpty({ message: 'New Password cannot be empty.' })
  @IsString()
  new_password: string;
}
