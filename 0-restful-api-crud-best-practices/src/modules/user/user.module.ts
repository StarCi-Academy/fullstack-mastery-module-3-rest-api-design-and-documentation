/**
 * UserModule — dang ky cac thanh phan cua feature User.
 * (EN: UserModule — registers components for User feature.)
 */
import {
    Module 
} from "@nestjs/common"
import {
    TypeOrmModule 
} from "@nestjs/typeorm"
import {
    UserController 
} from "./user.controller"
import {
    UserEntity 
} from "./user.entity"
import {
    UserService 
} from "./user.service"

/**
 * Module user â€” Ä‘Äƒng kÃ½ TypeORM feature + controller + service cho resource `/users` (EN: registers TypeORM feature, controller, and service for `/users`).
 */
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
