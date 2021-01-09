import { IsArray } from "class-validator";

export class SelectedDogs {
    @IsArray()
    dogs_ids: number[]
}
