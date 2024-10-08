import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { requestTrip, initiatePayment } from './api/api.service';
import { setPaymentStatus, setPaymentResponse } from '../store/reducers/paymentSlice';
import { setTrackingDetails, updateMessages } from '../store/actions/trackingActions';
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
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const carPrice = useSelector((state) => state.ride.carPrice);

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
            handlePopupOpen();
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
                price: (ride?.carPrice) || 10,
                time: ride?.selectedCar ? ride?.selectedCar?.time : selectedCar?.time,
                rating: ride?.selectedCar ? ride?.selectedCar?.rating : selectedCar?.rating,
                driverProfile: ride?.selectedCar ? ride?.selectedCar?.driverProfile : selectedCar?.driverProfile,
                userId: user?.id || user?.uuid,
                pickupName: pickupPlace || pickupShortName,
                dropoffName: dropoffPlace || dropoffShortName,
                amount: String((ride?.carPrice) || 10),
                firstName: 'TestName',
                lastName: 'LastTestName',
                email: 'email@gmail.com',
                paymentGateway: selectedGateway,
                pickupCoordinates,
                dropoffCoordinates,
                bankReference: 'TestReference',
            };

            switch(selectedGateway?.toUpperCase()) {
                case 'CASH':
                    let tripResponse = await requestTrip(request).catch((error) => {
                    console.log(error);
                    dispatch(setPaymentStatus('failure'));
                    });

                    console.log(tripResponse);
                    dispatch(setPaymentStatus('Trip successfully requested.'));
                    dispatch(setTrackingDetails({
                        pickup: pickupCoordinates,
                        dropoff: dropoffCoordinates,
                        user,
                        loading: false
                    }));
                    router.push('/');
                    break;

                case 'OZOW':
                    const paymentResponse = await initiatePayment(request).catch((error) => {
                        console.log(`Failed to make a payment request: ${JSON.stringify(error)}`);
                        dispatch(setPaymentStatus(error));
                        return;
                    });


                    /* THIS TO BE CALLED AFTER SUCCESSFUL PAYMENT.
                    tripResponse = await requestTrip(request).catch((error) => {
                        console.log(error);
                        dispatch(setPaymentStatus('failure'));
                        router.push('/payment');
                    });
                    */

                    console.log(tripResponse);
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
            }
        } catch (error) {
            console.error('Payment failed:', error);
            dispatch(setPaymentStatus('failure'));
        } finally {
            setLoading(false);
        }
    };

    const handlePopupOpen = () => {
        setIsPopupOpen(true);
    };

    const handlePopupClose = () => {
        setIsPopupOpen(false);
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
                <DriverProfile
                        driverName={selectedCar?.driverName || 'Unknown Driver'}
                        driverRating={selectedCar?.rating || 'N/A'}
                        driverImage={selectedCar?.driverProfile || 'https://moonride-media.s3.amazonaws.com/default.png'}
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
                                <DirectionsContainer>
                                <p><strong>Service:</strong> {selectedCar.service}</p>
                                <p><strong>Price:</strong>R {carPrice || '10'}</p>
                                </DirectionsContainer>
                            </CarDetails>
                        )}
                    </Details>

                    <PaymentGatewaySelection>
                        <p><strong>Payment option:</strong></p>
                        <ScrollableGatewayList>
                            <GatewayOption
                                $isSelected={selectedGateway === 'cash'}
                                onClick={() => setSelectedGateway('cash')}
                            >
                                <DriverImage src='https://moonride-media.s3.amazonaws.com/cash.png' alt='Cash' width={50} height={50} />
                                <PaymentTitle>Cash</PaymentTitle>
                            </GatewayOption>
                            <GatewayOption
                                $isSelected={selectedGateway === 'ozow'}
                                onClick={() => setSelectedGateway('ozow')}
                            >
                                <DriverImage src='https://moonride-media.s3.amazonaws.com/ozow.png' alt='Ozow' width={50} height={50} />
                                <PaymentTitle>Instant EFT</PaymentTitle>
                            </GatewayOption>
                        </ScrollableGatewayList>
                    </PaymentGatewaySelection>

                    {paymentStatus === 'success' && <SuccessMessage>Payment successful! Redirecting...</SuccessMessage>}
                    {paymentStatus === 'failure' && <ErrorMessage>Payment failed. Please try again.</ErrorMessage>}
                    {loading ? (
                        <LoadingWrapper>
                        <Loader />
                        <LoadingMessage>Processing payment, please wait...</LoadingMessage>
                    </LoadingWrapper>
                    ) : (
                        <Button onClick={handlePayment} disabled={loading}>
                            {loading ? 'Processing...' : selectedGateway ? `Confirm ${selectedGateway.charAt(0).toUpperCase() + selectedGateway.slice(1)}` : 'Confirm Payment'}
                        </Button>
                    )}
                    {isPopupOpen && (
                        <PopupOverlay>
                            <PopupCard>
                                <PopupTitle>Payment</PopupTitle>
                                <PopupContent>
                                Please select a payment option, to continue with payment!
                                </PopupContent>
                                <CloseButton onClick={handlePopupClose}>Close</CloseButton>
                            </PopupCard>
                        </PopupOverlay>
                    )}
            </Content>
        </Wrapper>
    );
}

export default Payment;

// New DriverProfile Component
const DriverProfile = ({ driverName, driverRating, driverImage }) => (
    <ProfileWrapper>
        <DriverImage src={driverImage} alt={`${driverName} Profile`} width={80} height={80} />
        <DriverInfo>
            <DriverName>{driverName}</DriverName>
            <DriverRating>⭐ {driverRating}</DriverRating>
        </DriverInfo>
    </ProfileWrapper>
);

const Wrapper = tw.div`
    relative bg-gray-100 p-4 rounded-lg shadow-lg w-full h-full flex flex-col
`;

const Content = tw.div`
    flex-1 p-6 mt-16 
`;
const BackButtonContainer = tw.div`
    absolute rounded-full top-4 left-4 z-10 bg-white shadow-md cursor-pointer justify-start
`;

const BackButton = tw.div`
    relative h-12 w-12
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

const DirectionsContainer = tw.div`
    flex-1 ml-4
`;

const PaymentGatewaySelection = tw.div`
    flex flex-col mb-4
`;

const ScrollableGatewayList = tw.div`
    flex overflow-x-scroll space-x-4
`;

const GatewayOption = tw.div`
    flex flex-col items-center cursor-pointer border-2 rounded-lg p-2
    ${(p) => p.$isSelected ? 'border-green-500 bg-green-100' : 'border-gray-300'}
`;

const PaymentTitle = tw.p`
    text-sm mt-2
`;



const DriverImage = tw(Image)`
    rounded-full mb-2
    ${(props) => props.isSelected ? 'border-4 border-white' : 'border-2 border-gray-300'}
`;


const ProfileWrapper = tw.div`
    flex items-center space-x-4 mb-4
`;

const DriverInfo = tw.div`
    flex flex-col
`;

const DriverDetails = tw.div`
    flex flex-col justify-center
`;

const DriverName = tw.p`
    text-lg font-semibold
`;

const DriverRating = tw.p`
    text-sm text-gray-600
`;


const Button = tw.button`
    py-2 px-4 bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-full py-3 px-6 font-bold w-full mt-4 disabled:opacity-50
    ${(p) => (p.disabled ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-600')}
`;

const SuccessMessage = tw.div`
    text-lg text-green-600 font-semibold mt-4
`;

const ErrorMessage = tw.div`
    text-lg text-red-600 font-semibold mt-4
`;

const LoadingWrapper = tw.div`
flex flex-col items-center justify-center py-6
`;

const LoadingMessage = tw.div`
text-gray-500 text-center py-4 text-center text-xs py-2 border-b
`;

// Animated Loader (CSS keyframes)
const Loader = tw.div`
w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-500
`;


const PopupOverlay = tw.div`
    fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20
`;

const PopupCard = tw.div`
    bg-white rounded-lg shadow-lg p-6 w-80 max-w-full text-center
`;

const PopupTitle = tw.h2`
    text-xl font-bold mb-4
`;

const PopupContent = tw.p`
    text-gray-700 mb-6
`;

const CloseButton = tw.button`
    bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-full p-2 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-1 focus:ring-gray-500
    w-full max-w-xs
`;
