export interface LoginDto {
    email: string;
    password: string;
  }
  
export interface LoginResponse {
    token: string;
    message: string;
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}
  