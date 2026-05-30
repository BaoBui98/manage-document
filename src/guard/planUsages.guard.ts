import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadGatewayException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_USAGES_KEY } from '../decorator/usages.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUsage } from '../plan-usages/entities/plan-usage.entity';
import { RequestWithUser } from '../interface/request.interface';

@Injectable()
export class PlanUsagesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(PlanUsage)
        private readonly planUsageRepo: Repository<PlanUsage>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isUsagesRequired = this.reflector.getAllAndOverride<boolean>(IS_USAGES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Nếu API không dùng @Usages() thì cho qua
        if (!isUsagesRequired) {
            return true;
        }

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user;

        // Guard này chạy sau AuthGuard nên user chắc chắn đã có, nhưng cứ check cho an toàn
        if (!user || !user.sub) {
            throw new ForbiddenException('Bạn chưa đăng nhập hoặc token không hợp lệ.');
        }

        const userId = user.sub;

        // Kiểm tra trong database xem user đã có gói planUsage chưa
        const planUsage = await this.planUsageRepo.findOne({ where: { userId } });

        if (!planUsage) {
            throw new BadGatewayException('Bạn chưa có gói dịch vụ nào. Vui lòng đăng ký gói để tiếp tục.');
        }

        // Kiểm tra xem đã vượt quá số lượng cho phép chưa
        if (planUsage.usedDocument >= planUsage.maxDocument) {
            throw new BadGatewayException(`Hiện bạn đã có ${planUsage.usedDocument} tài liệu, không thể tạo vượt quá ${planUsage.maxDocument} cho phép`);
        }

        return true;
    }
}
