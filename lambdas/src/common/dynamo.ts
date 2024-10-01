import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();

export const getDynamoDBClient = () => dynamodb;
