import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('UsersService');
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
      console.log(`[USERS SERVICE] ${method} ${originalUrl} -> Status ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 5001;
  await app.listen(port, '0.0.0.0');
  logger.log(`UrbanReports Users Service running on port ${port}`);
}
bootstrap();
