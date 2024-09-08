import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import Map from './components/Map'; // Adjust the import path as needed
import Image from 'next/image';
import Link from 'next/link';
import { useWebSocket } from '../contexts/WebSocketContext';

const Tracking = () => {
    const router = useRouter();
    const { pickup, dropoff, pickupName, dropoffName, user } = router.query;
    const ws = useWebSocket();

    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropoffCoords, setDropoffCoords] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loggedUser, setUser] = useState(null);

    useEffect(() => {
        if(!user) {
            setUser(null);
            router.push('/')
        }

        setUser(user)

        if (pickup && dropoff) {
            const pickupArray = pickup.split(',').map(coord => parseFloat(coord));
            const dropoffArray = dropoff.split(',').map(coord => parseFloat(coord));

            setPickupCoords(pickupArray);
            setDropoffCoords(dropoffArray);
            setLoading(false);
        }
        
    }, [pickup, dropoff, user]);

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event) => {
                console.log(`My received message: ${JSON.stringify(event)}`)
                const data = JSON.parse(event.data);
                if (data.type === 'chat_message') {
                    setMessages(prevMessages => [...prevMessages, data.message]);
                }
            };
        }
    }, [ws]);

    const handleSendMessage = () => {
        if (newMessage.trim() && ws) {
            ws.sendMessage({ type: 'chat_message', text: newMessage, recipientId: loggedUser?.id ||  loggedUser?.uuid });
            setNewMessage('');
        }
    };

    if (loading) {
        return <LoadingMessage>Loading map...</LoadingMessage>;
    }

    return (
        <Container>
            <MapWrapper>
                <Map pickupCoordinates={pickupCoords} dropoffCoordinates={dropoffCoords} user={loggedUser}/>
                <BackButtonContainer>
                    <Link href='/'>
                        <BackButton>
                            <Image
                                src='https://img.icons8.com/ios-filled/50/000000/left.png'
                                alt='Back'
                                layout='fill'
                            />
                        </BackButton>
                    </Link>
                </BackButtonContainer>
            </MapWrapper>
            <InfoContainer>
                <DriverInfo>
                    <ProfilePicture
                        src='https://randomuser.me/api/portraits/med/women/1.jpg'
                        alt='Driver Profile'
                    />
                    <DriverDetails>
                        <p>Driver: John Doe</p>
                        <p>Car: Toyota Prius - AB123CD</p>
                        <p>Estimated Arrival: 5 minutes</p>
                    </DriverDetails>
                </DriverInfo>
                <ChatBox>
                    <ChatHeader>Chat with the driver:</ChatHeader>
                    <MessageList>
                        {messages.map((msg, index) => (
                            <MessageRow key={index} isUser={msg.isUser}>
                                <ProfilePictureSmall
                                    src={msg.isUser ? 'https://randomuser.me/api/portraits/med/women/1.jpg' : 'https://randomuser.me/api/portraits/med/women/1.jpg'}
                                    alt={msg.isUser ? 'User' : 'Driver'}
                                />
                                <MessageBubble isUser={msg.isUser}>
                                    {msg.text}
                                </MessageBubble>
                            </MessageRow>
                        ))}
                    </MessageList>
                    <ChatInputContainer>
                        <ChatInput
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <SendButton onClick={handleSendMessage}>Send</SendButton>
                    </ChatInputContainer>
                </ChatBox>
            </InfoContainer>
        </Container>
    );
};

export default Tracking;

// Styled components
const Container = tw.div`
    relative h-screen
`;

const MapWrapper = tw.div`
    absolute top-0 left-0 right-0 bottom-0
`;

const InfoContainer = tw.div`
    bg-white p-6 rounded-t-3xl shadow-lg
    absolute bottom-0 left-0 right-0
    max-h-[40%] overflow-y-auto
`;

const DriverInfo = tw.div`
    flex items-center mb-4
`;

const ProfilePicture = tw.img`
    w-16 h-16 rounded-full mr-4
`;

const DriverDetails = tw.div`
    text-gray-700
`;

const ChatBox = tw.div`
    bg-gray-100 p-4 rounded-lg
    flex flex-col justify-between h-full
`;

const ChatHeader = tw.p`
    text-gray-500 text-sm mb-2
`;

const MessageList = tw.div`
    flex-1 overflow-y-auto mb-4
`;

const MessageRow = tw.div`
    flex items-end mb-2 ${(props) => props.isUser ? 'justify-end' : 'justify-start'}
`;

const ProfilePictureSmall = tw.img`
    w-8 h-8 rounded-full mr-2 ${(props) => props.isUser && 'order-last ml-2'}
`;

const MessageBubble = tw.div`
    max-w-xs p-3 rounded-lg text-white
    ${(props) => props.isUser ? 'bg-blue-500 ml-2' : 'bg-gray-300 mr-2 text-black'}
`;

const ChatInputContainer = tw.div`
    flex items-center
`;

const ChatInput = tw.input`
    flex-1 p-2 border border-gray-300 rounded-lg mr-2
`;

const SendButton = tw.button`
    bg-blue-500 text-white p-2 rounded-lg
`;

const LoadingMessage = tw.div`
    text-center text-gray-600 font-medium
`;

const BackButtonContainer = tw.div`
    absolute rounded-full top-4 left-4 z-10 bg-white shadow-md cursor-pointer
`;

const BackButton = tw.div`
    relative h-12 w-12
`;
