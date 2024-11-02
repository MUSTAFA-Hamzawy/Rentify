import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  Matches,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { PasswordMatch } from '../decorators/password-match.decorator';
import { TrimString } from '../../../../common/decorators/trim-string.decorator';

export class CreateUserDto {
  @MaxLength(200)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Full name can only contain alphabets.',
  })
  @IsNotEmpty({ message: 'Full name is mandatory.' })
  @TrimString()
  @IsString()
  full_name: string;

  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @TrimString()
  @IsNotEmpty({ message: 'Email is mandatory.' })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @IsString()
  password: string;

  @PasswordMatch('password', {
    message: 'Confirm Password must match Password.',
  })
  @IsNotEmpty({ message: 'Confirm Password cannot be empty.' })
  @IsString()
  confirm_password: string;

  @IsOptional()
  @IsEnum(['USD', 'EGP'], {
    message: 'Preferred currency must be either USD or EGP.',
  })
  @IsString()
  preferred_currency?: string;

  @IsOptional()
  @Matches(/^[0-9]*$/, { message: 'Phone number can only contain numbers.' })
  @MaxLength(15)
  phone_number?: string;
}
