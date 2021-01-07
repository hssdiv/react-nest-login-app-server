import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Req, Res } from '@nestjs/common/decorators/http/route-params.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUser } from './dto/loginuser.dto';
import { NewUser } from './dto/newuser.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import RequestWithUser from './requestWithUser.interface';

@ApiTags('auth')
@ApiSecurity('basic')
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
        const cookie = this.authService.getCookieWithJwtToken(user.id);
        response.setHeader('Set-Cookie', cookie);
        const { password, ...userWithoutPassword } = user;
        return response.send(userWithoutPassword);
    }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  authenticate(@Req() request: RequestWithUser) {
      //TODO ??? its '/auth'
      const user = request.user;
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
  }

  @Post('register')
  register(@Body() newUser: NewUser) {
      console.log('calling authService.register');
      return this.authService.register(newUser);
  }

  @Get('logout')
  logout(@Res() response: Response) {
      response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
      return response.sendStatus(200);
  }
}
