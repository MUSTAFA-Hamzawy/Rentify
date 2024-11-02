import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_METADATA = 'responseMessage';

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_METADATA, message);
