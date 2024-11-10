import {
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCarReviewDto {
  @IsPositive()
  @IsNotEmpty()
  car_id: number;

  @Max(5)
  @Min(1)
  @IsPositive()
  @IsNotEmpty()
  review_rate: number;

  @MaxLength(900)
  @IsOptional()
  review_text: string;
}
