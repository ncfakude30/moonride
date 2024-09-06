import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import Image from 'next/image';
import { fetchRecentTrips } from '../api/app.service';

function RecentTrips({ user }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [hasMore, setHasMore] = useState(true); // To check if more trips are available

    const loadTrips = async (append = false) => {
        if (user) {
            try {
                setLoading(true);
                const fetchedTrips = await fetchRecentTrips(user?.id, lastEvaluatedKey);
                if (fetchedTrips.trips.length > 0) {
                    setTrips(prevTrips => append ? [...prevTrips, ...fetchedTrips.trips] : fetchedTrips.trips);
                }
                setLastEvaluatedKey(fetchedTrips.lastEvaluatedKey || null);
                setHasMore(!!fetchedTrips.lastEvaluatedKey); // Set to true if there's a key for more trips
            } catch (e) {
                setError('Failed to load trips');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrips();
    }, [user]);

    if (loading && trips.length === 0) {
        return <LoadingMessage>Loading trips...</LoadingMessage>;
    }

    return (
        <RecentTripsWrapper>
            <Title>Recent Trips</Title>
            {trips.length === 0 ? (
                <NoTripsMessage>Request a trip to see your recent travels!</NoTripsMessage>
            ) : (
                <>
                    {trips.map(trip => (
                        <TripCard key={trip.id}>
                            <TripDetails>
                                <Detail>
                                    <Label>Pickup:</Label>
                                    <Value>{trip.pickup}</Value>
                                </Detail>
                                <Detail>
                                    <Label>Dropoff:</Label>
                                    <Value>{trip.dropoff}</Value>
                                </Detail>
                                <Detail>
                                    <Label>Price:</Label>
                                    <Value>{trip.price}</Value>
                                </Detail>
                                <Detail>
                                    <Label>Time:</Label>
                                    <Value>{trip.time}</Value>
                                </Detail>
                                <Detail>
                                    <Label>Rating:</Label>
                                    <Value>{trip.rating} ★</Value>
                                </Detail>
                            </TripDetails>
                            <DriverProfile>
                                <Image src={trip.driverProfile} alt="Driver" width={50} height={50} className="rounded-full" />
                            </DriverProfile>
                        </TripCard>
                    ))}
                    {hasMore && (
                        <LoadMoreButton onClick={() => loadTrips(true)}>
                            Load More
                        </LoadMoreButton>
                    )}
                </>
            )}
        </RecentTripsWrapper>
    );
}

export default RecentTrips;

const RecentTripsWrapper = tw.div`
    flex flex-col space-y-2 p-4
`;

const Title = tw.h2`
    text-xl font-bold mb-2
`;

const TripCard = tw.div`
    flex items-center bg-white shadow-md rounded-lg p-3
`;

const TripDetails = tw.div`
    flex-1
`;

const Detail = tw.div`
    flex justify-between py-1
`;

const Label = tw.span`
    font-medium text-gray-600
`;

const Value = tw.span`
    text-gray-800
`;

const DriverProfile = tw.div`
    ml-4
`;

const LoadingMessage = tw.div`
    text-center text-gray-600 font-medium
`;

const NoTripsMessage = tw.div`
    text-center text-gray-600 font-medium
`;

const LoadMoreButton = tw.button`
    mt-4 bg-blue-500 text-white rounded p-2
`;
