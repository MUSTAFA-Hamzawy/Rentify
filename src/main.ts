import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'api/v1/guards/auth.guard';
import helmet from 'helmet';
import { LoggerService } from 'common/modules/logger/logger.service';
import { AllExceptionsFilter } from 'all-exceptions.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ROOT_PATH } from 'config/app.config';
import { join } from 'path';
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { TransformTimestampInterceptor } from 'common/interceptors/transform-timestamp.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: false });

  // app.useGlobalFilters(new AllExceptionsFilter());
  app.useLogger(app.get(LoggerService));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  // app.useStaticAssets(join(ROOT_PATH, 'uploads'));
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

// TODO:
// 1- CORS : https://youtu.be/8_X0nSrzrCw?t=8015
// 2 helmet config
