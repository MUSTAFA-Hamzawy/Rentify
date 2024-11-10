import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TrimString } from '../../../../common/decorators/trim-string.decorator';

export class CreateContactUsDto {
  @MaxLength(200, { message: 'Subject is too long.' })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  subject: string;

  @MaxLength(800, { message: 'Message is too long.' })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  message: string;
}
