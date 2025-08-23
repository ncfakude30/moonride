import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import tw from 'tailwind-styled-components';
import Map from './Map';
import Image from 'next/image';
import { useWebSocket } from '../../contexts/WebSocketContext';

const DriverTracking = ({ tripId, driverId, driverInfo, currentState, estimatedArrival, onCancel }) => {
    const dispatch = useDispatch();
    const { sendMessage, status } = useWebSocket();
    const user = useSelector((state) => state.auth.user);
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [driverLocation, setDriverLocation] = useState(null);

    useEffect(() => {
        if (status === 'connected' && driverId) {
            // Request driver location updates
            sendMessage({
                type: 'track_driver',
                tripId,
                driverId
            });
        }
    }, [status, driverId, tripId, sendMessage]);

    const handleSendMessage = () => {
        if (newMessage.trim() && sendMessage) {
            sendMessage({
                type: 'chat_message',
                text: newMessage,
                recipientId: driverId,
                tripId
            });
            setMessages(prev => [...prev, {
                text: newMessage,
                isUser: true,
                timestamp: new Date()
            }]);
            setNewMessage('');
        }
    };

    const getStatusMessage = () => {
        switch (currentState) {
            case 'driver_assigned':
                return 'Driver assigned to your trip';
            case 'driver_en_route':
                return `Driver is on the way • ${estimatedArrival || 'Calculating'} min`;
            case 'driver_arrived':
                return 'Driver has arrived at pickup location';
            case 'trip_started':
                return 'Trip in progress';
            default:
                return 'Connecting...';
        }
    };

    const getStatusColor = () => {
        switch (currentState) {
            case 'driver_assigned':
                return 'bg-blue-500';
            case 'driver_en_route':
                return 'bg-yellow-500';
            case 'driver_arrived':
                return 'bg-green-500';
            case 'trip_started':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <TrackingContainer>
            <MapWrapper>
                <Map 
                    pickupCoordinates={driverLocation ? [driverLocation.lat, driverLocation.lng] : null}
                    dropoffCoordinates={null}
                    showRoute={false}
                />
                <StatusOverlay>
                    <StatusBadge className={getStatusColor()}>
                        {getStatusMessage()}
                    </StatusBadge>
                </StatusOverlay>
            </MapWrapper>

            <InfoPanel>
                {driverInfo && (
                    <DriverCard>
                        <DriverImage
                            src={driverInfo.profilePicture || 'https://moonride-media.s3.amazonaws.com/default.png'}
                            alt="Driver"
                            width={60}
                            height={60}
                        />
                        <DriverDetails>
                            <DriverName>{driverInfo.name || 'Driver'}</DriverName>
                            <CarInfo>{driverInfo.carModel || 'Vehicle'} • {driverInfo.licensePlate || 'ABC123'}</CarInfo>
                            <Rating>⭐ {driverInfo.rating || '4.8'}</Rating>
                        </DriverDetails>
                        <ContactActions>
                            <ContactButton>📞</ContactButton>
                            <ContactButton>💬</ContactButton>
                        </ContactActions>
                    </DriverCard>
                )}

                <ChatSection>
                    <ChatHeader>Chat with Driver</ChatHeader>
                    <MessageList>
                        {messages.map((msg, index) => (
                            <MessageBubble key={index} $isUser={msg.isUser}>
                                {msg.text}
                            </MessageBubble>
                        ))}
                    </MessageList>
                    <ChatInputContainer>
                        <ChatInput
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <SendButton onClick={handleSendMessage}>Send</SendButton>
                    </ChatInputContainer>
                </ChatSection>

                <ActionButtons>
                    <CancelButton onClick={onCancel}>
                        Cancel Ride
                    </CancelButton>
                </ActionButtons>
            </InfoPanel>
        </TrackingContainer>
    );
};

export default DriverTracking;

const TrackingContainer = tw.div`
    min-h-screen bg-gray-100 flex flex-col
`;

const MapWrapper = tw.div`
    relative flex-1 min-h-[60vh]
`;

const StatusOverlay = tw.div`
    absolute top-4 left-4 right-4 z-10
`;

const StatusBadge = tw.div`
    text-white px-4 py-2 rounded-full text-center font-semibold shadow-lg
`;

const InfoPanel = tw.div`
    bg-white rounded-t-3xl shadow-lg p-6 space-y-4
    max-h-[40vh] overflow-y-auto
`;

const DriverCard = tw.div`
    flex items-center space-x-4 p-4 bg-gray-50 rounded-lg
`;

const DriverImage = tw(Image)`
    rounded-full
`;

const DriverDetails = tw.div`
    flex-1
`;

const DriverName = tw.h3`
    font-bold text-lg
`;

const CarInfo = tw.p`
    text-gray-600 text-sm
`;

const Rating = tw.p`
    text-yellow-500 text-sm
`;

const ContactActions = tw.div`
    flex space-x-2
`;

const ContactButton = tw.button`
    w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center
    hover:bg-blue-600 transition-colors
`;

const ChatSection = tw.div`
    border-t pt-4
`;

const ChatHeader = tw.h4`
    font-semibold mb-2
`;

const MessageList = tw.div`
    max-h-32 overflow-y-auto space-y-2 mb-4
`;

const MessageBubble = tw.div`
    p-2 rounded-lg max-w-xs
    ${props => props.$isUser 
        ? 'bg-blue-500 text-white ml-auto' 
        : 'bg-gray-200 text-gray-800'
    }
`;

const ChatInputContainer = tw.div`
    flex space-x-2
`;

const ChatInput = tw.input`
    flex-1 p-2 border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500
`;

const SendButton = tw.button`
    px-4 py-2 bg-blue-500 text-white rounded-lg
    hover:bg-blue-600 transition-colors
`;

const ActionButtons = tw.div`
    flex space-x-4 pt-4 border-t
`;

const CancelButton = tw.button`
    flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold
    hover:bg-red-600 transition-colors
`;