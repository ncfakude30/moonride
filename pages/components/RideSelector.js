import { useState, useEffect } from 'react';
import tw from 'tailwind-styled-components';
import { carList } from '../../data/carList';

const countryToCurrency = {
    'ZA': 'ZAR',
    'US': 'USD',
    // Add other countries and currencies here
};

const getCurrencyCode = (countryCode) => {
    return countryToCurrency[countryCode] || 'USD'; // Default to USD if not found
};

const getUserCountryCode = async () => {
    try {
        const response = await fetch('https://ipapi.co/country_code/');
        const countryCode = await response.text();
        return countryCode;
    } catch (error) {
        console.error('Error fetching country code:', error);
        return 'US'; // Default to US in case of an error
    }
};

function RideSelector({ pickupCoordinates, dropoffCoordinates, onSelectRide }) {
    const [rideDuration, setRideDuration] = useState(0);
    const [selectedCar, setSelectedCar] = useState(null);
    const [currency, setCurrency] = useState('USD');

    useEffect(() => {
        const fetchData = async () => {
            const countryCode = await getUserCountryCode();
            setCurrency(getCurrencyCode(countryCode));
        };

        fetchData();
    }, []);

    useEffect(() => {
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoordinates[0]},${pickupCoordinates[1]};${dropoffCoordinates[0]},${dropoffCoordinates[1]}?access_token=pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    setRideDuration(data.routes[0]?.duration / 60); // Convert duration from seconds to minutes
                }
            })
            .catch(err => console.error('Fetch error:', err));
    }, [pickupCoordinates, dropoffCoordinates]);

    const handleCarClick = (car) => {
        setSelectedCar(car);
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
                        isSelected={selectedCar?.service === car.service}
                    >
                        <CarImage src={car.imgUrl} />
                        <CarDetails>
                            <Service>{car.service}</Service>
                            <Time>5 min away</Time>
                        </CarDetails>
                        <Price>{currency === 'ZAR' ? 'R' : 'R'}{(rideDuration * car.multiplier).toFixed(2)}</Price>
                    </Car>
                ))}
            </CarList>
        </Wrapper>
    );
}

export default RideSelector;

const Wrapper = tw.div`
    flex-1 overflow-y-scroll flex flex-col
`;

const Title = tw.div`
    text-gray-500 text-center text-xs py-2 border-b
`;

const CarList = tw.div`
    overflow-y-scroll
`;

const Car = tw.div`
    flex p-4 items-center cursor-pointer
    ${(props) => props.isSelected && tw`bg-gray-200 border-2 border-blue-500`}
`;

const CarImage = tw.img`
    h-14 mr-4
`;

const CarDetails = tw.div`
    flex-1
`;

const Service = tw.div`
    font-medium
`;

const Time = tw.div`
    text-xs text-blue-500
`;

const Price = tw.div`
    text-sm
`;
