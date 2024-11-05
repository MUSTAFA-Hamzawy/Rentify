import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CoordinatesDto {
  @IsNotEmpty()
  @IsNumber({}, {message: "Latitude field must be a number"})
  lat: number;

  @IsNotEmpty()
  @IsNumber({}, {message: "Longitude field must be a number"})
  long: number;
}

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @IsEnum(['pickup', 'drop_off'], {
    message: 'location_type must be either [pickup] or [drop_off]',
  })
  location_type: 'pickup' | 'drop_off';
}
