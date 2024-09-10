// components/Search.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import Link from 'next/link';
import { loadGoogleMaps } from '../src/util/loadGoogleMaps'; // Import the utility
import { useSelector, useDispatch } from 'react-redux';
import { setPickup, setDropoff } from '../store/reducers/searchSlice'; // Adjust import according to your actions
import { setPickupCoordinates, setDropoffCoordinates } from '../store/reducers/confirmationSlice'; // Adjust import according to your actions

function Search() {
    const router = useRouter();

    const dispatch = useDispatch();
    const pickup = useSelector((state) => state.search.pickup);
    const dropoff = useSelector((state) => state.search.dropoff);
    const user = useSelector((state) => state.auth.user);

    const [map, setMap] = useState(null);
    const [pickupMarker, setPickupMarker] = useState(null);
    const [dropoffMarker, setDropoffMarker] = useState(null);
    const [userLocationMarker, setUserLocationMarker] = useState(null); // State for user's real-time location marker
    const [polyline, setPolyline] = useState(null); // State for polyline
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const initializeMap = async () => {
            const googleMaps = await loadGoogleMaps('AIzaSyAhU-s47LJFmxiPK4X5zD4oWfccyUN8kEU'); // Replace with your Google Maps API Key
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                const newMap = new googleMaps.Map(mapContainer, {
                    center: { lat: -34.397, lng: 150.644 },
                    zoom: 15, // Adjusted zoom level for better visibility
                });

                const autocompletePickup = new googleMaps.places.Autocomplete(
                    document.getElementById('pickup')
                );

                const autocompleteDropoff = new googleMaps.places.Autocomplete(
                    document.getElementById('dropoff')
                );

                autocompletePickup.addListener('place_changed', () => {
                    const place = autocompletePickup.getPlace();
                    if (place.geometry) {
                        dispatch(setPickup(place.formatted_address)); // Update Redux state
                        const marker = new googleMaps.Marker({
                            position: place.geometry.location,
                            map: newMap,
                            title: 'Pickup Location',
                        });
                        setPickupMarker(marker);
                        newMap.setCenter(place.geometry.location);
                        updatePolyline();
                    }
                });

                autocompleteDropoff.addListener('place_changed', () => {
                    const place = autocompleteDropoff.getPlace();
                    if (place.geometry) {
                        dispatch(setDropoff(place.formatted_address)); // Update Redux state
                        const marker = new googleMaps.Marker({
                            position: place.geometry.location,
                            map: newMap,
                            title: 'Dropoff Location',
                        });
                        setDropoffMarker(marker);
                        newMap.setCenter(place.geometry.location);
                        updatePolyline();
                    }
                });

                setMap(newMap);

                // Check if the Geolocation API is available
                if (navigator.geolocation) {
                    navigator.geolocation.watchPosition(
                        (position) => {
                            const userLatLng = new googleMaps.LatLng(
                                position.coords.latitude,
                                position.coords.longitude
                            );
                            if (userLocationMarker) {
                                userLocationMarker.setPosition(userLatLng);
                            } else {
                                const marker = new googleMaps.Marker({
                                    position: userLatLng,
                                    map: newMap,
                                    title: user?.displayName || 'Address',
                                    icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', // Custom icon
                                });
                                setUserLocationMarker(marker);
                            }
                            newMap.setCenter(userLatLng);
                        },
                        (error) => {
                            console.error('Error getting user location:', error);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0,
                        }
                    );
                } else {
                    console.error('Geolocation is not supported by this browser.');
                }
            }
        };

        if (!map) {
            initializeMap();
        }
    }, [map, pickupMarker, dropoffMarker, user, router, userLocationMarker, dispatch]);

    const updatePolyline = () => {
        const googleMaps = window.google.maps;
        if (pickupMarker && dropoffMarker) {
            const path = [
                pickupMarker.getPosition(),
                dropoffMarker.getPosition(),
            ];
            if (polyline) {
                polyline.setPath(path);
            } else {
                const newPolyline = new googleMaps.Polyline({
                    path: path,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    map: map,
                });
                setPolyline(newPolyline);
            }
        }
    };

    const handlePopupOpen = () => {
        setIsPopupOpen(true);
    };

    const handlePopupClose = () => {
        setIsPopupOpen(false);
    };

    // Extract coordinates for query parameters
    const pickupLocation = pickupMarker ? pickupMarker.getPosition() : null;
    const dropoffLocation = dropoffMarker ? dropoffMarker.getPosition() : null;

    dispatch(setPickupCoordinates([pickupLocation ? pickupLocation.lat() : '', pickupLocation ? pickupLocation.lng() : '']))
    dispatch(setDropoffCoordinates([dropoffLocation ? dropoffLocation.lat() : '', dropoffLocation ? dropoffLocation.lng() : '']))

    return (
        <Wrapper>
            <MapContainer id="map" />
            <Card>
                <InputContainer>
                    <FromToIcons>
                        <Circle src="https://img.icons8.com/ios-filled/50/9CA3AF/filled-circle.png" />
                        <Line src="https://img.icons8.com/ios/50/9CA3AF/vertical-line.png" />
                        <Square src="https://img.icons8.com/windows/50/000000/square-full.png" />
                    </FromToIcons>
                    <InputBoxes>
                        <Input
                            id="pickup"
                            placeholder="Pickup location"
                            value={pickup}
                            onChange={(e) => dispatch(setPickup(e.target.value))}
                        />
                        <Input
                            id="dropoff"
                            placeholder="Dropoff location"
                            value={dropoff}
                            onChange={(e) => dispatch(setDropoff(e.target.value))}
                        />
                    </InputBoxes>
                    <PlusIcon src="https://img.icons8.com/ios/50/000000/plus-math.png" onClick={handlePopupOpen} />
                </InputContainer>
                <Link
                    href={{
                        pathname: '/confirm'
                    }}
                >
                    <ConfirmContainer>
                        <ConfirmButton>Confirm Locations</ConfirmButton>
                    </ConfirmContainer>
                </Link>
            </Card>

            {isPopupOpen && (
                <PopupOverlay>
                    <PopupCard>
                        <PopupTitle>Coming Soon</PopupTitle>
                        <PopupContent>
                            We’re working hard to bring you this feature. Stay tuned for updates!
                        </PopupContent>
                        <CloseButton onClick={handlePopupClose}>Close</CloseButton>
                    </PopupCard>
                </PopupOverlay>
            )}
        </Wrapper>
    );
}

export default Search;

const Wrapper = tw.div`
    relative h-screen bg-gray-200
`;

const MapContainer = tw.div`
    absolute top-0 left-0 h-full w-full
`;

const Card = tw.div`
    absolute bottom-0 left-0 right-0 mb-4 mx-4 bg-white p-4 rounded-lg shadow-lg z-10
`;

const InputContainer = tw.div`
    bg-white flex items-center px-4 mb-2 rounded-lg shadow-md border border-gray-300
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
    h-12 bg-white text-gray-700 my-2 rounded-lg shadow-sm p-3 outline-none border border-gray-300
    placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition
`;

const PlusIcon = tw.img`
    w-12 h-12 bg-gray-200 rounded-full ml-3 p-2 cursor-pointer
`;

const ConfirmContainer = tw.div`
    flex justify-center items-center mt-2
`;

const ConfirmButton = tw.button`
    bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-full p-4 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
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