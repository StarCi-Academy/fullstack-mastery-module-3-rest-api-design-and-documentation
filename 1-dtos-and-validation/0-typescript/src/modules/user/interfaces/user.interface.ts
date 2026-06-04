/** in-app User shape.
 * includes `age` for integer validation demo.
 * optional `address` for nested DTO demo.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  address?: { city: string; zip: string } | null;
}
