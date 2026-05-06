/**
 * UserModule — dang ky cac thanh phan cua feature User.
 * (EN: UserModule — registers components for User feature.)
 */
import {
    Module 
} from "@nestjs/common"
import {
    UsersController 
} from "./user.controller"
import {
    UsersService 
} from "./user.service"

/**
 * Module user â€” controller + service in-memory cho `/users` (EN: user module wiring in-memory demo for `/users`).
 */
@Module({
    controllers: [UsersController],
    providers: [UsersService],
})
export class UserModule {}
