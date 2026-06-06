/** In-app User shape used by the REST controller and service layer.
 * Intentionally minimal — only the fields exposed over the API.
 * Keeps the persistence entity (UserEntity) decoupled from the HTTP contract.
 */
export interface User {
    /** Application-assigned primary key (5-char alphanumeric short ID). */
    id: string;
    /** Display name of the user. */
    name: string;
    /** Email address of the user. */
    email: string;
}
