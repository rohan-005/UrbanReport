import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

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
          'mongodb://127.0.0.1:27017/urbanreports_users';
        const dbName = configService.get<string>('DB_NAME') || 'urbanreports_users';
        return {
          uri,
          dbName,
        };
      },
    }),
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
