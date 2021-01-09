import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.use(cookieParser());

    const options = new DocumentBuilder()
        .setTitle('Dogs Api')
        .setDescription('dogs API description')
        .setVersion('1.0')
        .addTag('dogs')
        .addCookieAuth('Authentication')
        .addSecurity('basic', {
            type: 'http',
            scheme: 'basic',
        })
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    await app.listen(4000);
}
bootstrap();
