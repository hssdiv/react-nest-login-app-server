import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NewUser } from './dto/newuser.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { TokenBlacklist } from './entity/tokenblacklist.entity';
import { NewTokenBlacklist } from './dto/newtokenblacklist.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService implements OnModuleInit {
    tokenblacklist: TokenBlacklist[];

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(TokenBlacklist)
        private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    async onModuleInit() {
        console.log('auth module init');
        this.tokenblacklist = await this.tokenBlacklistRepository.find();
    }

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

    public getCookieWithJwtToken(userId: number, roles: string[], email: string) {
        console.log('inside authService.getCookieWithJwtToken');
        //TODO roles
        const payload: TokenPayload = {
            userId,
            email,
            roles,
        };
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

    async addTokenToBlacklist(token: NewTokenBlacklist) {
        this.tokenblacklist.push(token);
        const tokenDb = this.tokenBlacklistRepository.create(token);
        return await this.tokenBlacklistRepository.save(tokenDb);
    }

    async checkTokenIsNotInBlacklist(token: string) {
        //console.log('inside checkTokenIsNotInBlacklist');

        let tokenIsInBlacklist = null;
        this.tokenblacklist.forEach(tokenDb => {
            if (tokenDb.token === token) {
                tokenIsInBlacklist = tokenDb.token;
            }
        });

        // const tokenIsInBlacklist = await this.tokenBlacklistRepository.findOne({
        //     where:
        //         { token }
        // });

        if (tokenIsInBlacklist) {
            console.log('token is in black list');
            console.log(tokenIsInBlacklist);
        } else {
            console.log('token is not in black list');
        }

        return tokenIsInBlacklist;
    }

    //@Cron(CronExpression.EVERY_10_SECONDS)
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async clearBlacklist() {
        const now = Date.now();
        console.log(`now is ${now}`);

        this.tokenblacklist.forEach(async (tokenDb) => {
            console.log(`token expires at ${tokenDb.expires * 1000}`);
            if (now > tokenDb.expires * 1000) {
                console.log('token expired!');
                const index = this.tokenblacklist.indexOf(tokenDb);
                this.tokenblacklist.splice(index, 1);
                await this.tokenBlacklistRepository.remove(tokenDb);
            }
        });
        //this.tokenblacklist = await this.tokenBlacklistRepository.find();
    }
}
