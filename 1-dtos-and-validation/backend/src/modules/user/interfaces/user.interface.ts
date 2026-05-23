/**
 * Hình dạng dữ liệu User trong tầng ứng dụng (EN: in-app User shape).
 * Bao gồm `age` để demo validation kiểu số nguyên (EN: includes `age` for integer validation demo).
 * `address` optional để demo nested DTO (EN: optional `address` for nested DTO demo).
 */
export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  address?: { city: string; zip: string } | null;
}
