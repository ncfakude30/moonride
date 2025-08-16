import { useState, useEffect } from 'react';
import tw from 'tailwind-styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useWebSocket } from '../contexts/WebSocketContext';

const DriverDashboard = ({ user }) => {
    const dispatch = useDispatch();
    const { sendMessage, status } = useWebSocket();
    const [isOnline, setIsOnline] = useState(false);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [rideRequests, setRideRequests] = useState([]);
    const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });

    useEffect(() => {
        if (status === 'connected' && isOnline) {
            // Send driver location updates
            const locationInterval = setInterval(() => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        sendMessage({
                            type: 'driver_location_update',
                            driverId: user.id,
                            location: {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                                heading: position.coords.heading || 0
                            }
                        });
                    });
                }
            }, 5000);

            return () => clearInterval(locationInterval);
        }
    }, [status, isOnline, user.id, sendMessage]);

    const handleGoOnline = () => {
        setIsOnline(true);
        sendMessage({
            type: 'driver_status_update',
            driverId: user.id,
            status: 'online'
        });
    };

    const handleGoOffline = () => {
        setIsOnline(false);
        sendMessage({
            type: 'driver_status_update',
            driverId: user.id,
            status: 'offline'
        });
    };

    const handleAcceptRide = (requestId) => {
        sendMessage({
            type: 'accept_ride_request',
            driverId: user.id,
            requestId
        });
        setRideRequests(prev => prev.filter(req => req.id !== requestId));
    };

    const handleDeclineRide = (requestId) => {
        sendMessage({
            type: 'decline_ride_request',
            driverId: user.id,
            requestId
        });
        setRideRequests(prev => prev.filter(req => req.id !== requestId));
    };

    return (
        <DashboardContainer>
            <StatusHeader>
                <StatusToggle>
                    <StatusButton 
                        onClick={isOnline ? handleGoOffline : handleGoOnline}
                        $isOnline={isOnline}
                    >
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </StatusButton>
                    <StatusText>
                        {isOnline ? 'You are online and available' : 'You are offline'}
                    </StatusText>
                </StatusToggle>
            </StatusHeader>

            <EarningsCard>
                <EarningsTitle>Today's Earnings</EarningsTitle>
                <EarningsAmount>R{earnings.today}</EarningsAmount>
                <EarningsStats>
                    <StatItem>
                        <StatValue>R{earnings.week}</StatValue>
                        <StatLabel>This Week</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue>R{earnings.month}</StatValue>
                        <StatLabel>This Month</StatLabel>
                    </StatItem>
                </EarningsStats>
            </EarningsCard>

            {currentTrip ? (
                <CurrentTripCard>
                    <TripHeader>
                        <TripStatus>Trip in Progress</TripStatus>
                        <TripTime>12 min remaining</TripTime>
                    </TripHeader>
                    <TripRoute>
                        <RoutePoint>
                            <RouteDot className="bg-green-500" />
                            <RouteText>{currentTrip.pickup}</RouteText>
                        </RoutePoint>
                        <RouteLine />
                        <RoutePoint>
                            <RouteDot className="bg-red-500" />
                            <RouteText>{currentTrip.dropoff}</RouteText>
                        </RoutePoint>
                    </TripRoute>
                    <TripActions>
                        <ActionButton className="bg-blue-500">
                            Navigate
                        </ActionButton>
                        <ActionButton className="bg-green-500">
                            Contact Rider
                        </ActionButton>
                    </TripActions>
                </CurrentTripCard>
            ) : (
                <RideRequestsSection>
                    <SectionTitle>Ride Requests</SectionTitle>
                    {rideRequests.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>🚗</EmptyIcon>
                            <EmptyText>
                                {isOnline ? 'Waiting for ride requests...' : 'Go online to receive requests'}
                            </EmptyText>
                        </EmptyState>
                    ) : (
                        <RequestsList>
                            {rideRequests.map((request) => (
                                <RequestCard key={request.id}>
                                    <RequestHeader>
                                        <RequestDistance>{request.distance} km away</RequestDistance>
                                        <RequestFare>R{request.fare}</RequestFare>
                                    </RequestHeader>
                                    <RequestRoute>
                                        <RoutePoint>
                                            <RouteDot className="bg-green-500" />
                                            <RouteText>{request.pickup}</RouteText>
                                        </RoutePoint>
                                        <RouteLine />
                                        <RoutePoint>
                                            <RouteDot className="bg-red-500" />
                                            <RouteText>{request.dropoff}</RouteText>
                                        </RoutePoint>
                                    </RequestRoute>
                                    <RequestActions>
                                        <DeclineButton onClick={() => handleDeclineRide(request.id)}>
                                            Decline
                                        </DeclineButton>
                                        <AcceptButton onClick={() => handleAcceptRide(request.id)}>
                                            Accept
                                        </AcceptButton>
                                    </RequestActions>
                                </RequestCard>
                            ))}
                        </RequestsList>
                    )}
                </RideRequestsSection>
            )}
        </DashboardContainer>
    );
};

export default DriverDashboard;

const DashboardContainer = tw.div`
    p-4 space-y-6 max-w-md mx-auto
`;

const StatusHeader = tw.div`
    bg-white rounded-lg shadow-md p-4
`;

const StatusToggle = tw.div`
    text-center space-y-2
`;

const StatusButton = tw.button`
    w-full py-3 rounded-lg font-semibold text-white transition-colors
    ${props => props.$isOnline 
        ? 'bg-red-500 hover:bg-red-600' 
        : 'bg-green-500 hover:bg-green-600'
    }
`;

const StatusText = tw.p`
    text-sm text-gray-600
`;

const EarningsCard = tw.div`
    bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6
`;

const EarningsTitle = tw.h3`
    text-lg font-medium opacity-90
`;

const EarningsAmount = tw.div`
    text-3xl font-bold my-2
`;

const EarningsStats = tw.div`
    flex justify-between mt-4
`;

const StatItem = tw.div`
    text-center
`;

const StatValue = tw.div`
    font-semibold
`;

const StatLabel = tw.div`
    text-xs opacity-75
`;

const CurrentTripCard = tw.div`
    bg-white rounded-lg shadow-md p-4 space-y-4
`;

const TripHeader = tw.div`
    flex justify-between items-center
`;

const TripStatus = tw.span`
    text-green-600 font-semibold
`;

const TripTime = tw.span`
    text-gray-600 text-sm
`;

const TripRoute = tw.div`
    space-y-2
`;

const RoutePoint = tw.div`
    flex items-center space-x-3
`;

const RouteDot = tw.div`
    w-3 h-3 rounded-full
`;

const RouteText = tw.span`
    text-gray-700 text-sm
`;

const RouteLine = tw.div`
    w-px h-4 bg-gray-300 ml-1.5
`;

const TripActions = tw.div`
    flex space-x-3
`;

const ActionButton = tw.button`
    flex-1 py-2 rounded-lg text-white font-medium
`;

const RideRequestsSection = tw.div`
    space-y-4
`;

const SectionTitle = tw.h2`
    text-xl font-bold text-gray-800
`;

const EmptyState = tw.div`
    bg-white rounded-lg shadow-md p-8 text-center
`;

const EmptyIcon = tw.div`
    text-4xl mb-2
`;

const EmptyText = tw.p`
    text-gray-600
`;

const RequestsList = tw.div`
    space-y-3
`;

const RequestCard = tw.div`
    bg-white rounded-lg shadow-md p-4 space-y-3
`;

const RequestHeader = tw.div`
    flex justify-between items-center
`;

const RequestDistance = tw.span`
    text-blue-600 font-medium
`;

const RequestFare = tw.span`
    text-green-600 font-bold text-lg
`;

const RequestRoute = tw.div`
    space-y-2
`;

const RequestActions = tw.div`
    flex space-x-3
`;

const DeclineButton = tw.button`
    flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium
    hover:bg-gray-300 transition-colors
`;

const AcceptButton = tw.button`
    flex-1 py-2 bg-green-500 text-white rounded-lg font-medium
    hover:bg-green-600 transition-colors
`;