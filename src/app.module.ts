import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DogsModule } from './dogs/dogs.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot(),
    AuthModule,
    DogsModule,
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '1',
    database: 'react_app',
    autoLoadEntities: true,
    //synchronize: true,
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
