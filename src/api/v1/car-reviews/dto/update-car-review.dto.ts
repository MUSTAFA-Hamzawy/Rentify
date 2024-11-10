import { PartialType } from '@nestjs/swagger';
import { CreateCarReviewDto } from './create-car-review.dto';

export class UpdateCarReviewDto extends PartialType(CreateCarReviewDto) {}
