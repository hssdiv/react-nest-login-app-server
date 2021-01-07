import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NewUser } from './dto/newuser.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class  AuthService {
    constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
    ) { }

    async localValidateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where:
        { email }
        });
        if (!user) {
            console.log('no user');
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }
    
        const match = await bcrypt.compare(password, user.password);

        console.log(`password is matching: ${match}`);
        if (!match) {
            throw new HttpException('passwords don\'t match', HttpStatus.UNAUTHORIZED);
        }

        return user;
    }

    async register(newUser: NewUser) {
        const userFromDb = await this.userExists(newUser.email);
        if (userFromDb) {
            console.log('user exists in db');
            console.log(userFromDb);
            throw new HttpException('user with such email already exists', HttpStatus.BAD_REQUEST);
        }
        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        newUser.password = hashedPassword;
        const user = this.userRepository.create(newUser);
        await this.userRepository.save(user);
        return { email: user.email, success: true };
    }

    public getCookieWithJwtToken(userId: number) {
        console.log('inside authService.getCookieWithJwtToken');
        const payload: TokenPayload = { userId };
        console.log(payload);
        const token = this.jwtService.sign(payload);
        console.log(token);
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
    }

    async userExists(email: string) {
        const user = await this.userRepository.findOne({
            where:
        { email }
        });
        return user;
    }

    public getCookieForLogOut() {
        return 'Authentication=; HttpOnly; Path=/; Max-Age=0';
    }
  
    async getById(id: number) {
        const user = await this.userRepository.findOne({
            where:
        { id }
        });
        if (!user) {
            throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
        }
        return user;
    }

}
