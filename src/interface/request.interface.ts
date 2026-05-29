import { Request } from 'express';
import { UserRole } from '../user/entities/user.entity';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    username: string;
    role: UserRole;
    email: string;
  };
}
