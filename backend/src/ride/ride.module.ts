import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { RideGateway } from './ride.gateway';
import { DynamoService } from '../dynamo/dynamo.service';

@Module({
  providers: [RideService, RideGateway, DynamoService],
})
export class RideModule {}
