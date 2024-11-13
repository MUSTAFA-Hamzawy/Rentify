import { IsAfterDate } from '../../../../common/decorators/is-after-date.decorator';
import { IsDateString, IsNotEmpty, IsPositive } from 'class-validator';
import { TrimString } from '../../../../common/decorators/trim-string.decorator';
import { IsTodayOrAfter } from '../../../../common/decorators/is-today-or-after.decorator';

export class CreateOrderDto {
  @IsPositive()
  @IsNotEmpty()
  car_id: number;

  @TrimString()
  @IsTodayOrAfter()
  @IsDateString()
  @IsNotEmpty()
  pickup_date: string;

  @TrimString()
  @IsAfterDate('pickup_date', {
    message: 'Drop-off date must be after Pickup date',
  })
  @IsDateString()
  @IsNotEmpty()
  dropoff_date: string;
}
