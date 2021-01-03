import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { UploadedFile } from '@nestjs/common/decorators/http/route-params.decorator';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { NewDog } from './dto/newdog.dto';
import { UpdatedDog } from './dto/updateddog.dto';
import { DogService } from './dog.service';

@Controller('dogs')
export class DogsController {
    constructor(private readonly dogService: DogService) {}

    @Get('get')
    getDogs() {
        const dogs = this.dogService.getDogs()
        return dogs
    }

    @Post('save')
    @UseInterceptors(FileInterceptor('picture'))
    saveDog(@UploadedFile() file, @Body() dog: NewDog) {
        console.log(dog)
        if (file) {
            //TODO upload locally and add path to dog.imageUrl
            console.log(file);
        }
        this.dogService.createDog(dog)
        return dog;
    }

    @Patch('update')
    updateDog(@Body() dog: UpdatedDog) {
        return this.dogService.updateDog(dog)
    }

    @Delete('delete')
    deleteDog(@Query('id') id: number) {
        console.log(id)
        return this.dogService.deleteDog(id)
    }

    @Delete('delete/selected')
    deleteSelectedDogs(@Body('dog_ids') dog_ids: number[]) {
        this.dogService.deleteSelectedDogs(dog_ids);
    }

    @Delete('delete/all')
    deleteDogs() {
        this.dogService.deleteAllDogs()
    }
}
