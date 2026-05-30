import { PartialType } from '@nestjs/swagger';
import { CreatePlanUsageDto } from './create-plan-usage.dto';

export class UpdatePlanUsageDto extends PartialType(CreatePlanUsageDto) {}
