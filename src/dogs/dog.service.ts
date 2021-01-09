import { Injectable, NotFoundException } from '@nestjs/common';
import { Dog } from './entities/dog.entity';
import { NewDog, UpdatedDog, SelectedDogs } from './dto/';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DogService {

    constructor(
    @InjectRepository(Dog)
    private readonly dogRepository: Repository<Dog>
    ) { }

    async getDogs() {
        return await this.dogRepository.find();
    }

    createDog(newDog: NewDog) {
        console.log('newDoginRep');
        console.log(newDog);
        const dog = this.dogRepository.create(newDog);
        return this.dogRepository.save(dog);
    }

    async updateDog(updatedDog: UpdatedDog) {
        const existingDog = await this.dogRepository.findOne(updatedDog.id);
        if (!existingDog) {
            throw new NotFoundException(`dog with id ${updatedDog.id} not found`);
        }
        const mergedDog = { ...existingDog, ...updatedDog };
        return this.dogRepository.save(mergedDog);
    }

    async deleteDog(id: number) {
        const dog = await this.dogRepository.findOne(id);
        if (!dog) {
            throw new NotFoundException(`dog with id ${id} not found`);
        }

        if (dog.custom) {
            const uploadPath = path.join(__dirname, '../../public/');
            const picturePathForDeletion = path.join(uploadPath, dog.imageUrl);
            console.log(`gonna delete image at: ${picturePathForDeletion}`);
            fs.unlinkSync(picturePathForDeletion);
            console.log('deleted dog image from server storage');
        }

        return this.dogRepository.remove(dog);
    }

    async deleteSelectedDogs(selectedDogs: SelectedDogs) {
        const dogs_ids = selectedDogs.dogs_ids;
        const nonExistingIds = [];
        await Promise.all(dogs_ids.map(async (id) => {
            const dog = await this.dogRepository.findOne(id);
            console.log(dog);
            if (!dog) {
                nonExistingIds.push(id);
            } else {
                if (dog.custom) {
                    this.deleteCustomDogPicture(dog.imageUrl);
                }
            }
        }));
        if (nonExistingIds.length > 0) {
            console.log(`can't find dog(s) with id: ${nonExistingIds}`);
        }
        return await this.dogRepository.delete(dogs_ids);
    }

    async deleteAllDogs() {
        const dogs = await this.dogRepository.find();

        console.log(dogs);

        dogs.map((dog) => {
            if (dog.custom) {
                this.deleteCustomDogPicture(dog.imageUrl);
            }
        });
        return await this.dogRepository.remove(dogs);
    }

    deleteCustomDogPicture(imageUrl) {
        const uploadPath = path.join(__dirname, '../../public/');
        const picturePathForDeletion = path.join(uploadPath, imageUrl);
        console.log(`gonna delete image at: ${picturePathForDeletion}`);
        try {
            fs.unlinkSync(picturePathForDeletion);
        } catch (error) {
            console.log(error.message);
        }
        console.log('deleted dog image from server storage');
    }
}
