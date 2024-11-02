import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_METADATA } from '../../common/decorators/response-message.decorator';
import { RESPONSE_STATUS_KEY } from '../../common/decorators/response-status.decorator';
import { ResponseFormat } from '../../common/interfaces/response-format.interface';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((res: any) => {
        const response = context.switchToHttp().getResponse();
        const statusCode =
          this.reflector.get<number>(
            RESPONSE_STATUS_KEY,
            context.getHandler(),
          ) || HttpStatus.OK;
        response.status(statusCode);
        const message =
          this.reflector.get<string>(
            RESPONSE_MESSAGE_METADATA,
            context.getHandler(),
          ) || 'Request Processed Successfully.';

        return { statusCode, message, data: res || {} };
      }),
      // catchError((err: HttpException) =>
      //   throwError(() => this.errorHandler(err, context)),
      // ),
    );
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;
    const message =
      this.reflector.get<string>(
        RESPONSE_MESSAGE_METADATA,
        context.getHandler(),
      ) || 'success';

    return {
      status: true,
      path: request.url,
      message: message,
      statusCode,
      data: res,
    };
  }

  // errorHandler(exception: HttpException, context: ExecutionContext) {
  //   const ctx = context.switchToHttp();
  //   const response = ctx.getResponse();
  //   const request = ctx.getRequest();

  //   const status =
  //     exception instanceof HttpException
  //       ? exception.getStatus()
  //       : HttpStatus.INTERNAL_SERVER_ERROR;

  //   response.status(status).json({
  //     statusCode: status,
  //     message: exception.message || 'failed',
  //     result: exception,
  //   });
  // }
}
