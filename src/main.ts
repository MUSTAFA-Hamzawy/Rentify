import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';

import { LoggerService } from './common/modules/logger/logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { API_PATH } from './config/app.config';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
  });
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(API_PATH, 'docs', 'openapi.json'), 'utf8'),
  );

  // app.useGlobalFilters(new AllExceptionsFilter());
  app.useLogger(app.get(LoggerService));
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(compression());
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.use(
    '/api/v1/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
  );

  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
