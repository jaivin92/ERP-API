import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginModel {
    @IsEmail()
    Email: string;

    @MinLength(6)
    @IsNotEmpty()
    Password: string;
}

export class RegisterModel {
    @IsEmail()
    Email: string;

    @MinLength(6)
    @IsNotEmpty()
    Password: string;

    @IsNotEmpty()
    Name:string;

    IsActive: boolean;
}