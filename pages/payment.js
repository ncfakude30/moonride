import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';

function Payment() {
    const router = useRouter();
    const { pickup, dropoff, ride } = router.query;

    const [selectedCar, setSelectedCar] = useState(null);
    const [pickupPlace, setPickupPlace] = useState('');
    const [dropoffPlace, setDropoffPlace] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        if (ride) {
            setSelectedCar(JSON.parse(ride));
        }
        if (pickup && dropoff) {
            fetchPlaceName(pickup, 'pickup');
            fetchPlaceName(dropoff, 'dropoff');
        }
    }, [ride, pickup, dropoff]);

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

    const handlePayment = async () => {
        try {
            // Mock payment process
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay
            setPaymentStatus('success');
            setTimeout(() => {
                router.push('/'); // Redirect to home page after payment success
            }, 1000);
        } catch (error) {
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
                {paymentStatus === 'success' && <SuccessMessage>Payment successful! Redirecting to home...</SuccessMessage>}
                {paymentStatus === 'failure' && <ErrorMessage>Payment failed. Please try again.</ErrorMessage>}
            </Details>
            <Button onClick={handlePayment}>Confirm Payment</Button>
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
