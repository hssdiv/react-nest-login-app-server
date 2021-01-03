import { IsNumber, IsString } from "class-validator";

export class UpdatedDog {
    @IsNumber()
    id: number;

    @IsString()
    breed?: string;

    @IsString()
    subBreed?: string;
}