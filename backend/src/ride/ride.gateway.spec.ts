import { Test, TestingModule } from '@nestjs/testing';
import { RideGateway } from './ride.gateway';

describe('RideGateway', () => {
  let gateway: RideGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RideGateway],
    }).compile();

    gateway = module.get<RideGateway>(RideGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
