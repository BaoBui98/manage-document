import { Test, TestingModule } from '@nestjs/testing';
import { PlanUsagesController } from './plan-usages.controller';
import { PlanUsagesService } from './plan-usages.service';

describe('PlanUsagesController', () => {
  let controller: PlanUsagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanUsagesController],
      providers: [PlanUsagesService],
    }).compile();

    controller = module.get<PlanUsagesController>(PlanUsagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
