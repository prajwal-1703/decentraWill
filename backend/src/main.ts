import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Correlation ID & Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || `req_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Global Exception Filter
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    })
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('DecentraWill API')
    .setDescription(
      'Secure digital trust, verification, asset-management, governance, and inheritance-coordination platform backend.'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Identity / KYC')
    .addTag('Estates')
    .addTag('Wills')
    .addTag('Document Vault')
    .addTag('Attestations')
    .addTag('Assets')
    .addTag('Workflows')
    .addTag('Governance & Voting')
    .addTag('Proof of Life')
    .addTag('Inheritance & Activation')
    .addTag('Notifications')
    .addTag('Admin & Operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);
  logger.log(`DecentraWill API server is running on http://localhost:${port}`);
  logger.log(`OpenAPI documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
