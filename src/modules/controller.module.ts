import { Module } from "@nestjs/common";
import { UserController } from "src/controller/user.controller";
import { UserService } from "src/services/user.service";

@Module({
    imports: [],
    providers: [
        UserService,
    ],
    controllers: [
        UserController,
    ],
})
export class ControllerModule {

}