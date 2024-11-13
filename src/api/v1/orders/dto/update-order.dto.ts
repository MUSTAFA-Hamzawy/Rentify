import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(['pending', 'in_progress', 'confirmed', 'completed'], {
    message:
      'status must be one of these values [pending, in_progress, confirmed, completed].',
  })
  @IsNotEmpty()
  order_status:
    | 'pending'
    | 'in_progress'
    | 'confirmed'
    | 'completed'
    | 'canceled';
}

export class UpdateOrderPaymentDto {
  @IsEnum(['pending', 'failed', 'completed'], {
    message: 'status must be one of these values [pending, failed, completed].',
  })
  @IsNotEmpty()
  payment_state: 'pending' | 'failed' | 'completed';
}
