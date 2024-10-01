import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import Map from './components/Map';
import { useRouter } from 'next/router';
import RideSelector from './components/RideSelector';
import Link from 'next/link';
import Image from 'next/image';
import { setPickupCoordinates, setDropoffCoordinates, setSelectedCar, setLoading } from '../store/reducers/confirmationSlice';

function Confirm() {
    const router = useRouter();
    const dispatch = useDispatch();
    
    const { selectedCar, loading, pickupCoordinates, dropoffCoordinates } = useSelector(state => state.confirmation);
    const user = useSelector((state) => state.auth.user);
    const { pickup, dropoff } = useSelector(state => state.search);
    const [defaultCar, setDefaultCar] = useState(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } 
        if (!pickupCoordinates && !dropoffCoordinates) {
            getPickupCoordinates(pickup);
            getDropoffCoordinates(dropoff);
        }
    }, [user, router, pickupCoordinates, dropoffCoordinates, pickup, dropoff]);

    useEffect(() => {
        if (pickupCoordinates?.length > 0 && dropoffCoordinates?.length > 0) {
            setLoading(false);
        }
    }, [pickupCoordinates, dropoffCoordinates, loading]);

    useEffect(() => {
        if (defaultCar) {
            dispatch(setSelectedCar(defaultCar));
        }
    }, [defaultCar, dispatch]);

    const getPickupCoordinates = async (pickup) => {
        try {
            dispatch(setLoading(true));
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?` + 
                new URLSearchParams({
                    address: pickup,
                    key: process.env.GOOGLE_API_KEY || 'AIzaSyAhU-s47LJFmxiPK4X5zD4oWfccyUN8kEU',
                })
            );
            const data = await response.json();
            if (data.results.length > 0) {
                dispatch(setPickupCoordinates([
                    data.results[0].geometry.location.lat,
                    data.results[0].geometry.location.lng
                ]));
            } else {
                console.error('No results found for pickup location');
            }
        } catch(error) {
            console.error('Error fetching pickup coordinates:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getDropoffCoordinates = async (dropoff) => {
        try {
            dispatch(setLoading(true));
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?` + 
                new URLSearchParams({
                    address: dropoff,
                    key: process.env.GOOGLE_API_KEY || 'AIzaSyAhU-s47LJFmxiPK4X5zD4oWfccyUN8kEU',
                })
            );
            const data = await response.json();
            if (data.results.length > 0) {
                dispatch(setDropoffCoordinates([
                    data.results[0].geometry.location.lat,
                    data.results[0].geometry.location.lng
                ]));
            } else {
                console.error('No results found for dropoff location');
            }
        } catch(error) {
            console.error('Error fetching dropoff coordinates:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleSelectRide = (car) => {
        dispatch(setSelectedCar(car));
        setDefaultCar(car); // Set the default car when a car is selected
    };

    const handleConfirmClick = () => {
        if (selectedCar) {
            router.push('/payment');
        } else {
            alert('Please select a car before confirming.');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <Wrapper>
            <BackButtonContainer>
                <Link href='/search' passHref>
                    <BackButton>
                        <Image src='https://img.icons8.com/ios-filled/50/000000/left.png' alt='Back' layout='fill' />
                    </BackButton>
                    
                </Link>
            </BackButtonContainer>
            <Map
                pickupCoordinates={pickupCoordinates}
                dropoffCoordinates={dropoffCoordinates}
            />
            <Card>
                <RideContainer>
                    <RideSelector
                        pickupCoordinates={pickupCoordinates}
                        dropoffCoordinates={dropoffCoordinates}
                        onSelectRide={handleSelectRide}
                        loggedUser={user}
                    />
                    <ConfirmButtonContainer>
                        <ConfirmButton onClick={handleConfirmClick}>
                            {selectedCar ? `Confirm ${selectedCar.service}` : 'Confirm Ride'}
                        </ConfirmButton>
                    </ConfirmButtonContainer>
                </RideContainer>
            </Card>
        </Wrapper>
    );
}

export default Confirm;

const Wrapper = tw.div`
    flex h-screen flex-col rounded-lg shadow-lg
`;

const Card = tw.div`
    bg-white rounded-lg shadow-lg p-4 flex flex-col flex  h-1/2
`;

const RideContainer = tw.div`
    bg-white rounded-lg shadow-lg p-4 flex flex-col flex-1 h-1/2
`;

const ConfirmButtonContainer = tw.div`
    border-t-2
`;

const ConfirmButton = tw.div`
    bg-gradient-to-r from-gray-600 to-gray-400 text-white text-center rounded-full p-4 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-1 focus:ring-gray-600 focus:ring-opacity-25
`;

const BackButtonContainer = tw.div`
    absolute rounded-full top-4 left-4 z-10 bg-white shadow-md cursor-pointer
`;

const BackButton = tw.div`
    relative h-12 w-12
`;
