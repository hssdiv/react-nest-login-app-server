import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class NewDogFormFull {
    @IsString()
    breed: string;

    @IsString()
    @IsOptional()
    subBreed?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    custom?: string;

    @ApiProperty({
        type: 'string',
        format: 'binary'
    })
    file?: any;
}