import { IsString } from 'class-validator';

export class LoginUser {
    @IsString()
    email: string;

    @IsString()
    password: string;
}