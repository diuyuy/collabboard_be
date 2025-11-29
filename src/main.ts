import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ApiResponse } from './core/api-response/api-response';
import { HttpExceptionFilter } from './core/exception/http-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('Collabboard API Documentation')
      .setDescription('The Collabboard API description')
      .setVersion('1.0')
      .addTag('Collabboard')
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, config, {
        extraModels: [ApiResponse],
      });

    SwaggerModule.setup('api/swagger', app, documentFactory, {
      jsonDocumentUrl: 'api/swagger/json',
    });
  }
  await app.listen(process.env.PORT ?? 8080);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
