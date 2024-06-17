import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { LoginModel,  RegisterModel } from "src/models/user.model";
import { UserService } from "src/services/user.service";
import * as argon from 'argon2'
import { AllowAnonymous } from "src/guards/auth.guard";
import { Roles, RolesGuard } from "src/guards/role.guard";
import { BaseController } from "./base.controller";

//@UseGuards(AuthGuard)
@Controller('user')
export class UserController extends BaseController {
    constructor(private userService: UserService) {
        super()
    }

    @AllowAnonymous(true)
    @Get('generatepass/:pass')
    async GeneratePassword(@Req() req: Request) {
        return this.Success(await argon.hash(req.params.pass));
    }

    @AllowAnonymous(true)
    @Post('login')
    async Login(@Body() loginModel: LoginModel) {
        const user = await this.userService.Login(loginModel);
        return this.Success(user);
    }

    @AllowAnonymous(true)
    @Post('register')
    async Register(@Body() registermodel: RegisterModel) {
        const user = await this.userService.Register(registermodel);
        return this.Success(user);
    }

    @UseGuards(RolesGuard)
    @Roles([UserRole.Admin])
    @Post('checkauth')
    async CheckAuth(@Body() loginModel: LoginModel, @Req() req: Request) {
        //console.log(loginModel, req.body);
        //return true;
        return this.Success(true);
    }
}