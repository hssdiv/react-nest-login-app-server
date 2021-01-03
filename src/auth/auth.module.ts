import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule],
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
