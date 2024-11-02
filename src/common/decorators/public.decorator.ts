import { SetMetadata } from '@nestjs/common';

/**
 * Defines the key for the metadata indicating if a route is public.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * A decorator that sets the metadata indicating a route is public.
 * This is used to mark routes that do not require authentication.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
