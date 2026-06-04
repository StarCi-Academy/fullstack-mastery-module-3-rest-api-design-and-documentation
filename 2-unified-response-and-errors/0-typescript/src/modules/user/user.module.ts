/**
 * UserModule — registers components for User feature.
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
 * User module wiring in-memory demo for `/users`.
 */
@Module({
    controllers: [UsersController],
    providers: [UsersService],
})
export class UserModule {}
