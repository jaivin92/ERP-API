import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const Roles = Reflector.createDecorator<string[]>();
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get(Roles, context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!matchRoles(roles, user.roles)) {
            throw new UnauthorizedException('Your role does not authorize for this action');
        }
        return true;
    }
}

function matchRoles(roles: string[], roles1: any): boolean {
    //console.log(roles, roles1, roles.indexOf(UserRole.Admin))
    return roles.indexOf(UserRole.Admin) >= 0;
}
