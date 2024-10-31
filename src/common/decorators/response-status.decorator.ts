import { SetMetadata } from '@nestjs/common';

export const RESPONSE_STATUS_KEY = 'response_status';
export const ResponseStatus = (statusCode: number) => SetMetadata(RESPONSE_STATUS_KEY, statusCode);
