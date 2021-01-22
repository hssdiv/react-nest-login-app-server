import { IsString } from 'class-validator';

export class NewUser {
    //@IsNotEmpty()  @IsEmail()
    @IsString()
    email: string;

    //@IsNotEmpty()
    @IsString()
    password: string;
}