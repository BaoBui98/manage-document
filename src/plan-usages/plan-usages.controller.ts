import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanUsagesService } from './plan-usages.service';
import { CreatePlanUsageDto } from './dto/create-plan-usage.dto';
import { UpdatePlanUsageDto } from './dto/update-plan-usage.dto';

@Controller('plan-usages')
export class PlanUsagesController {
  constructor(private readonly planUsagesService: PlanUsagesService) {}

  @Post()
  create(@Body() createPlanUsageDto: CreatePlanUsageDto) {
    return this.planUsagesService.create(createPlanUsageDto);
  }

  @Get()
  findAll() {
    return this.planUsagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planUsagesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanUsageDto: UpdatePlanUsageDto) {
    return this.planUsagesService.update(id, updatePlanUsageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planUsagesService.remove(id);
  }
}
