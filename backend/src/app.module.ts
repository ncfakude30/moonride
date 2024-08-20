import { Module } from '@nestjs/common';
import { RideModule } from './ride/ride.module';
import { DynamoService } from './dynamo/dynamo.service';

@Module({
  imports: [RideModule],
  controllers: [],
  providers: [DynamoService],
})
export class AppModule {}
