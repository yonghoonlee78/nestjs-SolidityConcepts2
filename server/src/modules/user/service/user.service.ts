import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByUserId(userId: string) {
    return this.userRepository.findOne(userId);
  }

  async verifyUser(userId: string, password: string) {
    const users = await this.userRepository.findAll();

    return users.find(
      (user) => user.userId === userId && user.password === password
    );
  }

  async registerUser(createUserDto: CreateUserDto) {
    return this.userRepository.create(createUserDto);
  }
}
