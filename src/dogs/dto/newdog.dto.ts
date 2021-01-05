import { IsBoolean, IsOptional, IsString } from "class-validator";

export class NewDog {
    @IsString()
    breed: string;

    @IsString()
    subBreed?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsBoolean()
    @IsOptional()
    custom?: boolean;
}