import { Body, Controller, Post, HttpCode, HttpStatus, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const token = await this.authService.login(dto);
      return {
        message: 'Login successful',
        token,
      };
    } catch (error: any) {
      let fieldErrors: Record<string, string> = {};

      if (error?.response?.message?.includes('email')) {
        fieldErrors.email = 'Invalid email address';
      } else if (error?.response?.message?.includes('password')) {
        fieldErrors.password = 'Incorrect password';
      } else {
        fieldErrors.general = error.message || 'Login failed';
      }

      throw new BadRequestException({ errors: fieldErrors });
    }
  }
}
