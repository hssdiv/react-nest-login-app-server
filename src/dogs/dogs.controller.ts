import { Body, Controller, Delete, Get, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { NewDog } from './dto/newdog.dto';
import { UpdatedDog } from './dto/updateddog.dto';
import { DogService } from './dog.service';
import JwtAuthenticationGuard from '../auth/guard/jwt-authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { Request, request } from 'express';

@Controller('dogs')
@UseGuards(JwtAuthenticationGuard)
export class DogsController {
    constructor(private readonly dogService: DogService) {}

    @Get('get')
    getDogs() {
        const dogs = this.dogService.getDogs()
        return dogs
    }

    //{ dest: './public/data/uploads/' }
    @Post('save')
    @UseInterceptors(FileInterceptor('picture', {
        dest: './public'
    }))
    saveDog(@UploadedFile() file, @Body() dog: NewDog, @Req() request: Request) {
        console.log('request.user is:')
        console.log(request.user)
        console.log('dog is:')
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
