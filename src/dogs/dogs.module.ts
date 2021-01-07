import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogService } from './dog.service';
import { DogsController } from './dogs.controller';
import { Dog } from './entities/dog.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Dog])],
    controllers: [DogsController],
    providers: [DogService],
})
export class DogsModule {}
