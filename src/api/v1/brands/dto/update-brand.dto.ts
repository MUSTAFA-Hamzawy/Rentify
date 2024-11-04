import { PartialType } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto';
import { IsInt, IsNotEmpty, Matches } from 'class-validator';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @Matches(/^\d+$/, { message: 'brand_id must be a number' })
  @IsNotEmpty({ message: 'please provide the brand_id' })
  brand_id: string;
}
