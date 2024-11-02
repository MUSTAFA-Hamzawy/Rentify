import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Helpers } from '../../common/helpers/helpers.class';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * This interceptor transforms timestamps in the response data to a human-readable format.
 * It specifically targets 'created_at' and 'updated_at' fields and converts them to a string
 * indicating the time difference from the current time.
 */
@Injectable()
export class TransformTimestampInterceptor<T> implements NestInterceptor<T, T> {
  /**
   * This method intercepts the response data and applies the timestamp transformation.
   * It uses the CallHandler to handle the execution of the next interceptor in the chain,
   * and then pipes the result through the map operator to transform the timestamps.
   *
   * @param context The execution context of the current request.
   * @param next The CallHandler instance.
   * @returns An Observable of the transformed data.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(map(data => this.transformTimestamps(data.data)));
  }

  /**
   * This method checks if the data is defined and calls formatItem to transform the timestamps.
   * If the data is undefined, it returns the data as is.
   *
   * @param data The data to be transformed.
   * @returns The transformed data or the original data if it's undefined.
   */
  private transformTimestamps(data) {
    return data ? this.formatItem(data) : data;
  }

  /**
   * This method formats a single item by transforming its 'created_at' and 'updated_at' timestamps
   * to a human-readable format using the Helpers.timestampDifference method.
   *
   * @param item The item to be formatted.
   * @returns The formatted item.
   */
  private formatItem(item) {
    if (item.created_at)
      item.created_at = Helpers.timestampDifference(item.created_at);
    if (item.updated_at)
      item.updated_at = Helpers.timestampDifference(item.updated_at);
    return item;
  }
}
