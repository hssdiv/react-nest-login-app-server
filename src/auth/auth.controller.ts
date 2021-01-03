import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NewUser } from './dto/newuser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  login(@Query('email') email: string, @Query('password') password: string) {
    return this.authService.login(email, password);
  }

  @Post('register')
  register(@Body() newUser: NewUser) {
    return this.authService.register(newUser);
  }

  @Get()
  logout() {
    //return this.appService.getHello();
  }
}
