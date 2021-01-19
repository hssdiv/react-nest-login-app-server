import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Req, Res } from '@nestjs/common/decorators/http/route-params.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUser } from './dto/loginuser.dto';
import { NewTokenBlacklist } from './dto/newtokenblacklist.dto';
import { NewUser } from './dto/newuser.dto';
import JwtAuthenticationGuard from './guard/jwt-authentication.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import RequestWithUser from './requestWithUser.interface';

@ApiTags('auth')
//@ApiSecurity('basic')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(200)
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({
        description: 'user email and password',
        required: true,
        type: LoginUser,
    })
    login(@Req() request: RequestWithUser, @Res() response: Response) {
        console.log('inside controller login endpoint:');
        const user = request.user;
        console.log(user);
        const cookie = this.authService.getCookieWithJwtToken(user.id, user.roles, user.email);
        response.setHeader('Set-Cookie', cookie);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return response.send(userWithoutPassword);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    @Post('register')
    register(@Body() newUser: NewUser) {
        console.log('calling authService.register');
        return this.authService.register(newUser);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get('logout')
    async logout(@Req() request: any, @Res() response: Response) {
        console.log('inside logout');

        const exp = request.user.payload.exp;
        const signature = request.user.signature;

        const newToken: NewTokenBlacklist = { token: signature, expires: exp };
        await this.authService.addTokenToBlacklist(newToken);

        console.log('added token to blacklist');
        response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
        return response.sendStatus(200);
    }
}
