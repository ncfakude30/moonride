import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import TripSummary from '../components/TripSummary';

function TripSummaryPage() {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);
    const [trip, setTrip] = useState(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Get trip data from query params or state
        const tripData = {
            id: router.query.tripId || 'trip-123',
            pickup: router.query.pickup || 'Sandton City Mall',
            dropoff: router.query.dropoff || 'OR Tambo International Airport',
            price: router.query.price || '150',
            duration: router.query.duration || '25 min',
            distance: router.query.distance || '12.5 km',
            driverName: 'John Doe',
            driverProfile: 'https://moonride-media.s3.amazonaws.com/default.png'
        };

        setTrip(tripData);
    }, [user, router]);

    const handleRate = async (ratingData) => {
        try {
            // Submit rating to backend
            console.log('Rating submitted:', ratingData);
            
            // Show success message
            alert('Thank you for your feedback!');
            
            // Redirect to home
            router.push('/');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        }
    };

    const handleTipDriver = async (tipAmount) => {
        try {
            // Process tip payment
            console.log('Tip amount:', tipAmount);
        } catch (error) {
            console.error('Error processing tip:', error);
        }
    };

    if (!trip) {
        return (
            <LoadingWrapper>
                <LoadingSpinner />
                <LoadingText>Loading trip summary...</LoadingText>
            </LoadingWrapper>
        );
    }

    return (
        <Wrapper>
            <TripSummary 
                trip={trip}
                onRate={handleRate}
                onTipDriver={handleTipDriver}
            />
        </Wrapper>
    );
}

export default TripSummaryPage;

const Wrapper = tw.div`
    min-h-screen bg-gray-100 flex items-center justify-center p-4
`;

const LoadingWrapper = tw.div`
    min-h-screen bg-gray-100 flex flex-col items-center justify-center
`;

const LoadingSpinner = tw.div`
    w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin
`;

const LoadingText = tw.p`
    mt-4 text-gray-600
`;