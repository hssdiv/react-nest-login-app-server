import { Injectable, NotFoundException } from '@nestjs/common';
import { Dog } from './entities/dog.entity';
import { NewDog, UpdatedDog } from './dto/';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
    const dog = this.dogRepository.create(newDog);
    return this.dogRepository.save(dog);
  }

  async updateDog(updatedDog: UpdatedDog) {
    const existingDog = await this.dogRepository.findOne(updatedDog.id)
    if (!existingDog) {
      throw new NotFoundException(`dog with id ${updatedDog.id} not found`);
    }
    const mergedDog = { ...existingDog, ...updatedDog };
    return this.dogRepository.save(mergedDog);
  }

  async deleteDog(id: number) {
    const dog = await this.dogRepository.findOne(id)
    if (!dog) {
      throw new NotFoundException(`dog with id ${id} not found`);
    }
    return this.dogRepository.remove(dog);
  }

  async deleteSelectedDogs(dog_ids: number[]) {
    const nonExistingIds = [];
    await Promise.all(dog_ids.map(async (id) => {
      const dog = await this.dogRepository.findOne(id)
      console.log(dog)
      if (!dog) {
        nonExistingIds.push(id)
      }
    }))
    if (nonExistingIds.length > 0) {
      console.log(`can't find dog(s) with id: ${nonExistingIds}`)
    }
    return await this.dogRepository.delete(dog_ids);
  }

  async deleteAllDogs() {
    const dogs = await this.dogRepository.find();
    return await this.dogRepository.remove(dogs);
  }
}
