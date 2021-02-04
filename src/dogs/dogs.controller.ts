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
        const dogs = this.dogService.getDogs();
        return dogs;
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

    @Post('save/custom/initial')
    async saveCustomInitial(@Body() body: any, @Req() request: any) {
        console.log('creating .tmp file for custom dog');
        const folderPath = join(__dirname, `../../public/${request.user.payload.email}`);
        const fileMetadataPath = join(folderPath, body.name + '.metadata');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        fs.appendFileSync(fileMetadataPath, 'size : ' + body.size + '\n');
        fs.appendFileSync(fileMetadataPath, 'created : ' + Date.now());

        return true;
    }

    @Post('save/custom')
    async saveCustom(@Body() body: any, @Req() request: any) {
        const folderPath = join(__dirname, `../../public/${request.user.payload.email}`);
        const filePath = join(folderPath, body.name + '.tmp');
        const fileMetadataPath = join(folderPath, body.name + '.metadata');

        console.log('got chunk!');
        fs.appendFileSync(filePath, body.chunk);

        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const metadataString = fs.readFileSync(fileMetadataPath, 'utf8');
        const metadataSize = metadataString.split('\n')[0].split('size : ').pop();
        const fullSize = parseInt(metadataSize);

        const percent = Math.trunc((fileSizeInBytes / fullSize) * 100);
        console.log(`progress is ${percent}%`);

        return percent;
    }

    @Post('save/custom/final')
    async saveCustomFinal(@Body() body: any, @Req() request: any) {
        const folderPath = join(__dirname, `../../public/${request.user.payload.email}`);
        const filePath = join(folderPath, body.name + '.tmp');
        const fileMetadataPath = join(folderPath, body.name + '.metadata');

        const base64 = fs.readFileSync(filePath, 'utf8');
        const base64Image = base64.split(';base64,').pop();

        fs.writeFile(join(folderPath, body.name), base64Image, { encoding: 'base64' }, function (err) {
            console.log('custom dog file created, cleaning up .tmp files...');
        });

        fs.unlinkSync(filePath);
        fs.unlinkSync(fileMetadataPath);


        const dogToAdd: NewDog = {
            breed: body.breed,
            subBreed: body.subBreed,
            custom: true,
            imageUrl: `/${request.user.payload.email}/${body.name}`,
        };

        await this.dogService.createDog(dogToAdd);
        return dogToAdd;
    }

    @Post('save/custom/cleanup')
    async saveCustomCleanUp(@Body() body: any) {
        await this.dogService.clearTempFiles(body.name);
        // const folderPath = join(__dirname, `../../public/${request.user.payload.email}`);
        // const filePath = join(folderPath, body.name + '.tmp');
        // const fileMetadataPath = join(folderPath, body.name + '.metadata');
        // fs.unlinkSync(filePath);
        // fs.unlinkSync(fileMetadataPath);
        return true;
    }

    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    //@Roles(Role.Admin)
    @Patch('update')
    updateOne(@Body() dog: UpdatedDog) {
        return this.dogService.updateDog(dog);
    }

    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    //@Roles(Role.Admin)
    @Delete('delete')
    deleteOne(@Query('id') id: number) {
        console.log(id);
        return this.dogService.deleteDog(id);
    }

    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    //@Roles(Role.Admin)
    @Delete('delete/selected')
    deleteSelected(@Body() selectedDogs: SelectedDogs) {
        return this.dogService.deleteSelectedDogs(selectedDogs);
    }

    @UseGuards(JwtAuthenticationGuard, RolesGuard)
    //@Roles(Role.Admin)
    @Delete('delete/all')
    deleteAll() {
        return this.dogService.deleteAllDogs();
    }


}
