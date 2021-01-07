import { IsOptional, IsString } from 'class-validator';

export class NewDogForm {
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
}