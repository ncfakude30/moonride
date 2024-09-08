import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { requestTrip } from './api/app.service'; // Import the requestTrip function
import { useWebSocket } from '../contexts/WebSocketContext'; // Import the useWebSocket hook

function Payment() {
    const router = useRouter();
    const { pickup, dropoff, ride, user } = router.query;
    const [selectedCar, setSelectedCar] = useState(null);

    const [loggedUser, setUser] = useState(null);
    const [pickupPlace, setPickupPlace] = useState('');
    const [dropoffPlace, setDropoffPlace] = useState('');
    const [pickupShortName, setPickupShortName] = useState('');
    const [dropoffShortName, setDropoffShortName] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(false); // New loading state
    const { sendMessage } = useWebSocket(); // Access WebSocket context

    useEffect(() => {
        // Redirect to login page if no loggedUser is found
        if (!user) {
            setUser(null);
            router.push('/login');
        }
    
        setUser(JSON.parse(user));
    
        // Set selected car and place names
        if (ride) {
            setSelectedCar(JSON.parse(ride));
        }
        if (pickup && dropoff) {
            fetchPlaceName(pickup, 'pickup');
            fetchPlaceName(dropoff, 'dropoff');
        }
    }, [ride, pickup, dropoff, user, router]);
    
    const fetchPlaceName = async (coordinates, type) => {
        try {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates}.json?` +
                new URLSearchParams({
                    access_token: 'pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ',
                    limit: 1
                })
            );
            const data = await response.json();
            const placeName = data.features.length > 0 ? data.features[0].place_name : 'Unknown location';
            const shortName = data.features.length > 0 ? data.features[0].text : 'Unknown';
            
            if (type === 'pickup') {
                setPickupPlace(placeName);
                setPickupShortName(shortName); // Add this to set short name
            } else if (type === 'dropoff') {
                setDropoffPlace(placeName);
                setDropoffShortName(shortName); // Add this to set short name
            }
        } catch (error) {
            console.error('Error fetching place name:', error);
            if (type === 'pickup') {
                setPickupPlace('Error fetching location');
                setPickupShortName('Error');
            } else if (type === 'dropoff') {
                setDropoffPlace('Error fetching location');
                setDropoffShortName('Error');
            }
        }
    };
    
    const handlePayment = async (user) => {
        if (!user) {
            console.error('User is not logged in');
            setPaymentStatus('failure');
            return;
        }

        setLoading(true); // Set loading to true

        try {
            // Mock payment process
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

            const tripData = {
                pickup: pickup,
                dropoff: dropoff,
                price: selectedCar ? selectedCar.price : 0,
                time: selectedCar ? selectedCar.time : 0,
                rating: selectedCar ? selectedCar.rating : 0,
                driverProfile: selectedCar ? selectedCar.driverProfile : '',
                userId: `${user?.userId || user?.id || user?.uuid}`,
                pickupName: pickupShortName,
                dropoffName: dropoffShortName,
                pickupName: pickupPlace,
                dropoffName: dropoffPlace,
                recipientId: user?.id || user?.uuid,
            };

            // Add trip data after successful payment
            await requestTrip(tripData);
            console.log('Trip request successful');
            setPaymentStatus('success');

            // Send WebSocket message
            sendMessage({
                type: 'ride_request', // Ensure the type matches your server's expected message type
                ...tripData
            });

            // Redirect to confirmation page after both operations are complete
            router.push('/');
        } catch (error) {
            console.error('Payment failed:', error);
            setPaymentStatus('failure');
        } finally {
            setLoading(false); // Set loading to false once operations are complete
        }
    };

    return (
        <Wrapper>
            <Title>Payment</Title>
            <Details>
                <p><strong>Pickup:</strong> {pickupPlace}</p>
                <p><strong>Dropoff:</strong> {dropoffPlace}</p>
                {selectedCar && (
                    <div>
                        <img src={selectedCar.imgUrl} alt={selectedCar.service} />
                        <p><strong>Service:</strong> {selectedCar.service}</p>
                        <p><strong>Price:</strong> {selectedCar.multiplier * 10}</p> {/* Replace with actual price calculation */}
                    </div>
                )}
                {paymentStatus === 'success' && <SuccessMessage>Payment successful! Redirecting to confirmation...</SuccessMessage>}
                {paymentStatus === 'failure' && <ErrorMessage>Payment failed. Please try again.</ErrorMessage>}
            </Details>
            {loading ? (
                <LoadingMessage>Processing payment, please wait...</LoadingMessage>
            ) : (
                <Button onClick={() => handlePayment(loggedUser)} disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm Payment'}
                </Button>
            )}
        </Wrapper>
    );
}

export default Payment;

const Wrapper = tw.div`
    flex flex-col items-center justify-center h-screen p-4
`;

const Title = tw.h1`
    text-2xl font-bold mb-4
`;

const Details = tw.div`
    mb-4
`;

const Button = tw.button`
    bg-black text-white py-2 px-4 rounded
    ${({ disabled }) => disabled && 'opacity-50 cursor-not-allowed'}
`;

const SuccessMessage = tw.p`
    text-green-500 mt-4
`;

const ErrorMessage = tw.p`
    text-red-500 mt-4
`;

const LoadingMessage = tw.p`
    text-yellow-500 mt-4
`;
