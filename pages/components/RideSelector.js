import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import { carList } from '../../data/carList';
import { setCurrency } from '../../store/actions/rideActions';
import { setDirectionResponse, setSelectedCar } from '../../store/reducers/confirmationSlice';
import {getDirections} from '../api/app.service';

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

    useEffect(() => {
        const fetchCurrency = async () => {
            const countryCode = await getUserCountryCode();
            dispatch(setCurrency(getCurrencyCode(countryCode)));
        };

        fetchCurrency();
    }, [dispatch]);

    useEffect(() => {
        console.log(`My coordinates : ${JSON.stringify({pickupCoordinates, dropoffCoordinates})}`)
        if (pickupCoordinates.length === 0 || dropoffCoordinates.length === 0) {
            return;
        }

        const fetchRideDuration = async () => {
            try {
               
                const response =  await getDirections({
                     origin : `${pickupCoordinates[0]},${pickupCoordinates[1]}`,
                    destination: `${dropoffCoordinates[0]},${dropoffCoordinates[1]}`,
                });

                dispatch(setDirectionResponse(response));
                // Google Maps Directions API
                //const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.GOOGLE_API_KEY || 'AIzaSyAhU-s47LJFmxiPK4X5zD4oWfccyUN8kEU'}`);
                console.log(`After call: ${JSON.stringify(response)}`)
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

    const handleCarClick = (car) => {
        dispatch(setSelectedCar(car));
        onSelectRide(car); // Notify parent component about the selected car
    };

    return (
        <Wrapper>
            <Title>Choose a ride, or swipe up for more</Title>
            <CarList>
                {carList.map((car, index) => (
                    <Car
                        key={index}
                        onClick={() => handleCarClick(car)}
                        selected={selectedCar?.service === car.service}
                    >
                        <CarImage src={car?.imgUrl} />
                        <CarDetails>
                            <CarName>{car.service}</CarName>
                            <CarPrice>{currency === 'ZAR' ? 'R' : '$'}{(rideDuration * car?.multiplier).toFixed(2)}</CarPrice>
                            <CarDuration>{`${rideDuration.toFixed(0)} minutes`}</CarDuration>
                        </CarDetails>
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

const Title = tw.h2`
    text-gray-500 text-center text-xs py-2 border-b
`;

const CarList = tw.div`
    overflow-y-scroll
`;

const Car = tw.div`
    flex items-center p-4 cursor-pointer
    ${({ selected }) => selected && tw`bg-gray-200 border-2 border-blue-500`}
`;

const CarImage = tw.img`
    h-14 mr-4 rounded-full object-cover mr-4
`;

const CarDetails = tw.div`
    flex-1
`;

const CarName = tw.h3`
    font-medium
`;

const CarPrice = tw.p`
    text-sm
`;

const CarDuration = tw.p`
    text-xs text-blue-500
`;
