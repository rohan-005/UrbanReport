import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('APIGateway');
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    credentials: true,
  });

  app.use((req: any, res: any, next: () => void) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API GATEWAY] ${method} ${originalUrl} -> Status ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || process.env.GATEWAY_PORT || 4001;
  await app.listen(port, '0.0.0.0');
  logger.log(`UrbanReports API Gateway running on port ${port}`);
  logger.log(`GraphQL endpoint available at http://localhost:${port}/graphql`);
}
bootstrap();
