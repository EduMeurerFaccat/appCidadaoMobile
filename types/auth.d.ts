export interface User {
  id: number;
  nome: string;
  email: string;
  phone?: string;
  token?: string; // Opcional, caso você queira armazenar o token JWT
}
