import {
  IsDateString,
  IsNotEmpty,
  IsPositive,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { IsAfterDate } from '../../../../common/decorators/is-after-date.decorator';

export class CreateDiscountDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsAfterDate('start_date', {
    message: 'End date must be after start date',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @Max(99)
  @Min(1)
  @IsPositive()
  @IsNotEmpty()
  discount_percentage: number;

  @IsPositive()
  @IsNotEmpty()
  car_id: number;
}
