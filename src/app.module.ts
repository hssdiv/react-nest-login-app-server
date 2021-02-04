import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DogsModule } from './dogs/dogs.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot(),
        AuthModule,
        DogsModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            //url: 'postgresql://postgres:1@postgres:5432/react_app',
            url: process.env.DATABASE_URL, //compose
            //host: 'localhost',
            //port: 5432,
            //username: 'postgres',
            //password: '1',
            // entities: [ 
            //     'src/auth/entity/*.ts',
            //     'src/auth/entity/*.js',
            //     'src/dogs/entities/*.ts',
            //     'src/dogs/entities/*.js',
            //     './**/*.js'
            // ],
            entities: ['dist/**/*.entity.js'],
            //database: 'react_app',
            //autoLoadEntities: true,
            //synchronize: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        })],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
