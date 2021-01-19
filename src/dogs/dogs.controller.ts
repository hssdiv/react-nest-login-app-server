import { Body, Controller, Delete, Get, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DogService } from './dog.service';
import { NewDog, NewDogForm, NewDogFormFull, UpdatedDog } from './dto/';
import JwtAuthenticationGuard from '../auth/guard/jwt-authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import RequestWithUser from 'src/auth/requestWithUser.interface';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SelectedDogs } from './dto/selecteddogs.dto';
import { Role, Roles, RolesGuard } from './guards';

// fs to service
//UPDATE users SET roles = array_append(roles, 'premium_user') WHERE user_id=14;
//array_remove(ARRAY[1,2,3,2], 2)

@ApiTags('dogs')
@ApiCookieAuth()
@Controller('dogs')
@UseGuards(JwtAuthenticationGuard)
export class DogsController {
    constructor(private readonly dogService: DogService) { }

    @Get('get')
    @Roles(Role.User)
    getDogs() {
        //console.log(request.user.signature);
        // todo ?  this.dogService.check() request.user.signature
        const dogs = this.dogService.getDogs();
        return dogs;
    }

    // @Get('test')
    // @UseGuards(JwtAuthenticationGuard, RolesGuard)
    // @Roles(Role.Admin)
    // test(@Req() request: RequestWithUser) {
    //     console.log(request.user);
    //     return 'test';
    // }

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

    // @Get('save2')
    // @Roles(Role.User)
    // saveDog2(@Body() metadata: any) {
    //     //console.log(request.user.signature);
    //     // todo ?  this.dogService.check() request.user.signature
    //     const name = metadata.name;
    //     console.log(`savedog2: ${name}, ${metadata.size}`);
    //     return metadata.size;
    //     // const dogs = this.dogService.getDogs();
    //     // return dogs;
    // }

    @Post('save3')
    async saveDog3(@Body() body: any, @Req() request: any) {
        //console.log(request.user.signature);
        // todo ?  this.dogService.check() request.user.signature
        //console.log(request.user);
        console.log(body.name);
        //const body = request.body;
        //const folderPath = join(__dirname, '../../public/test');
        const folderPath = join(__dirname, `../../public/${request.user.payload.email}`);
        const filePath = join(folderPath, body.name);
        //console.log(folderPath);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        if (!body.final) {
            // console.log('body.chunk:');
            // console.log(body);
            
            //const fstream = fs.createWriteStream(filePath);
            //fstream.write(body.chunk);
            //fstream.end();

            fs.appendFileSync(filePath, body.chunk);

            console.log('got chunk');
            return true;
            // const dogs = this.dogService.getDogs();
            // return dogs;
        } else {
            const base64 = fs.readFileSync(filePath,'utf8');
            console.log(base64.substring(0,50));
            const base64Image = base64.split(';base64,').pop();
            console.log(base64Image.substring(0,50));
            fs.writeFile(join(folderPath,'image.jpg'), base64Image, {encoding: 'base64'}, function(err) {
                console.log('File created');
            });





        }

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
