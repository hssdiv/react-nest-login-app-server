import { IsString } from "class-validator";

export class NewTokenBlacklist {
    @IsString()
    token: string;

    expires: number;
}