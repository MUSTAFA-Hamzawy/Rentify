import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LoggerService } from 'common/modules/logger/logger.service';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ResponseInterface {
  statusCode: number;
  message: string;
  response: string | object;
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger: LoggerService = new LoggerService();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let responseObj: ResponseInterface = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '',
      response: '',
    };

    console.log(exception);
    if(exception instanceof UnauthorizedException) {
      console.log('yesssssssssssssssss');
      
    }
    
    switch (true) {
      case exception instanceof HttpException:
        responseObj = {
          statusCode: exception.getStatus(),
          message: exception.message,
          response: exception.getResponse(),
        };
        break;
      case exception instanceof QueryFailedError:
        responseObj = {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: exception.message.replaceAll(/\n/g, ' '),
          response: '',
        };
        break;
      case exception instanceof BadRequestException:
        responseObj = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: exception.message,
          response: 'test',
        };
        break;
      case exception instanceof UnauthorizedException:
        responseObj = {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: exception.message,
          response: 'test',
        };
        break;
      default:
        responseObj = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Unknown Exception',
          response: 'Internal Server Error',
        };
        break;
    }

    response.status(responseObj.statusCode).json(responseObj);

    this.logger.error(responseObj.message, AllExceptionsFilter.name);
  }
}
