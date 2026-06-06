/**
 * In-application User shape returned by the API and mapped from UserEntity.
 *
 * This interface is the single source of truth for the JSON shape returned to clients.
 * It intentionally excludes internal fields (e.g. hashed passwords) that must not leave the server.
 */
export interface User {
  /** Application-assigned short unique identifier (e.g. "wl03f8"). */
  id: string;
  /** Display name of the user — validated to be at least 3 characters. */
  name: string;
  /** Email address — validated to be in a correct email format. */
  email: string;
  /** Age in years — validated integer in [18, 100]. Demonstrates numeric coercion. */
  age: number;
  /**
   * Optional postal address — included when the client supplied one, null otherwise.
   * Demonstrates nested DTO validation with @ValidateNested + @Type.
   */
  address?: { city: string; zip: string } | null;
}
