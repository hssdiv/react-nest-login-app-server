import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import * as fs from 'fs';
import * as path from 'path';

const publicPath = path.join(__dirname, '../../../jwtRS256.key.pub');
const publicKey = fs.readFileSync(publicPath, 'utf8');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                console.log('recieved cookie');
                //console.log(request?.cookies);
                return request?.cookies?.Authentication;
            }]),
            // secretOrKey: configService.get('JWT_SECRET'),
            jsonWebTokenOptions: { complete: true },
            //TODO
            secretOrKey: publicKey,
            //secretOrKey: configService.get('JWT_PUBLIC_KEY'),
            algorithms: ['RS256'],
        });
    }

    async validate(payloadComplete: TokenPayloadComplete) {
        console.log('inside jwt strategy - validate method');
        const inBlacklist = await this.authService.checkTokenIsNotInBlacklist(payloadComplete.signature);
        if (inBlacklist) {
            return null;
        }
        //console.log(payload.signature);
        return payloadComplete;
    }
}
