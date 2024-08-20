import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DynamoService {
  private dynamoDb: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.dynamoDb = new AWS.DynamoDB.DocumentClient({
      region: 'us-east-1', // Replace with your AWS region
    });
  }

  async createRide(userId: string, location: string) {
    const rideId = uuidv4();
    const params = {
      TableName: 'Rides',
      Item: {
        rideId,
        userId,
        location,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    };

    await this.dynamoDb.put(params).promise();
    return { rideId, userId, location };
  }

  async getRides() {
    const params = {
      TableName: 'Rides',
    };

    const result = await this.dynamoDb.scan(params).promise();
    return result.Items;
  }

  async updateRideStatus(rideId: string, status: string) {
    const params = {
      TableName: 'Rides',
      Key: { rideId },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status },
      ReturnValues: 'UPDATED_NEW',
    };

    const result = await this.dynamoDb.update(params).promise();
    return result.Attributes;
  }
}
