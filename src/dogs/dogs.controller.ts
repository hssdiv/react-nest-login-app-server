import { Body, Controller, Delete, Get, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DogService } from './dog.service';
import { NewDog, NewDogForm, NewDogFormFull, UpdatedDog } from './dto/';
import JwtAuthenticationGuard from '../auth/guard/jwt-authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import RequestWithUser from 'src/auth/requestWithUser.interface';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SelectedDogs } from './dto/selecteddogs.dto';
import { Role, Roles, RolesGuard } from './guards';

//TODO delete custom dogs pictures from /public/
//TODO move all fs\custom image upload to service?
//UPDATE users SET roles = array_append(roles, 'admin') WHERE user_id=14;
//array_remove(ARRAY[1,2,3,2], 2)

@ApiTags('dogs')
@ApiCookieAuth()
@Controller('dogs')
@UseGuards(JwtAuthenticationGuard)
export class DogsController {
    constructor(private readonly dogService: DogService) { }

    @Get('get')
    getDogs() {
        const dogs = this.dogService.getDogs();
        return dogs;
    }

    @Get('test')
    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    test(@Req() request: RequestWithUser) {
        console.log(request.user);
        return 'vau';
    }

    @Post('save')
    @UseInterceptors(FileInterceptor('picture', {
        storage: diskStorage({
            destination: function (req: RequestWithUser, file, cb) {
                const path = `./public/${req.user.email}`;
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path);
                }
                cb(null, `./public/${req.user.email}`);
            },
            filename: (req, file, cb) => {
                console.log('vau');
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        })
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '',
        type: NewDogFormFull,
    })
    saveDog(@UploadedFile() file, @Body() dog: NewDogForm, @Req() request: RequestWithUser) {
        console.log('new dog is:');
        console.log(dog);

        if (file) {
            console.log(file);

            if (dog.custom) {
                dog.imageUrl = `${request.user.email}/${file.filename}`;
            }
        } else {
            dog.custom = 'false';
            console.log('no file');
        }

        const dogToAdd: NewDog = {
            breed: dog.breed,
            subBreed: dog.subBreed,
            custom: JSON.parse(dog.custom),
            imageUrl: dog.imageUrl,
        };

        this.dogService.createDog(dogToAdd);
        return dogToAdd;
    }

    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    @Patch('update')
    updateDog(@Body() dog: UpdatedDog) {
        return this.dogService.updateDog(dog);
    }

    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete('delete')
    deleteDog(@Query('id') id: number) {
        console.log(id);
        return this.dogService.deleteDog(id);
    }

    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete('delete/selected')
    deleteSelectedDogs(@Body() selectedDogs: SelectedDogs) {
        return this.dogService.deleteSelectedDogs(selectedDogs);
    }

    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete('delete/all')
    deleteDogs() {
        return this.dogService.deleteAllDogs();
    }
}
