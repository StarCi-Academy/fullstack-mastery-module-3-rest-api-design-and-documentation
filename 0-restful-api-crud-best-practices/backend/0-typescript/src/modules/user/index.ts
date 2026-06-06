/**
 * Barrel export for the user module.
 * avoids deep imports into individual files.
 */
export { UserModule } from "./user.module"
export { UserService } from "./user.service"
export { UserController } from "./user.controller"
export type { User } from "./interfaces"
