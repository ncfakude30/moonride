import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import { setCurrency, setCarPrice } from '../../store/actions/rideActions';
import { setDirectionResponse, setSelectedCar, setLoading } from '../../store/reducers/confirmationSlice';
import { getDirections, fetchDrivers } from '../api/api.service';
import { carList } from '../../data/carList';

const countryToCurrency = {
    'ZA': 'ZAR',
    'US': 'USD',
    // Add other countries and currencies here
};

const getCurrencyCode = (countryCode) => {
    return countryToCurrency[countryCode] || 'ZA'; // Default to ZAR if not found
};

const getUserCountryCode = async () => {
    try {
        const response = await fetch('https://ipapi.co/country_code/');
        if (!response.ok) {
            throw new Error('Failed to fetch country code');
        }
        const countryCode = await response.text();
        return countryCode;
    } catch (error) {
        console.error('Error fetching country code:', error);
        return 'ZA'; // Default to ZA in case of an error
    }
};

function RideSelector({ pickupCoordinates, dropoffCoordinates, onSelectRide, loggedUser }) {
    const dispatch = useDispatch();
    const selectedCar = useSelector((state) => state.confirmation.selectedCar);
    const directionResponse = useSelector((state) => state.confirmation.directionResponse);
    const loading = useSelector((state) => state.confirmation.loading); // Direction loading
    const currency = useSelector((state) => state.ride.currency);
    const [rideDuration, setRideDuration] = useState(0);
    const [drivers, setDrivers] = useState([]); // State for fetched drivers
    const [driverLoading, setDriverLoading] = useState(false); // Loading state for drivers
    const [fetchError, setFetchError] = useState(false); // Error state for fetching drivers
    const carPrice = useSelector((state) => state.ride.carPrice);

    useEffect(() => {
        const fetchCurrency = async () => {
            const countryCode = await getUserCountryCode();
            dispatch(setCurrency(getCurrencyCode(countryCode)));
        };

        fetchCurrency();
    }, [dispatch]);

    useEffect(() => {
        if (pickupCoordinates.length === 0 || dropoffCoordinates.length === 0 || directionResponse) {
            return;
        }

        const fetchRideDuration = async () => {
            dispatch(setLoading(true));
            try {
                const response = await getDirections({
                    origin: `${pickupCoordinates[0]},${pickupCoordinates[1]}`,
                    destination: `${dropoffCoordinates[0]},${dropoffCoordinates[1]}`,
                });

                console.log(response);

                dispatch(setDirectionResponse(response));
                const data = response;

                if (data.directions.status === "ZERO_RESULTS") {
                    setRideDuration(0);
                } else if (data.directions.routes && data.directions.routes.length > 0) {
                    const durationInSeconds = data.directions.routes[0].legs[0]?.duration?.value;
                    setRideDuration(durationInSeconds / 60);
                }
            } catch (err) {
                dispatch(setDirectionResponse(null));
                console.error(err);
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchRideDuration();
    }, [pickupCoordinates, dropoffCoordinates, directionResponse, dispatch]);

    const fetchDriversList = async () => {
        setDriverLoading(true);
        setFetchError(false);
        try {
            const fetchedDrivers = await fetchDrivers({ pickupCoordinates });
            setDrivers(fetchedDrivers || carList);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            setDrivers([]);
            setFetchError(true); // Set error if fetching fails
        } finally {
            setDriverLoading(false);
        }
    };

    useEffect(() => {
        if (!pickupCoordinates || drivers?.length > 0) {
            return;
        }
        fetchDriversList();
    }, [pickupCoordinates, drivers]);

    const handleCarClick = (car) => {
        dispatch(setCarPrice((rideDuration * car?.multiplier).toFixed(2)));
        dispatch(setSelectedCar(car));
        onSelectRide(car);
    };

    return (
        <Wrapper>
            <Title>Choose a ride, or swipe up for more</Title>
            {loading || driverLoading ? (
                <LoadingWrapper>
                    <Loader />
                    <LoadingMessage>{loading && 'Please wait, looking for drivers...'}</LoadingMessage>
                </LoadingWrapper>
            ) : (
                <>
                    {drivers.length === 0 ? (
                        <EmptyState>
                            <EmptyMessage>No drivers available. Please try again.</EmptyMessage>
                            <RetryButton onClick={fetchDriversList}>Retry</RetryButton>
                        </EmptyState>
                    ) : (
                        <CarList>
                            {drivers.map((car) => (
                                <Car
                                    key={car.service}
                                    onClick={() => handleCarClick(car)}
                                    selected={selectedCar?.service === car.service}
                                >
                                    <CarImage src={car?.imgUrl} />
                                    <CarDetails>
                                        <CarName>{car.service}</CarName>
                                        <CarDuration>{`${rideDuration.toFixed(0)} minutes`}</CarDuration>
                                    </CarDetails>
                                    <CarPrice>{currency === 'ZAR' ? 'R' : 'R'}{(rideDuration * car?.multiplier).toFixed(2)}</CarPrice>
                                </Car>
                            ))}
                        </CarList>
                    )}
                </>
            )}
        </Wrapper>
    );
}

export default RideSelector;

// Styled Components
const Wrapper = tw.div`
    flex-1 overflow-y-scroll flex flex-col
`;

const CarName = tw.h3`
    font-medium
`;

const CarPrice = tw.div`
text-sm
`;

const CarDuration = tw.p`
    text-xs text-blue-500
`;

const Title = tw.div`
text-gray-500 text-center text-xs font-semibold py-2 border-b
`;

const CarList = tw.div`
overflow-y-scroll
`;

const Car = tw.div`
flex p-4 items-center cursor-pointer
${(selected) => selected && tw`bg-gray-200 border-2 border-blue-500`}
`;

const CarImage = tw.img`
h-14 mr-4
`;

const CarDetails = tw.div`
flex-1
`;

const LoadingWrapper = tw.div`
flex flex-col items-center justify-center py-6
`;

const LoadingMessage = tw.div`
text-gray-500 text-center py-4 text-center text-xs py-2 border-b
`;

const Loader = tw.div`
w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-500
`;

const EmptyState = tw.div`
flex flex-col items-center justify-center py-6
`;

const EmptyMessage = tw.p`
text-gray-500 text-sm mb-4
`;

const RetryButton = tw.button`
bg-blue-500 text-white px-4 py-2 rounded-full shadow-md
hover:bg-blue-600
`;
