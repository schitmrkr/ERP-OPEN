import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
    });
  }

  async validate(payload: any) {
    // payload.sub contains userId from token
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        role: true,
        organizationId: true,
        email: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token user');
    }

    return {
      userId: user.id,
      role: user.role,
      email: user.email,
      organizationId: user.organizationId,  // ✔ now correctly populated
    };
  }
}
