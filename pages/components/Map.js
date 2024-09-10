import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import mapboxgl from '!mapbox-gl';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../contexts/WebSocketContext';

mapboxgl.accessToken = 'pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ';

const Map = () => {
    const pickupCoordinates = useSelector((state) => state.ride.pickupCoordinates);
    const dropoffCoordinates = useSelector((state) => state.ride.dropoffCoordinates);
    const [userLocation, setUserLocation] = useState(null);
    const [map, setMap] = useState(null);
    const {sendMessage, status, messages} = useSelector((state) => state.webSocket);

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
                    () => {
                        setUserLocation([-99.29011, 39.39172]); // Default to a central location
                    }
                );
            } else {
                setUserLocation([-99.29011, 39.39172]); // Default to a central location
            }
        };

        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            const mapInstance = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/drakosi/ckvcwq3rwdw4314o3i2ho8tph',
                center: userLocation,
                zoom: 12,
            });

            setMap(mapInstance);

            const addMarker = (coordinates) => {
                new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .addTo(mapInstance);
            };

            if (pickupCoordinates) {
                addMarker(pickupCoordinates);
            }

            if (dropoffCoordinates) {
                addMarker(dropoffCoordinates);
            }

            if (pickupCoordinates && dropoffCoordinates) {
                mapInstance.fitBounds([
                    pickupCoordinates, dropoffCoordinates
                ], { padding: 60 });
            }

            const handleWebSocketMessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.action === 'new_trip') {
                    if (data.pickup) {
                        addMarker(data.pickup);
                    }
                    if (data.dropoff) {
                        addMarker(data.dropoff);
                    }
                    if (data.pickup && data.dropoff) {
                        mapInstance.fitBounds([
                            data.pickup, data.dropoff
                        ], { padding: 60 });
                    }
                }
            };

            if(messages && messages?.length > 0) {
                messages.map((message) => {
                    handleWebSocketMessage(message)
                })
                
            }
           
            return () => {
                if (mapInstance) {
                    mapInstance.remove(); // Clean up map instance
                }
            };
        }
    }, [userLocation, pickupCoordinates, dropoffCoordinates, messages]);

    return <MapWrapper id='map' />;
};

export default Map;

const MapWrapper = tw.div`
    flex-1 h-full
`;
