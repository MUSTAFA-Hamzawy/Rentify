import { IsString, IsNotEmpty } from 'class-validator';
import { TrimString } from '../../../../common/decorators/trim-string.decorator';

export class UpdateCarPoliciesDto {
  @TrimString()
  @IsString()
  @IsNotEmpty()
  policies: string;
}
