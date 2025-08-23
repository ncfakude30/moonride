import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import DriverTracking from '../pages/components/DriverTracking';
import TripSummary from '../pages/components/TripSummary';
import { useWebSocket } from '../contexts/WebSocketContext';

const RIDE_STATES = {
    SEARCHING: 'searching',
    DRIVER_ASSIGNED: 'driver_assigned',
    DRIVER_EN_ROUTE: 'driver_en_route',
    DRIVER_ARRIVED: 'driver_arrived',
    TRIP_STARTED: 'trip_started',
    TRIP_COMPLETED: 'trip_completed',
    CANCELLED: 'cancelled'
};

const RideFlow = ({ tripData }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { sendMessage, status, messages } = useWebSocket();
    const user = useSelector((state) => state.auth.user);
    
    const [currentState, setCurrentState] = useState(RIDE_STATES.SEARCHING);
    const [driverInfo, setDriverInfo] = useState(null);
    const [tripId, setTripId] = useState(null);
    const [estimatedArrival, setEstimatedArrival] = useState(null);

    useEffect(() => {
        if (tripData) {
            setTripId(tripData.tripId);
            // Start the ride flow
            initiateRideSearch();
        }
    }, [tripData]);

    useEffect(() => {
        // Listen for WebSocket messages
        messages.forEach(message => {
            try {
                const data = typeof message === 'string' ? JSON.parse(message) : message;
                handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
    }, [messages]);

    const initiateRideSearch = () => {
        if (status === 'connected') {
            sendMessage({
                type: 'find_ride',
                data: {
                    userId: user.id,
                    pickup: tripData.pickupCoordinates,
                    dropoff: tripData.dropoffCoordinates,
                    tripId: tripData.tripId
                }
            });
        }
    };

    const handleWebSocketMessage = (data) => {
        switch (data.type) {
            case 'driver_assigned':
                setCurrentState(RIDE_STATES.DRIVER_ASSIGNED);
                setDriverInfo(data.driver);
                break;
            
            case 'driver_location_update':
                if (data.data.estimatedArrival) {
                    setEstimatedArrival(data.data.estimatedArrival);
                }
                break;
            
            case 'driver_arrived':
                setCurrentState(RIDE_STATES.DRIVER_ARRIVED);
                break;
            
            case 'trip_started':
                setCurrentState(RIDE_STATES.TRIP_STARTED);
                break;
            
            case 'trip_completed':
                setCurrentState(RIDE_STATES.TRIP_COMPLETED);
                break;
            
            case 'trip_cancelled':
                setCurrentState(RIDE_STATES.CANCELLED);
                break;
        }
    };

    const handleCancelRide = () => {
        if (status === 'connected') {
            sendMessage({
                type: 'cancel_ride',
                data: {
                    tripId,
                    userId: user.id
                }
            });
        }
        setCurrentState(RIDE_STATES.CANCELLED);
    };

    const handleRateTrip = (ratingData) => {
        // Submit rating and redirect to home
        console.log('Rating submitted:', ratingData);
        router.push('/');
    };

    const renderCurrentState = () => {
        switch (currentState) {
            case RIDE_STATES.SEARCHING:
                return (
                    <SearchingState>
                        <SearchingAnimation>
                            <SearchingSpinner />
                        </SearchingAnimation>
                        <SearchingText>Finding your perfect ride...</SearchingText>
                        <SearchingSubtext>This usually takes less than a minute</SearchingSubtext>
                        <CancelButton onClick={handleCancelRide}>
                            Cancel Search
                        </CancelButton>
                    </SearchingState>
                );

            case RIDE_STATES.DRIVER_ASSIGNED:
            case RIDE_STATES.DRIVER_EN_ROUTE:
            case RIDE_STATES.DRIVER_ARRIVED:
            case RIDE_STATES.TRIP_STARTED:
                return (
                    <DriverTracking
                        tripId={tripId}
                        driverId={driverInfo?.id}
                        driverInfo={driverInfo}
                        currentState={currentState}
                        estimatedArrival={estimatedArrival}
                        onCancel={handleCancelRide}
                    />
                );

            case RIDE_STATES.TRIP_COMPLETED:
                return (
                    <TripSummary
                        trip={{
                            ...tripData,
                            driverInfo,
                            tripId
                        }}
                        onRate={handleRateTrip}
                    />
                );

            case RIDE_STATES.CANCELLED:
                return (
                    <CancelledState>
                        <CancelledIcon>❌</CancelledIcon>
                        <CancelledTitle>Ride Cancelled</CancelledTitle>
                        <CancelledText>Your ride has been cancelled</CancelledText>
                        <HomeButton onClick={() => router.push('/')}>
                            Go Home
                        </HomeButton>
                    </CancelledState>
                );

            default:
                return (
                    <ErrorState>
                        <ErrorIcon>⚠️</ErrorIcon>
                        <ErrorTitle>Something went wrong</ErrorTitle>
                        <ErrorText>Please try booking a new ride</ErrorText>
                        <HomeButton onClick={() => router.push('/')}>
                            Go Home
                        </HomeButton>
                    </ErrorState>
                );
        }
    };

    return (
        <RideFlowContainer>
            {renderCurrentState()}
        </RideFlowContainer>
    );
};

export default RideFlow;

const RideFlowContainer = tw.div`
    min-h-screen bg-gray-100
`;

const SearchingState = tw.div`
    flex flex-col items-center justify-center min-h-screen p-6 text-center
`;

const SearchingAnimation = tw.div`
    mb-8
`;

const SearchingSpinner = tw.div`
    w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin
`;

const SearchingText = tw.h2`
    text-2xl font-bold text-gray-800 mb-2
`;

const SearchingSubtext = tw.p`
    text-gray-600 mb-8
`;

const CancelButton = tw.button`
    bg-red-500 text-white px-8 py-3 rounded-lg font-semibold
    hover:bg-red-600 transition-colors
`;

const CancelledState = tw.div`
    flex flex-col items-center justify-center min-h-screen p-6 text-center
`;

const CancelledIcon = tw.div`
    text-6xl mb-4
`;

const CancelledTitle = tw.h2`
    text-2xl font-bold text-gray-800 mb-2
`;

const CancelledText = tw.p`
    text-gray-600 mb-8
`;

const ErrorState = tw.div`
    flex flex-col items-center justify-center min-h-screen p-6 text-center
`;

const ErrorIcon = tw.div`
    text-6xl mb-4
`;

const ErrorTitle = tw.h2`
    text-2xl font-bold text-red-600 mb-2
`;

const ErrorText = tw.p`
    text-gray-600 mb-8
`;

const HomeButton = tw.button`
    bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold
    hover:bg-blue-600 transition-colors
`;