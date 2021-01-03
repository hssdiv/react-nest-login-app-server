import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}

/*imports: [PassportModule.register({      
            defaultStrategy: 'jwt',      
            property: 'user',      
            session: false,    
        }),]*/

        /*providers: [AuthService, JwtStrategy],  
    exports: [PassportModule],*/


    //controller or route: @UseGuards(AuthGuards())

    /*for local strategy
    
    super({
    usernameField: 'email',
    passwordField: 'password',
  });*/


    /*HINT
We can pass an options object in the call to super() 
to customize the behavior of the passport strategy. 
In this example, the passport-local strategy by default 
expects properties called username and password in the request body.
 Pass an options object to specify different property names, for example: 
 super({ usernameField: 'email' }). See the Passport documentation for more information.*/