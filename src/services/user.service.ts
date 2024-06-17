import { ForbiddenException, Injectable } from "@nestjs/common";
import { LoginModel, RegisterModel } from "src/models/user.model";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2'
import { JwtService } from "@nestjs/jwt";

@Injectable({})
export class UserService {
    constructor(private prisma: PrismaService,
        private jwtService: JwtService
    ) {

    }

    async Login(loginModel: LoginModel) {
        const user = await this.prisma.user.findUnique({ where: { Email: loginModel.Email } });
        if (!user) {
            throw new ForbiddenException('Invalid email.');
        }

        const pwMatches = await argon.verify(user.Password, loginModel.Password);
        
        // if password incorrect throw exception
        if (!pwMatches)
            throw new ForbiddenException(
                'Credentials incorrect',
            );

        delete user.Password
        return {
            token: await this.jwtService.signAsync(user)
        };
    }

    async Register(registerModel : RegisterModel){
        await this.CeckExists(registerModel);
        const _password = await argon.hash(registerModel.Password);
        const _register = this.prisma.user.create({
            data :{
                Email : registerModel.Email,
                Password: _password,
                Name : registerModel.Name,
                IsActive:true
            }
        })

        return _register

    }

    async CeckExists(registerModel : RegisterModel){
        const _register = await this.prisma.user.findFirst({
            where:{
                Email : registerModel.Email
            }
        })   
        if(_register != null){
            throw new Error("Email already exists")
        }
    }
}