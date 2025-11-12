export interface LoginDto {
    email: string;
    password: string;
  }
  
export interface LoginResponse {
    token: {
        accessToken: string;
        user: any;
    };
    message: string;
}
  