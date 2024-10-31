import { HttpStatus } from '@nestjs/common';

/**
 * This interface is used to format the response of an API call.
 */
export interface ResponseFormat <T> {
  message: string;
  data: T;
  statusCode: number;
}
