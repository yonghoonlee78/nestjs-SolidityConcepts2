import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/service/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService
  ) {}

  async validateUser(userId: string, password: string) {
    const user = await this.usersService.findByUserId(userId);
    if (!user || user.password !== password) {
      throw new UnauthorizedException('등록되지 않은 유저입니다.');
    }
    return user;
  }

  async login(user: any) {
    const payload = { userId: user.userId, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
