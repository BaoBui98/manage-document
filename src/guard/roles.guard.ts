import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Nếu không gắn @Roles() thì cho phép qua luôn (ai đăng nhập rồi cũng được)
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      // Đề phòng trường hợp RolesGuard chạy trước AuthGuard, nhưng thường AuthGuard sẽ chạy trước
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    // Kiểm tra xem role của user có nằm trong danh sách requiredRoles không
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }
    
    return true;
  }
}
