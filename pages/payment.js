import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { requestTrip } from './api/app.service'; // Import the requestTrip function

function Payment() {
    const router = useRouter();
    let { pickup, dropoff, ride, user } = router.query;
    const [selectedCar, setSelectedCar] = useState(null);

    const [loggedUser, setUser] = useState(null);
    const [pickupPlace, setPickupPlace] = useState('');
    const [dropoffPlace, setDropoffPlace] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        // Redirect to login page if no loggedUser is found
        if (!user) {
            setUser(null)
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
            if (type === 'pickup') {
                setPickupPlace(placeName);
            } else if (type === 'dropoff') {
                setDropoffPlace(placeName);
            }
        } catch (error) {
            console.error('Error fetching place name:', error);
            if (type === 'pickup') {
                setPickupPlace('Error fetching location');
            } else if (type === 'dropoff') {
                setDropoffPlace('Error fetching location');
            }
        }
    };

    const handlePayment = async (user) => {
        if (!user) {
            // Handle the case where loggedUser is not available
            console.error('User is not logged in');
            setPaymentStatus('failure');
            return;
        }

        try {
            // Mock payment process
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

            // Assuming you have the trip data
            const tripData = {
                pickup: pickup,
                dropoff: dropoff,
                price: selectedCar ? selectedCar.price : 0, // Or other appropriate price
                time: selectedCar ? selectedCar.time : 0,   // Or other appropriate time
                rating: selectedCar ? selectedCar.rating : 0,
                driverProfile: selectedCar ? selectedCar.driverProfile : '',
                userId: `${user?.userId || user?.id  || user?.uuid}`,
                ...user, // Spread loggedUser properties
            };

            console.log(`My trip user: ${JSON.stringify({user})}`)

            // Add trip data after successful payment
            await requestTrip(tripData).then((response) => {
                console.log(`Success: ${JSON.stringify({response})}`);
                setPaymentStatus('success');
                router.push('/'); // Redirect to confirmation page
            });
        } catch (error) {
            console.error('Payment failed:', error);
            setPaymentStatus('failure');
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
            <Button  onClick={() => handlePayment(loggedUser)}>Confirm Payment</Button>
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
`;

const SuccessMessage = tw.p`
    text-green-500 mt-4
`;

const ErrorMessage = tw.p`
    text-red-500 mt-4
`;
