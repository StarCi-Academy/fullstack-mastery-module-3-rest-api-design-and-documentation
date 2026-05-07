/**
 * Barrel export cho module user (EN: barrel export for the user module).
 * Giúp consumer import ngắn gọn, tránh deep path tới từng file (EN: avoids deep imports into individual files).
 */
export { UserModule } from "./user.module"
export { UserService } from "./user.service"
export { UserController } from "./user.controller"
export { UserEntity } from "./user.entity"
export type { User } from "./interfaces"
export { CreateUserDto } from "./dto"
