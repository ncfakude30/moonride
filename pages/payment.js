import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { requestTrip, initiatePayment, handlePaymentNotification } from './api/app.service'; 
import { setPaymentStatus, setPaymentResponse, setPaymentCallback } from '../store/reducers/paymentSlice';
import { useWebSocket } from '../contexts/WebSocketContext';

function Payment() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const ride = useSelector(state => state.ride);
    const paymentStatus = useSelector(state => state.payment.status);
    const { selectedCar,  } = useSelector((state) => state.confirmation);
    const { pickupCoordinates, dropoffCoordinates } = useSelector((state) => state.search);
    const { paymentUrl, paymentId } = useSelector((state) => state.payment.paymentResponse);
    const callback = useSelector((state) => state.payment);

    const { sendMessage } = useWebSocket();

    const [pickupPlace, setPickupPlace] = useState('');
    const [dropoffPlace, setDropoffPlace] = useState('');
    const [pickupShortName, setPickupShortName] = useState('');
    const [dropoffShortName, setDropoffShortName] = useState('');
    const [loading, setLoading] = useState(false);
    const pickup = useSelector((state) => state.search.pickup);
    const dropoff = useSelector((state) => state.search.dropoff);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!pickupCoordinates && !dropoffCoordinates) {
            fetchPlaceName(pickupCoordinates, 'pickup');
            fetchPlaceName(dropoffCoordinates, 'dropoff');
        }
    }, [pickup, dropoff, pickupCoordinates, dropoffCoordinates, user, router]);

    const fetchPlaceName = async (coordinates, type) => {
        try {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates}.json?` +
                new URLSearchParams({
                    access_token: process.env.ACCESS_TOKEN || 'pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ',
                    limit: 1
                })
            );
            const data = await response.json();
            const placeName = data.features.length > 0 ? data.features[0].place_name : 'Unknown location';
            const shortName = data.features.length > 0 ? data.features[0].text : 'Unknown';

            if (type === 'pickup') {
                setPickupPlace(pickup);
                setPickupShortName(shortName);
            } else if (type === 'dropoff') {
                setDropoffPlace(dropoff);
                setDropoffShortName(dropoffShortName);
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

        setLoading(true);

        try {
            const request = {
                pickup: pickupPlace,
                dropoff: dropoffPlace,
                price: (ride?.selectedCar ? ride?.selectedCar.price : selectedCar?.price) || 10,
                time: ride?.selectedCar ? ride?.selectedCar.time : selectedCar.time,
                rating: ride?.selectedCar ? ride?.selectedCar.rating : selectedCar.rating,
                driverProfile: ride?.selectedCar ? ride?.selectedCar.driverProfile : selectedCar.driverProfile,
                userId: user?.id || user?.uuid,
                pickupName: pickupPlace || pickupShortName,
                dropoffName: dropoffPlace || dropoffShortName,
                amount: (ride?.selectedCar ? ride?.selectedCar.price : selectedCar.price) || 10,
                firstName: 'TestName',
                lastName: 'LastTestName',
                email: 'email@gmail.com',

            };

            const paymentResponse = await initiatePayment(request).catch((error) => {
                console.log(`Failed to make a payment request: ${JSON.stringify(error)}`);
                dispatch(setPaymentStatus(error))
                return;
            });

            /*
            // Request the trip (pre-payment)
            const tripResponse = await requestTrip(request).catch((error) => {
                console.log(error);
                //call refund function.
                dispatch(setPaymentStatus('failure'));
                router.push('/payment');
            });
            */

            //console.log(`Trip response: ${JSON.stringify(tripResponse)}`);

            if (!(paymentResponse && paymentResponse?.paymentUrl 
                && paymentResponse?.paymentId)) {
                //call refund function.
                dispatch(setPaymentStatus('failure'));
                router.push('/payment');
            }

            console.log(`Continue right ?: ${JSON.stringify(paymentResponse)}`);
            dispatch(setPaymentResponse({
                paymentUrl: paymentResponse?.paymentUrl,
                paymentId: paymentResponse?.paymentId,
            }));
            router.push(paymentResponse?.paymentId);
        } catch (error) {
            console.error('Payment failed:', error);
            dispatch(setPaymentStatus('failure'));
        } finally {
            setLoading(false);
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
                        <p><strong>Price:</strong> {selectedCar.price}</p>
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
