import {
  IsInt,
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  Max,
  Min,
  IsDecimal,
  MaxLength,
  IsNotEmpty,
  IsPositive,
  Matches,
} from 'class-validator';
import { TrimString } from '../../../../common/decorators/trim-string.decorator';

export class CreateCarDto {
  @IsPositive()
  @IsNotEmpty()
  brand_id: number;

  @TrimString()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  car_name: string;

  @IsPositive()
  @IsNotEmpty()
  rental_price: number;

  @IsInt()
  @Min(1)
  @Max(365)
  @IsNotEmpty()
  minimum_rental_period: number;

  @IsPositive()
  @IsNotEmpty()
  pickup_location_id: number;

  @IsPositive()
  @IsNotEmpty()
  dropoff_location_id: number;

  @IsEnum(['automatic', 'manual'], {
    message: 'transmission must be either automatic or manual.',
  })
  @IsNotEmpty()
  transmission: 'automatic' | 'manual';

  @IsInt()
  @Min(1)
  @Max(50)
  @IsNotEmpty()
  number_of_seats: number;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @IsPositive()
  @Max(1000)
  @IsNotEmpty()
  engine_size: number;

  @IsPositive()
  @Min(10)
  @IsNotEmpty()
  max_speed: number;

  @IsPositive()
  @Max(200)
  diesel_capacity: number;

  @TrimString()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  body_type: string;

  @IsPositive()
  @Min(1900)
  @Max(new Date().getFullYear())
  @IsNotEmpty()
  year: number;

  @IsEnum(['petrol', 'diesel'], {
    message: 'fuel_type must be either petrol or diesel.',
  })
  @IsNotEmpty()
  fuel_type: 'petrol' | 'diesel';
}
