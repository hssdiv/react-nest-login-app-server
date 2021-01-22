import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entity/user.entity';
import { LocalStrategy } from './strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { TokenBlacklist } from './entity/tokenblacklist.entity';
import { ScheduleModule } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

const privatePath = path.join(__dirname, '../../jwtRS256.key');
const publicPath = path.join(__dirname, '../../jwtRS256.key.pub');
const privateKey = fs.readFileSync(privatePath, 'utf8');
const publicKey = fs.readFileSync(publicPath, 'utf8');

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([User, TokenBlacklist]),
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                //secret: configService.get('JWT_SECRET'),
                privateKey: privateKey,
                publicKey: publicKey,
                signOptions: {
                    expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
                    algorithm: 'RS256',
                },
                /*
                verifyOptions: {
				    algorithms: ['HS256', 'RS256'],
			    },
                */
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule { }
