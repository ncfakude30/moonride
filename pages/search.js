import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

mapboxgl.accessToken = 'pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ';

function Search() {
    const router = useRouter();
    const { user } = router.query;
    
    const [loggedUser, setUser] = useState(null);
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [map, setMap] = useState(null);
    const [pickupMarker, setPickupMarker] = useState(null);
    const [dropoffMarker, setDropoffMarker] = useState(null);
    
    useEffect(() => {
        if (!user) {
            setUser(null);
            router.push('/login');
        }

        setUser(JSON.parse(user));
        
        const mapContainer = document.getElementById('map');
        if (mapContainer && !map) {
            const newMap = new mapboxgl.Map({
                container: mapContainer,
                style: 'mapbox://styles/mapbox/satellite-v9',
                center: [-74.5, 40],
                zoom: 9,
            });

            const geocoder = new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                types: 'address',
                placeholder: 'Search for a location',
                mapboxgl: mapboxgl
            });

            geocoder.on('result', (e) => {
                const { place_name, center } = e.result;
                if (!pickupMarker) {
                    setPickup(place_name);
                    setPickupMarker(new mapboxgl.Marker({ color: 'blue' })
                        .setLngLat(center)
                        .addTo(newMap));
                    newMap.setCenter(center);
                } else {
                    setDropoff(place_name);
                    setDropoffMarker(new mapboxgl.Marker({ color: 'red' })
                        .setLngLat(center)
                        .addTo(newMap));
                }
            });

            newMap.addControl(geocoder);

            newMap.on('click', (e) => {
                if (!pickupMarker) {
                    setPickupMarker(new mapboxgl.Marker({ color: 'blue' })
                        .setLngLat(e.lngLat)
                        .addTo(newMap));
                    setPickup([e.lngLat.lng, e.lngLat.lat]);
                } else if (!dropoffMarker) {
                    setDropoffMarker(new mapboxgl.Marker({ color: 'red' })
                        .setLngLat(e.lngLat)
                        .addTo(newMap));
                    setDropoff([e.lngLat.lng, e.lngLat.lat]);
                }
            });

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    newMap.setCenter([longitude, latitude]);
                    newMap.setZoom(14);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );

            setMap(newMap);
        }
    }, [map, pickupMarker, dropoffMarker, user, router]);

    const handlePickupChange = (e) => {
        const value = e.target.value;
        setPickup(value);
    };

    const handleDropoffChange = (e) => {
        const value = e.target.value;
        setDropoff(value);
    };

    return (
        <Wrapper>
            <MapContainer id="map" />
            <InputContainer>
                <FromToIcons>
                    <Circle src='https://img.icons8.com/ios-filled/50/9CA3AF/filled-circle.png' />
                    <Line src='https://img.icons8.com/ios/50/9CA3AF/vertical-line.png' />
                    <Square src='https://img.icons8.com/windows/50/000000/square-full.png' />
                </FromToIcons>
                <InputBoxes>
                    <Input
                        placeholder='Enter pickup location'
                        value={pickup}
                        onChange={handlePickupChange}
                    />
                    <Input
                        placeholder='Where to?'
                        value={dropoff}
                        onChange={handleDropoffChange}
                    />
                </InputBoxes>
                <PlusIcon src='https://img.icons8.com/ios/50/000000/plus-math.png' />
            </InputContainer>
            <SavedPlaces>
                <StartIcon src='https://img.icons8.com/ios-filled/50/ffffff/star--v1.png' />
                Saved Places
            </SavedPlaces>
            <Link href={{
                pathname: '/confirm',
                query: {
                    pickup: pickupMarker ? pickupMarker.getLngLat().toArray().join(',') : pickup,
                    dropoff: dropoffMarker ? dropoffMarker.getLngLat().toArray().join(',') : dropoff,
                    user: JSON.stringify(loggedUser),
                }
            }}>
                <ConfirmContainer>
                    <ConfirmButton>Confirm Locations</ConfirmButton>
                </ConfirmContainer>
            </Link>
        </Wrapper>
    );
};

export default Search;

const Wrapper = tw.div`
    bg-gray-200 h-screen
`;

const MapContainer = tw.div`
    h-1/2 w-full
`;

const InputContainer = tw.div`
    bg-white flex items-center px-4 mb-2
`;

const FromToIcons = tw.div`
    w-10 flex flex-col mr-2 items-center
`;

const Circle = tw.img`
    h-2.5
`;

const Line = tw.img`
    h-10
`;

const Square = tw.img`
    h-3
`;

const InputBoxes = tw.div`
    flex flex-col flex-1
`;

const Input = tw.input`
    h-10 bg-gray-200 my-2 rounded-2 p-2 outline-none border-none ml-3
`;

const PlusIcon = tw.img`
    w-10 h-10 bg-gray-200 rounded-full ml-3
`;

const SavedPlaces = tw.div`
    flex items-center bg-white px-4 py-2
`;

const StartIcon = tw.img`
    bg-gray-400 w-10 h-10 p-2 rounded-full mr-2
`;

const ConfirmContainer = tw.div`
    bg-black text-white text-center mt-2 mx-4 px-4 py-3 text-2xl cursor-pointer
`;

const ConfirmButton = tw.div`
    text-white
`;
