import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri =
          configService.get<string>('MONGODB_URI') ||
          'mongodb://127.0.0.1:27017/urbanreports_media';
        const dbName =
          configService.get<string>('MEDIA_DB_NAME') ||
          configService.get<string>('DB_NAME') ||
          'urbanreports_media';
        return {
          uri,
          dbName,
        };
      },
    }),
    HealthModule,
    MediaModule,
  ],
})
export class AppModule {}
