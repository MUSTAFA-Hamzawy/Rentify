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
import { Helpers } from './common/helpers/helpers.class';

const PORT = process.env.PORT ?? '3000';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
  });
  // Adjust OpenAPI documentation link to reflect the current server port
  Helpers.adjustAPIDocsLink(PORT);

  // Load and parse the OpenAPI JSON file for Swagger documentation setup
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(API_PATH, 'docs', 'openapi.json'), 'utf8'),
  );

  // Set up Swagger UI for API documentation at the '/api/v1/api-docs' endpoint
  app.use(
    '/api/v1/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
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

  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
