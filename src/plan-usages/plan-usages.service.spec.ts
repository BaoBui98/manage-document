import { Test, TestingModule } from '@nestjs/testing';
import { PlanUsagesService } from './plan-usages.service';

describe('PlanUsagesService', () => {
  let service: PlanUsagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanUsagesService],
    }).compile();

    service = module.get<PlanUsagesService>(PlanUsagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
