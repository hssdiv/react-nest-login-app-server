import { IsArray } from "class-validator";

export class SelectedDogs {
    @IsArray()
    dog_ids: number[]
}
