import { IsString } from "class-validator";

export class NewUser {
    @IsString()
    email: string;

    @IsString()
    password: string;
}