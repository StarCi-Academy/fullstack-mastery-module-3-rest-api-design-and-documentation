/**
 * UserModule — NestJS feature module for the User resource.
 *
 * Registers the TypeORM repository for UserEntity (so @InjectRepository can be resolved),
 * the controller that handles HTTP routing, and the service with business logic.
 * The module is imported by AppModule; nothing here is exported because no other module
 * needs to consume UserService or UserController directly.
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
} from "../../entities"
import {
    UserService
} from "./user.service"

/**
 * Feature module for the /users endpoint.
 * TypeOrmModule.forFeature registers the UserEntity repository scoped to this module.
 */
@Module({
    // forFeature makes the UserEntity repository injectable within this module only.
    imports: [TypeOrmModule.forFeature([UserEntity])],
    // Controller handles HTTP routing; NestJS maps @Get/@Post decorators to routes.
    controllers: [UserController],
    // UserService is provided via DI and injected into UserController.
    providers: [UserService],
})
export class UserModule {}
