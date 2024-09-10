import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { requestTrip } from './api/app.service'; // Import the requestTrip function
import { setPaymentStatus } from '../store/reducers/paymentSlice'; // Import payment status action
import { useWebSocket } from '../contexts/WebSocketContext'; // Import the useWebSocket hook

function Payment() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user); // Get user from Redux
    const ride = useSelector(state => state.ride); // Get ride info from Redux
    const paymentStatus = useSelector(state => state.payment.status); // Get payment status from Redux
    const { selectedCar}= useSelector((state) => state.confirmation);
    const {pickupCoordinates, dropoffCoordinates}= useSelector((state) => state.search);
    
    const { sendMessage } = useWebSocket(); // Use the WebSocket hook

    const [pickupPlace, setPickupPlace] = useState('');
    const [dropoffPlace, setDropoffPlace] = useState('');
    const [pickupShortName, setPickupShortName] = useState('');
    const [dropoffShortName, setDropoffShortName] = useState('');
    const [loading, setLoading] = useState(false); // New loading state

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (pickupCoordinates && dropoffCoordinates) {
            fetchPlaceName(pickupCoordinates, 'pickup');
            fetchPlaceName(dropoffCoordinates, 'dropoff');
        }
    }, [ pickupCoordinates, dropoffCoordinates, user, router]);

    const fetchPlaceName = async (coordinates, type) => {
        try {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates}.json?` +
                new URLSearchParams({
                    access_token: process.env.MAPBOX_ACCESS_TOKEN, // Use environment variable for access token
                    limit: 1
                })
            );
            const data = await response.json();
            const placeName = data.features.length > 0 ? data.features[0].place_name : 'Unknown location';
            const shortName = data.features.length > 0 ? data.features[0].text : 'Unknown';
            
            if (type === 'pickup') {
                setPickupPlace(placeName);
                setPickupShortName(shortName);
            } else if (type === 'dropoff') {
                setDropoffPlace(placeName);
                setDropoffShortName(shortName);
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

    const handlePayment = async () => {
        if (!user) {
            console.error('User is not logged in');
            dispatch(setPaymentStatus('failure'));
            return;
        }

        setLoading(true); // Set loading to true

        try {
            // Mock payment process
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

            const tripData = {
                pickup: pickupPlace,
                dropoff: dropoffPlace,
                price: ride?.selectedCar ?  ride?.selectedCar.price : selectedCar.price,
                time:  ride?.selectedCar ?  ride?.selectedCar.time : selectedCar.time,
                rating:  ride?.selectedCar ?  ride?.selectedCar.rating : selectedCar.rating,
                driverProfile:  ride?.selectedCar ?  ride?.selectedCar.driverProfile : selectedCar.driverProfile,
                userId: user?.id || user?.uuid,
                pickupName: pickupPlace || pickupShortName,
                dropoffName: dropoffPlace || dropoffShortName,
            };

            // Add trip data after successful payment
            await requestTrip(tripData);
            console.log('Trip request successful');
            dispatch(setPaymentStatus('success'));

            // Send WebSocket message
            if (sendMessage) {
                sendMessage({
                    type: 'ride_request', // Ensure the type matches your server's expected message type
                    ...tripData
                });
            } else {
                console.log(`WebSocket is not available, skip sending message for now: ${JSON.stringify(tripData)}`);
            }

            // Redirect to confirmation page after both operations are complete
            router.push('/');
        } catch (error) {
            console.error('Payment failed:', error);
            dispatch(setPaymentStatus('failure'));
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
                        <p><strong>Price:</strong> {selectedCar.price}</p> {/* Adjusted to use selectedCar.price */}
                    </div>
                )}
                {paymentStatus === 'success' && <SuccessMessage>Payment successful! Redirecting to confirmation...</SuccessMessage>}
                {paymentStatus === 'failure' && <ErrorMessage>Payment failed. Please try again.</ErrorMessage>}
            </Details>
            {loading ? (
                <LoadingMessage>Processing payment, please wait...</LoadingMessage>
            ) : (
                <Button onClick={handlePayment} disabled={loading}>
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
