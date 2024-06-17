import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';

export const AllowAnonymous = Reflector.createDecorator<boolean>();
@Injectable()
export class MyAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        //console.log('ok')
        const request = context.switchToHttp().getRequest();
        
        if (!request.headers['reqid']) {
            throw Error('Invalid Request Id');
        }

        const allowAnonymous = this.reflector.get(AllowAnonymous, context.getHandler());
        if (allowAnonymous === true) {
            return true;
        }

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('You are not authorize for this action');
        }
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_SECRET
                }
            );
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException('Token expired');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}