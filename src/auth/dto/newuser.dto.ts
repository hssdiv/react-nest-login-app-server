import { IsString } from "class-validator";

export class NewUser {
    //TODO @IsNotEmpty()  @IsEmail()
    @IsString()
    email: string;

    //@IsNotEmpty()
    @IsString()
    password: string;
}