import { IsString } from "class-validator";

export class UserWitoutPassword {
    @IsString()
    email: string;
}