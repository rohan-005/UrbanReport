import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('APIGateway');
  const app = await NestFactory.create(AppModule);

  const defaultOrigins = [
    'https://urban-report-web.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const envOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      logger.warn(`Blocked request from unauthorized origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'x-user-id',
      'x-user-role',
      'x-request-id',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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

  const port = Number(process.env.PORT) || Number(process.env.GATEWAY_PORT) || 4001;
  await app.listen(port, '0.0.0.0');
  logger.log(`UrbanReports API Gateway running on port ${port}`);
  logger.log(`GraphQL endpoint available at http://localhost:${port}/graphql`);
}
bootstrap();
