import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { requestTrip, initiatePayment } from './api/api.service';
import { setPaymentStatus, setPaymentResponse } from '../store/reducers/paymentSlice';
import Image from 'next/image';

function Payment() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const ride = useSelector(state => state.ride);
    const paymentStatus = useSelector(state => state.payment.status);
    const { selectedCar } = useSelector(state => state.confirmation);
    const { pickupCoordinates, dropoffCoordinates } = useSelector(state => state.search);
    const { paymentUrl, paymentId } = useSelector(state => state.payment.paymentResponse);
    const [pickupPlace, setPickupPlace] = useState('');
    const [dropoffPlace, setDropoffPlace] = useState('');
    const [pickupShortName, setPickupShortName] = useState('');
    const [dropoffShortName, setDropoffShortName] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState('');
    const { pickup, dropoff } = useSelector(state => state.search);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!pickupCoordinates && !dropoffCoordinates) {
            fetchPlaceName(pickup, 'pickup');
            fetchPlaceName(dropoff, 'dropoff');
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
        if (!selectedGateway) {
            alert('Please select a payment gateway.');
            return;
        }

        if (!user) {
            console.error('User is not logged in');
            dispatch(setPaymentStatus('failure'));
            return;
        }

        setLoading(true);

        try {
            const request = {
                pickup,
                dropoff,
                price: (ride?.selectedCar ? ride?.selectedCar.price : selectedCar?.price) || 10,
                time: ride?.selectedCar ? ride?.selectedCar?.time : selectedCar?.time,
                rating: ride?.selectedCar ? ride?.selectedCar?.rating : selectedCar?.rating,
                driverProfile: ride?.selectedCar ? ride?.selectedCar?.driverProfile : selectedCar?.driverProfile,
                userId: user?.id || user?.uuid,
                pickupName: pickupPlace || pickupShortName,
                dropoffName: dropoffPlace || dropoffShortName,
                amount: (ride?.selectedCar ? ride?.selectedCar?.price : selectedCar?.price) || 10,
                firstName: 'TestName',
                lastName: 'LastTestName',
                email: 'email@gmail.com',
                paymentGateway: selectedGateway
            };

            const paymentResponse = await initiatePayment(request).catch((error) => {
                console.log(`Failed to make a payment request: ${JSON.stringify(error)}`);
                dispatch(setPaymentStatus(error));
                return;
            });

            const tripResponse = await requestTrip(request).catch((error) => {
                console.log(error);
                dispatch(setPaymentStatus('failure'));
                router.push('/payment');
            });

            if (paymentResponse?.paymentUrl && paymentResponse?.paymentId) {
                dispatch(setPaymentResponse({
                    paymentUrl: paymentResponse.paymentUrl,
                    paymentId: paymentResponse.paymentId,
                }));
                window.location.href = paymentResponse.paymentUrl;
            } else {
                dispatch(setPaymentStatus('failure'));
                router.push('/payment');
            }
        } catch (error) {
            console.error('Payment failed:', error);
            dispatch(setPaymentStatus('failure'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Wrapper>
            <BackButtonContainer>
                <BackButton onClick={() => router.back()}>
                    <Image
                        src='https://img.icons8.com/ios-filled/50/000000/left.png'
                        alt='Back'
                        className='w-6 h-6'
                        width={50} height={50}
                    />
                </BackButton>
            </BackButtonContainer>
            <Content>
                <Card>
                    <DriverProfile
                        driverName={selectedCar?.driverName || 'Unknown Driver'}
                        driverRating={selectedCar?.rating || 'N/A'}
                        driverImage={selectedCar?.driverProfile || 'https://moonride-media.s3.amazonaws.com/moonrides.png'}
                    />
                    <Details>
                        <p><strong>Pickup:</strong> {pickupPlace}</p>
                        <p><strong>Dropoff:</strong> {dropoffPlace}</p>
                        {selectedCar && (
                            <CarDetails>
                                <Image
                                    src={selectedCar.imgUrl || 'https://moonride-media.s3.amazonaws.com/moonrides.png'}
                                    alt={selectedCar.service || 'yes'}
                                    width={200} height={200}
                                    className='object-cover'
                                />
                                <p><strong>Service:</strong> {selectedCar.service}</p>
                                <p><strong>Price:</strong> {selectedCar.price}</p>
                            </CarDetails>
                        )}
                    </Details>

                    <PaymentGatewaySelection>
                        <p><strong>Select Payment Gateway:</strong></p>
                        <ScrollableGatewayList>
                            <GatewayOption
                                isSelected={selectedGateway === 'ozow'}
                                onClick={() => setSelectedGateway('ozow')}
                            >
                                <DriverImage src='https://moonride-media.s3.amazonaws.com/moonrides.png' alt='Ozow' width={100} height={100} />
                                <span>Ozow</span>
                            </GatewayOption>
                            <GatewayOption
                                isSelected={selectedGateway === 'stripe'}
                                onClick={() => setSelectedGateway('stripe')}
                            >
                                <DriverImage src='https://moonride-media.s3.amazonaws.com/moonrides.png' alt='Stripe' width={100} height={100} />
                                <span>Stripe</span>
                            </GatewayOption>
                            <GatewayOption
                                isSelected={selectedGateway === 'paypal'}
                                onClick={() => setSelectedGateway('paypal')}
                            >
                                <DriverImage src='https://moonride-media.s3.amazonaws.com/moonrides.png' alt='PayPal' width={100} height={100} />
                                <span>PayPal</span>
                            </GatewayOption>
                            <GatewayOption
                                isSelected={selectedGateway === 'razorpay'}
                                onClick={() => setSelectedGateway('razorpay')}
                            >
                                <DriverImage src='https://moonride-media.s3.amazonaws.com/moonrides.png' alt='Razorpay' width={100} height={100} />
                                <span>Razorpay</span>
                            </GatewayOption>
                        </ScrollableGatewayList>
                    </PaymentGatewaySelection>

                    {paymentStatus === 'success' && <SuccessMessage>Payment successful! Redirecting...</SuccessMessage>}
                    {paymentStatus === 'failure' && <ErrorMessage>Payment failed. Please try again.</ErrorMessage>}
                    {loading ? (
                        <LoadingMessage>Processing payment, please wait...</LoadingMessage>
                    ) : (
                        <Button onClick={handlePayment} disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Payment'}
                        </Button>
                    )}
                </Card>
            </Content>
        </Wrapper>
    );
}

export default Payment;

// New DriverProfile Component
const DriverProfile = ({ driverName, driverRating, driverImage }) => (
    <ProfileWrapper>
        <DriverImage src={driverImage} alt={`${driverName} Profile`} width={100} height={100} />
        <DriverInfo>
            <DriverName>{driverName}</DriverName>
            <DriverRating>⭐ {driverRating}</DriverRating>
        </DriverInfo>
    </ProfileWrapper>
);

const Wrapper = tw.div`
    flex flex-col items-center justify-center h-screen p-4
`;


const Content = tw.div`
    flex-1 p-6
`;

const Card = tw.div`
    bg-white rounded-lg shadow-lg p-4
`;

const Details = tw.div`
    mb-4
`;

const CarDetails = tw.div`
    flex items-center space-x-4
`;

const PaymentGatewaySelection = tw.div`
    mb-4
`;

const ScrollableGatewayList = tw.div`
    flex overflow-x-scroll
`;

const GatewayOption = tw.div`
    flex items-center space-x-2 p-2 cursor-pointer
    ${(props) => props.isSelected && 'bg-blue-100'}
`;

const DriverImage = tw(Image)`
    rounded-full
`;

const ProfileWrapper = tw.div`
    flex items-center space-x-4 mb-4
`;

const DriverInfo = tw.div`
    flex flex-col
`;

const DriverName = tw.p`
    text-lg font-semibold
`;

const DriverRating = tw.p`
    text-sm text-gray-600
`;

const Button = tw.button`
    bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-full py-3 px-6 font-bold w-full mt-4 disabled:opacity-50
`;

const SuccessMessage = tw.p`
    text-green-600 mt-4
`;

const ErrorMessage = tw.p`
    text-red-600 mt-4
`;

const LoadingMessage = tw.p`
    text-blue-600 mt-4
`;

const BackButtonContainer = tw.div`
    absolute rounded-full top-4 left-4 z-10 bg-white shadow-md cursor-pointer
`;

const BackButton = tw.div`
    relative h-12 w-12
`;

