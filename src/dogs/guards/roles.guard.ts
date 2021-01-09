import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        console.log(`requiredRoles are: ${requiredRoles}`);
        //console.log(context.switchToHttp().getRequest().user);
        const { user } = context.switchToHttp().getRequest();
        const userIsAllowed = requiredRoles.some((role) => user.roles?.includes(role));
        console.log(`Role Guard - user is allowed: ${userIsAllowed}`);
        return userIsAllowed;
    }
}