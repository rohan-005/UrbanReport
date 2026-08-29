import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationsWorkerMain');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3006;
  app.enableCors();
  await app.listen(port);
  logger.log(`UrbanReports Notifications Worker Service listening on port ${port}`);
}

bootstrap();
