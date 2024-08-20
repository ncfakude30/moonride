import { Injectable } from '@nestjs/common';
import { DynamoService } from '../dynamo/dynamo.service';

@Injectable()
export class RideService {
  constructor(private readonly dynamoService: DynamoService) {}

  async createRide(userId: string, location: string) {
    return this.dynamoService.createRide(userId, location);
  }

  async getRides() {
    return this.dynamoService.getRides();
  }

  async updateRideStatus(rideId: string, status: string) {
    return this.dynamoService.updateRideStatus(rideId, status);
  }
}
