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
    
    const { selectedCar, loading, pickupCoordinates, dropoffCoordinates} = useSelector(state => state.confirmation);
    const user = useSelector((state) => state.auth.user);
    const { pickup, dropoff} = useSelector(state => state.search);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } 
        if (!pickupCoordinates && !dropoffCoordinates) {
            getPickupCoordinates(pickup);
            getDropoffCoordinates(dropoff);
        }
    }, );

    useEffect(() => {
        if (pickupCoordinates?.length > 0 && dropoffCoordinates?.length > 0) {
            setLoading(false);
        }
    }, [pickupCoordinates, dropoffCoordinates, loading, selectedCar]);

    const getPickupCoordinates = async (pickup) => {
        try {
            dispatch(setLoading(true))
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${pickup}.json?` + 
                new URLSearchParams({
                    access_token: 'pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ',
                    limit: 1,
                })
            );
            const data = await response.json();
            if (data.features.length > 0) {
                dispatch(setPickupCoordinates(data.features[0].center));
            } else {
                console.error('No results found for pickup location');
            }
        } catch (error) {
            console.error('Error fetching pickup coordinates:', error);
        } finally{
            dispatch(setLoading(false))
        }
    };

    const getDropoffCoordinates = async (dropoff) => {
        try {
            dispatch(setLoading(true))
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${dropoff}.json?` + 
                new URLSearchParams({
                    access_token: 'pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ',
                    limit: 1,
                })
            );
            const data = await response.json();
            if (data.features.length > 0) {
                dispatch(setDropoffCoordinates(data.features[0].center));
            } else {
                console.error('No results found for dropoff location');
            }
        } catch (error) {
            console.error('Error fetching dropoff coordinates:', error);
        }
        finally{
            dispatch(setLoading(false))
        }
    };

    const handleSelectRide = (car) => {
        dispatch(setSelectedCar(car));
        router.push({
            pathname: '/payment',
        });
    };

    if (loading) return <p>Loading...</p>;

    return (
        <Wrapper>
            <BackButtonContainer>
                <Link href='/search'>
                    <BackButton>
                        <Image src='https://img.icons8.com/ios-filled/50/000000/left.png' alt='Back' layout='fill' />
                    </BackButton>
                </Link>
            </BackButtonContainer>
            <Map
                pickupCoordinates={pickupCoordinates}
                dropoffCoordinates={dropoffCoordinates}
            />
            <RideContainer>
                <RideSelector
                    pickupCoordinates={pickupCoordinates}
                    dropoffCoordinates={dropoffCoordinates}
                    onSelectRide={handleSelectRide}
                    loggedUser={user}
                />
                <ConfirmButtonContainer>
                    <ConfirmButton onClick={() => handleSelectRide(selectedCar)}>
                        Confirm UberX
                    </ConfirmButton>
                </ConfirmButtonContainer>
            </RideContainer>
        </Wrapper>
    );
}

export default Confirm;

const Wrapper = tw.div`
    flex h-screen flex-col
`;

const RideContainer = tw.div`
    flex flex-col flex-1 h-1/2
`;

const ConfirmButtonContainer = tw.div`
    border-t-2
`;

const ConfirmButton = tw.div`
    bg-black text-white my-4 mx-4 py-4 text-center text-xl
`;

const BackButtonContainer = tw.div`
    absolute rounded-full top-4 left-4 z-10 bg-white shadow-md cursor-pointer
`;

const BackButton = tw.div`
    relative h-12 w-12
`;
