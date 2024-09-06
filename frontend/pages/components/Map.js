import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import mapboxgl from '!mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ';

export const Map = (props) => {
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Function to get user's location
        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation([
                            position.coords.longitude,
                            position.coords.latitude
                        ]);
                    },
                    (error) => {
                        console.error('Error getting user location:', error);
                        // Fallback to default location (e.g., United States)
                        setUserLocation([-99.29011, 39.39172]);
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
                // Fallback to default location (e.g., United States)
                setUserLocation([-99.29011, 39.39172]);
            }
        };

        getUserLocation();

    }, []);

    useEffect(() => {
        if (userLocation) {
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/drakosi/ckvcwq3rwdw4314o3i2ho8tph',
                center: userLocation, // Set map center to user's location
                zoom: 12,
            });

            if (props.pickupCoordinates) {
                addToMap(map, props.pickupCoordinates);
            };

            if (props.dropoffCoordinates) {
                addToMap(map, props.dropoffCoordinates);
            };

            if (props.pickupCoordinates && props.dropoffCoordinates) {
                map.fitBounds([
                    props.pickupCoordinates, props.dropoffCoordinates
                ], {
                    padding: 60
                });
            };
        }
    }, [userLocation, props.pickupCoordinates, props.dropoffCoordinates]);

    const addToMap = (map, coordinates) => {
        new mapboxgl.Marker()
            .setLngLat(coordinates)
            .addTo(map);
    };

    return (
        <Wrapper id='map'>
            {/* Map container */}
        </Wrapper>
    );
};

export default Map;

const Wrapper = tw.div`
    flex-1 h-1/2
`;
