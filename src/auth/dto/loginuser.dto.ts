import { IsString } from "class-validator";

export class LoginUser {
    //TODO @IsNotEmpty()  @IsEmail()
    @IsString()
    email: string;

    //@IsNotEmpty()
    @IsString()
    password: string;
}