/**
 * Hình dạng dữ liệu User trong tầng ứng dụng (EN: in-app User shape).
 * Giữ tối thiểu field để demo REST contract, không gắn persistence (EN: minimal fields for REST demo; no persistence layer).
 */
export interface User {
  id: string;
  name: string;
  email: string;
}
