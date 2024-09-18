import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import { setCurrency } from '../../store/actions/rideActions';
import { setDirectionResponse, setSelectedCar } from '../../store/reducers/confirmationSlice';
import { getDirections, fetchDrivers } from '../api/api.service';
import { carList } from '../../data/carList';

// Mapping countries to currencies
const countryToCurrency = {
    'ZA': 'ZAR',
    'US': 'USD',
    // Add other countries and currencies here
};

// Function to get currency code based on the country code
const getCurrencyCode = (countryCode) => {
    return countryToCurrency[countryCode] || 'USD'; // Default to USD if not found
};

// Function to get user's country code using an IP API
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
        return 'US'; // Default to US in case of an error
    }
};

function RideSelector({ pickupCoordinates, dropoffCoordinates, onSelectRide, loggedUser }) {
    const dispatch = useDispatch();
    const selectedCar = useSelector((state) => state.confirmation.selectedCar);
    const directionResponse = useSelector((state) => state.confirmation.directionResponse);
    const currency = useSelector((state) => state.ride.currency);
    const [rideDuration, setRideDuration] = useState(0);
    const [drivers, setDrivers] = useState([]); // State for fetched drivers

    useEffect(() => {
        const fetchCurrency = async () => {
            const countryCode = await getUserCountryCode();
            dispatch(setCurrency(getCurrencyCode(countryCode)));
        };

        fetchCurrency();
    }, [dispatch]);

    useEffect(() => {
        if (pickupCoordinates.length === 0 || dropoffCoordinates.length === 0) {
            return;
        }

        const fetchRideDuration = async () => {
            try {
                const response = await getDirections({
                    origin: `${pickupCoordinates[0]},${pickupCoordinates[1]}`,
                    destination: `${dropoffCoordinates[0]},${dropoffCoordinates[1]}`,
                });

                dispatch(setDirectionResponse(response));
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                if (data.routes && data.routes.length > 0) {
                    const durationInSeconds = data.routes[0].legs[0]?.duration?.value;
                    setRideDuration(durationInSeconds / 60); // Convert duration from seconds to minutes
                }
            } catch (err) {
                console.error(err);
                console.error('Fetch error:', err);
            }
        };

        fetchRideDuration();
    }, [pickupCoordinates, dropoffCoordinates, directionResponse, dispatch]);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const fetchedDrivers = await fetchDrivers(pickupCoordinates); // Fetch drivers from Lambda
                setDrivers(fetchedDrivers);
            } catch (error) {
                console.error('Error fetching drivers:', error);
            }
        };

        fetchCars();
    }, [pickupCoordinates]);

    const handleCarClick = (car) => {
        dispatch(setSelectedCar(car));
        onSelectRide(car); // Notify parent component about the selected car
    };

    return (
        <Wrapper>
            <Title>Choose a ride, or swipe up for more</Title>
            <CarList>
                {(drivers?.length > 0 ? drivers : carList).map((car, index) => (
                    <Car
                        key={index}
                        onClick={() => handleCarClick(car)}
                        selected={selectedCar?.service === car.service}
                    >
                        <CarImage src={car?.imgUrl} />
                        <CarDetails>
                            <CarName>{car.service}</CarName>
                            <CarDuration>{`${rideDuration.toFixed(0)} minutes`}</CarDuration>
                        </CarDetails>
                        <CarPrice>{currency === 'ZAR' ? 'R' : '$'}{(rideDuration * car?.multiplier).toFixed(2)}</CarPrice>
                    </Car>
                ))}
            </CarList>
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
text-gray-500 text-center text-xs py-2 border-b
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
