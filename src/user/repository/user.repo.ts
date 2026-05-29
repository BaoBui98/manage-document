import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  async create(userData: CreateUserDto & { role?: UserRole }): Promise<User> {
    const user = this.repo.create(userData);
    return await this.repo.save(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.repo.update(id, updateUserDto);
    return await this.repo.findOneByOrFail({ id });
  }
}
