import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NewUser } from './dto/newuser.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async login(email: string, password: string) {
    //const user = await this.userRepository.findOne(email)
    const user = await this.userRepository.findOne({
      where:
        { email }
    })
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const match = await bcrypt.compare(password, user.password);

    console.log(match)
    if (!match) {
      throw new HttpException('passwords don\'t match', HttpStatus.UNAUTHORIZED)
    }

    return { success: true };
  }

  async validateUser(email: string, password: string): Promise<User> {
    //const user = await this.userRepository.findOne(email)
    const user = await this.userRepository.findOne({
      where:
        { email }
    })
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }
    
    const match = await bcrypt.compare(password, user.password);

    console.log(match)
    if (!match) {
      throw new HttpException('passwords don\'t match', HttpStatus.UNAUTHORIZED)
    }

    return user;
  }

  async register(newUser: NewUser) {
    if (await this.userExists(newUser.email)) {
      console.log('exists')
      throw new HttpException('user with such email already exists', HttpStatus.BAD_REQUEST)
    }
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword;
    const user = this.userRepository.create(newUser);
    await this.userRepository.save(user);
    return { email: user.email, success: true }
  }

  async logout() {
    // TODO
    return true
  }

  async userExists(email) {
    const user = await this.userRepository.findOne({
      where:
        { email }
    })
    console.log(user)
    return user;
  }
}
