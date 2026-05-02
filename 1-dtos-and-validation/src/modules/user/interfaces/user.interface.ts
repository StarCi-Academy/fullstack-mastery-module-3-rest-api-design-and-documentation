/**
 * Hình dạng dữ liệu User trong tầng ứng dụng (EN: in-app User shape).
 * Bao gồm `age` để demo validation kiểu số nguyên (EN: includes `age` for integer validation demo).
 */
export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}
