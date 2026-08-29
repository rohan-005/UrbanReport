import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationsWorkerMain');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 5005;
  app.enableCors();
  app.use((req: any, res: any, next: () => void) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[NOTIFICATIONS SERVICE] ${method} ${originalUrl} -> Status ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
  await app.listen(port);
  logger.log(`UrbanReports Notifications Worker Service listening on port ${port}`);
}

bootstrap();
