import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import RideFlow from '../components/RideFlow';

function RideFlowPage() {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);
    const [tripData, setTripData] = useState(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Get trip data from query params or Redux state
        const data = {
            tripId: router.query.tripId || `trip-${Date.now()}`,
            pickup: router.query.pickup || '',
            dropoff: router.query.dropoff || '',
            pickupCoordinates: router.query.pickupCoordinates ? 
                JSON.parse(router.query.pickupCoordinates) : [0, 0],
            dropoffCoordinates: router.query.dropoffCoordinates ? 
                JSON.parse(router.query.dropoffCoordinates) : [0, 0],
            price: router.query.price || '0',
            service: router.query.service || 'UberX'
        };

        setTripData(data);
    }, [user, router]);

    if (!user) {
        return (
            <LoadingWrapper>
                <LoadingSpinner />
                <LoadingText>Loading...</LoadingText>
            </LoadingWrapper>
        );
    }

    if (!tripData) {
        return (
            <LoadingWrapper>
                <LoadingSpinner />
                <LoadingText>Preparing your ride...</LoadingText>
            </LoadingWrapper>
        );
    }

    return <RideFlow tripData={tripData} />;
}

export default RideFlowPage;

const LoadingWrapper = tw.div`
    min-h-screen bg-gray-100 flex flex-col items-center justify-center
`;

const LoadingSpinner = tw.div`
    w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin
`;

const LoadingText = tw.p`
    mt-4 text-gray-600
`;