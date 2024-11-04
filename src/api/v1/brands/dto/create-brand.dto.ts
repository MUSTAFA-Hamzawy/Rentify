import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  Matches,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { TrimString } from '../../../../common/decorators/trim-string.decorator';

export class CreateBrandDto {
  @MaxLength(200)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Brand name can only contain alphabets.',
  })
  @IsNotEmpty({ message: 'Brand name is mandatory.' })
  @TrimString()
  @IsString()
  brand_name: string;

}
