import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerUser(createUserDto);
  }
}
