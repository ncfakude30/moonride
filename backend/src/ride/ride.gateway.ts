import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RideGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('rideRequest')
  handleRideRequest(@MessageBody() data: { userId: string; location: string }) {
    console.log(`Ride request received from user ${data.userId}`);
    // Broadcast to all drivers
    this.server.emit('newRide', data);
  }

  @SubscribeMessage('locationUpdate')
  handleLocationUpdate(
    @MessageBody() data: { driverId: string; location: string },
  ) {
    console.log(`Location update received from driver ${data.driverId}`);
    // Broadcast to the specific user waiting for this driver
    this.server.emit('locationUpdate', data);
  }
}
