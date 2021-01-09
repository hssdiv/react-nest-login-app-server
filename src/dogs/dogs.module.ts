import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogService } from './dog.service';
import { DogsController } from './dogs.controller';
import { Dog } from './entities/dog.entity';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [TypeOrmModule.forFeature([Dog])],
    controllers: [DogsController],
    providers: [
        DogService,
        // {
        //     provide: APP_GUARD,
        //     useClass: RolesGuard,
        // },
    ],
})
export class DogsModule { }
