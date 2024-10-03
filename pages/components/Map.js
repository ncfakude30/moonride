import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { useSelector } from 'react-redux';

const Map = () => {
    const [pickupCoordinates, setPickupCoordinates] = useState(null);
    const [dropoffCoordinates, setDropoffCoordinates] = useState(null);
    const { pickup, dropoff } = useSelector(state => state.search);
    const [userLocation, setUserLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);

    useEffect(() => {
        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setUserLocation(location);
                        if (!pickupCoordinates) {
                            setPickupCoordinates(location); // Set as pickup if not provided
                        }
                    },
                    () => {
                        const defaultLocation = {
                            lat: 39.39172,
                            lng: -99.29011,
                        };
                        setUserLocation(defaultLocation);
                        if (!pickupCoordinates) {
                            setPickupCoordinates(defaultLocation); // Set default if geolocation fails
                        }
                    }
                );
            } else {
                const defaultLocation = {
                    lat: 39.39172,
                    lng: -99.29011,
                };
                setUserLocation(defaultLocation);
                if (!pickupCoordinates) {
                    setPickupCoordinates(defaultLocation); // Set default if geolocation is not supported
                }
            }
        };

        getUserLocation();
    }, [pickupCoordinates]);

    useEffect(() => {
        const fetchCoordinates = async (address, setter) => {
            if (!address) return;
            try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY || 'AIzaSyAhU-s47LJFmxiPK4X5zD4oWfccyUN8kEU'}`);
                const data = await response.json();
                if (data.results.length > 0) {
                    const { lat, lng } = data.results[0].geometry.location;
                    setter({ lat, lng });
                }
            } catch (error) {
                console.error('Error fetching coordinates:', error);
            }
        };

        if (!pickupCoordinates && pickup) {
            fetchCoordinates(pickup, setPickupCoordinates);
        }

        if (!dropoffCoordinates && dropoff) {
            fetchCoordinates(dropoff, setDropoffCoordinates);
        }
    }, [pickup, dropoff, pickupCoordinates, dropoffCoordinates]);

    useEffect(() => {
        if (userLocation && pickupCoordinates && dropoffCoordinates) {
            if (typeof google !== 'undefined') {
                const mapInstance = new google.maps.Map(document.getElementById('map'), {
                    center: userLocation,
                    zoom: 12
                });

                const service = new google.maps.DirectionsService();
                const renderer = new google.maps.DirectionsRenderer();
                renderer.setMap(mapInstance);
                setDirectionsService(service);
                setDirectionsRenderer(renderer);

                // Add markers for pickup and dropoff
                const addMarker = (position, title) => {
                    new google.maps.Marker({
                        position,
                        map: mapInstance,
                        title
                    });
                };

                addMarker(pickupCoordinates, 'Pickup Location');
                addMarker(dropoffCoordinates, 'Dropoff Location');

                const request = {
                    origin: new google.maps.LatLng(pickupCoordinates.lat, pickupCoordinates.lng),
                    destination: new google.maps.LatLng(dropoffCoordinates.lat, dropoffCoordinates.lng),
                    travelMode: 'DRIVING'
                };

                service.route(request, (result, status) => {
                    if (status === 'OK') {
                        renderer.setDirections(result);
                        mapInstance.fitBounds(result.routes[0].bounds);
                    } else {
                        console.error('Error fetching directions:', status);
                    }
                });

                return () => {
                    if (mapInstance) {
                        mapInstance = null; // Clean up map instance
                    }
                };
            } else {
                console.error('Google Maps API is not loaded yet.');
            }
        }
    }, [userLocation, pickupCoordinates, dropoffCoordinates]);

    return <MapWrapper id="map" />;
};

export default Map;

const MapWrapper = tw.div`
    flex-1 h-full
`;
